# hpe-security-director-cloud-mcp

An MCP (Model Context Protocol) server for HPE Juniper Security Director Cloud, built by Claude Code directly
against the live OpenAPI spec (`spec/openapi.json`, vendored from
[the published spec](https://www.juniper.net/documentation/us/en/software/sd-cloud/api/static/exports/security-director-cloud-apis-openapi3json.json)).

Covers the full API surface: **368 tools** across firewall policies, NAT policies, cross-policy deploy/preview/cleanup
jobs, ~30 typed security-object resources (addresses, applications, services, SSL/ICAP/AV/AS/content-filtering
profiles, etc.), IDP (IPS profiles/rules/signatures), device inventory, device/tenant license & certificate
management, templates, and the `/api/v2` tenant-admin surface (sites, tunnels, users/roles, IPsec profiles).

> **⚠️ Use with caution.** This is a best-effort implementation, generated at scale from the OpenAPI spec and
> not exhaustively tested against a live tenant. It exposes destructive and infrastructure-affecting operations —
> deleting policies/rules/objects, deploying and cleaning up firewall/NAT policies, rebooting or removing
> devices, installing licenses and certificates, changing passwords, and more — directly against your real
> Security Director Cloud environment, with no confirmation or dry-run step of its own. A malformed request, an
> LLM-driven mistake, or an edge case in a spec-derived schema can misconfigure or break your environment. Review
> what a tool call will do before approving it, test against a non-production tenant first if you have one, and
> don't grant it credentials for an environment you can't afford to have altered.

## Setup

```bash
npm install
npm run generate:types   # regenerate src/generated/schema.d.ts from spec/openapi.json (only needed if the spec changes)
npm run build
```

## Configuration

### Single Org (Direct .env)

Copy `.env.example` to `.env` (or set these in your MCP client's env config) and provide exactly one credential:

| Variable | Description |
|---|---|
| `SDCLOUD_BASE_URL` | API base URL. Defaults to `https://api.sdcloud.juniperclouds.net/`. |
| `SDCLOUD_API_KEY` | API key, sent as the `x-api-key` header. |
| `SDCLOUD_OAUTH_TOKEN` | OAuth token, sent as the `x-oauth2-token` header. Takes precedence if both are set. |

### Multiple Orgs (Claude Desktop)

To query across multiple Security Director Cloud organizations (e.g., Lab, Production, test tenants), register multiple MCP server instances in Claude Desktop's config file, each with its own API key.

**Edit** `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hpe-sd-cloud-lab": {
      "command": "node",
      "args": ["/path/to/hpe-security-director-cloud-mcp/dist/index.js"],
      "env": {
        "SDCLOUD_API_KEY": "your_lab_api_key_here"
      }
    },
    "hpe-sd-cloud-prod": {
      "command": "node",
      "args": ["/path/to/hpe-security-director-cloud-mcp/dist/index.js"],
      "env": {
        "SDCLOUD_API_KEY": "your_prod_api_key_here"
      }
    },
    "hpe-sd-cloud-test-1": {
      "command": "node",
      "args": ["/path/to/hpe-security-director-cloud-mcp/dist/index.js"],
      "env": {
        "SDCLOUD_API_KEY": "your_test1_api_key_here"
      }
    }
  }
}
```

Each server instance:
- Has a unique `mcpServers` key (e.g., `hpe-sd-cloud-lab`, `hpe-sd-cloud-prod`) — this is how you identify it in Claude
- Points to the same built server binary (`dist/index.js`)
- Passes a different API key via the `env` section

In Claude, tools will appear prefixed by org name:
- `hpe-sd-cloud-lab::sdcloud_list_devices` — query Lab devices
- `hpe-sd-cloud-prod::sdcloud_list_devices` — query Prod devices
- `hpe-sd-cloud-test-1::sdcloud_list_devices` — query Test 1 devices

You can now ask Claude to compare policies, licenses, or device state across orgs, or to bulk-deploy configurations to multiple tenants simultaneously.

## Running

```bash
npm run build
node dist/index.js
```

Or point an MCP client at `node /path/to/hpe-security-director-cloud-mcp/dist/index.js` with the env vars above.

## Audit Logging

All tool calls are automatically logged to `./logs/audit-YYYY-MM-DD.jsonl` (daily rotation). Logs include:
- **Tool called** and **org queried**
- **Status** (success/error)
- **Duration** and **response size**
- **Hashed parameters** (HMAC-redacted to avoid logging cleartext resource IDs or credentials)
- **Request ID** for tracing

**Example audit log entry:**
```json
{
  "timestamp": "2026-09-21T14:32:10.123Z",
  "tool": "hpe-sd-cloud-lab__sdcloud_list_devices",
  "org": "hpe-sd-cloud-lab",
  "status": "success",
  "parameters_hash": "a1b2c3d4e5f6g7h8",
  "response_size_bytes": 4521,
  "duration_ms": 342,
  "request_id": "f7a8b9c0d1e2f3g4"
}
```

**Configure logging** via env vars:

| Variable | Default | Description |
|---|---|---|
| `SDCLOUD_LOG_DIR` | `./logs` | Directory for audit logs. Ensure it exists and is writable. |
| `SDCLOUD_LOG_LEVEL` | `info` | Verbosity: `info` or `debug`. Debug logs to stderr on each call. |
| `SDCLOUD_LOG_HMAC_KEY` | `default-insecure-key-...` | Secret key for hashing parameters. **Change this in production.** |

**Security notes:**
- Logs never contain cleartext credentials or resource UUIDs — only HMAC hashes.
- Logs are appended to JSONL files; implement external rotation or archive as needed.
- The HMAC key should be a strong random secret in production environments. Regenerate keys if you suspect compromise.
- For compliance, store audit logs in a tamper-evident location separate from the server.

## Architecture

- `src/client.ts` — shared HTTP client (`request` for JSON, `requestMultipart` for the 5 file-upload endpoints).
- `src/generated/schema.d.ts` — generated from the vendored spec via `openapi-typescript`; not hand-edited.
- `src/tools/**` — one module per resource domain, each exporting `register<Domain>Tools(server, client)`,
  aggregated in `src/index.ts`. Tool names are prefixed `sdcloud_`.
- Most create/update tools accept a generic `body` object (validated as a JSON record, not a fully-typed schema)
  since many resources have large, deeply-nested request bodies — consult `spec/openapi.json` for the exact
  shape of a given resource's `*Input` schema when constructing a body.

## Notes

- Response envelopes differ by API version: `/api/v1/*` list endpoints return `{ items, count }`; `/api/v2/*`
  list endpoints use resource-specific field names (e.g. `{ sites, total }`, `{ users, user_count }`).
- Pagination params also differ: `/api/v1/*` uses `from`/`size`/`filters`/`sortby`/`count`; `/api/v2/*` uses
  `spec.from`/`spec.size` with no filter/sort support (and some `/api/v2/*` list endpoints take no pagination
  params at all).
- `sdcloud_change_password` (from `/api/v2/change-password`) mutates the authenticated user's own credentials —
  use with care.
