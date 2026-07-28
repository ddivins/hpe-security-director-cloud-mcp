export class SdCloudApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: number | string | undefined,
    message: string,
    public readonly details: unknown[] = [],
  ) {
    super(message);
    this.name = 'SdCloudApiError';
  }
}
