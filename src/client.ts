import { SdCloudConfig } from './config.js';
import { SdCloudApiError } from './errors.js';
import { buildQuery } from './lib/query.js';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions {
  pathParams?: Record<string, string | number>;
  query?: Record<string, unknown>;
  body?: unknown;
}

export interface MultipartRequestOptions {
  pathParams?: Record<string, string | number>;
  form: FormData;
}

/**
 * Thin typed wrapper around the Security Director Cloud REST API.
 *
 * Callers supply the response/request types explicitly via the generic parameter,
 * typically sourced from `operations['<operationId>']` in `./generated/schema.js`,
 * since the spec does not name request/response schemas consistently enough to
 * derive them purely from the path string.
 */
export class SdCloudClient {
  constructor(private readonly cfg: SdCloudConfig) {}

  private headers(hasBody: boolean): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (this.cfg.oauthToken) {
      headers['x-oauth2-token'] = this.cfg.oauthToken;
    } else if (this.cfg.apiKey) {
      headers['x-api-key'] = this.cfg.apiKey;
    }
    if (hasBody) headers['Content-Type'] = 'application/json';
    return headers;
  }

  private resolvePath(path: string, pathParams?: Record<string, string | number>): string {
    let resolved = path;
    for (const [key, value] of Object.entries(pathParams ?? {})) {
      resolved = resolved.replace(`{${key}}`, encodeURIComponent(String(value)));
    }
    return resolved;
  }

  async request<TResponse>(
    method: HttpMethod,
    path: string,
    opts: RequestOptions = {},
  ): Promise<TResponse> {
    const resolvedPath = this.resolvePath(path, opts.pathParams);
    const qs = buildQuery(opts.query);
    const url = new URL(resolvedPath.replace(/^\//, '') + qs, this.cfg.baseUrl);

    const hasBody = opts.body !== undefined;
    const res = await fetch(url, {
      method,
      headers: this.headers(hasBody),
      body: hasBody ? JSON.stringify(opts.body) : undefined,
    });

    return this.handleResponse<TResponse>(res);
  }

  /** For the multipart/form-data endpoints (certificate/license/CSV/template file uploads). */
  async requestMultipart<TResponse>(
    method: 'POST' | 'PUT',
    path: string,
    opts: MultipartRequestOptions,
  ): Promise<TResponse> {
    const resolvedPath = this.resolvePath(path, opts.pathParams);
    const url = new URL(resolvedPath.replace(/^\//, ''), this.cfg.baseUrl);

    const res = await fetch(url, {
      method,
      headers: this.headers(false),
      body: opts.form,
    });

    return this.handleResponse<TResponse>(res);
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    const contentLength = res.headers.get('content-length');
    if (res.status === 204 || contentLength === '0') {
      if (!res.ok) throw new SdCloudApiError(res.status, undefined, res.statusText);
      return undefined as T;
    }

    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const errBody = data as { code?: number | string; message?: string; details?: unknown[] } | undefined;
      const message = errBody?.message || res.statusText || `HTTP ${res.status}`;
      throw new SdCloudApiError(res.status, errBody?.code, message, errBody?.details ?? []);
    }

    return data as T;
  }
}
