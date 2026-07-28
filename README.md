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

Copy `.env.example` to `.env` (or set these in your MCP client's env config) and provide exactly one credential:

| Variable | Description |
|---|---|
| `SDCLOUD_BASE_URL` | API base URL. Defaults to `https://api.sdcloud.juniperclouds.net/`. |
| `SDCLOUD_API_KEY` | API key, sent as the `x-api-key` header. |
| `SDCLOUD_OAUTH_TOKEN` | OAuth token, sent as the `x-oauth2-token` header. Takes precedence if both are set. |

## Running

```bash
npm run build
node dist/index.js
```

Or point an MCP client at `node /path/to/hpe-security-director-cloud-mcp/dist/index.js` with the env vars above.

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
