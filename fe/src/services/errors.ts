export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public requestPath?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UiShowError extends Error {
  constructor(
    public errorCode: string,
    message: string,
  ) {
    super(message);
    this.name = 'UiShowError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isUiShowError(err: unknown): err is { errorCode: string; message: string } {
  if (err instanceof UiShowError) return true;
  if (err && typeof err === 'object' && 'errorCode' in err && typeof (err as any).errorCode === 'string') {
    return true;
  }
  return false;
}
