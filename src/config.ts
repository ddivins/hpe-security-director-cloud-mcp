export interface SdCloudConfig {
  baseUrl: string;
  apiKey?: string;
  oauthToken?: string;
}

const DEFAULT_BASE_URL = 'https://api.sdcloud.juniperclouds.net/';

export function loadConfig(env: NodeJS.ProcessEnv = process.env): SdCloudConfig {
  const apiKey = env.SDCLOUD_API_KEY?.trim() || undefined;
  const oauthToken = env.SDCLOUD_OAUTH_TOKEN?.trim() || undefined;

  if (!apiKey && !oauthToken) {
    throw new Error(
      'Missing credentials: set SDCLOUD_API_KEY or SDCLOUD_OAUTH_TOKEN in the environment.',
    );
  }

  const baseUrl = env.SDCLOUD_BASE_URL?.trim() || DEFAULT_BASE_URL;

  return {
    baseUrl: baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`,
    apiKey,
    oauthToken,
  };
}
