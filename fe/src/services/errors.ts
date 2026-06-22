export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: any;

  constructor(message: string, code: string, statusCode?: number, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Set prototype explicitly to ensure instanceof works properly in TS/ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class HttpError extends AppError {
  constructor(message: string, code: string, statusCode: number, details?: any) {
    super(message, code, statusCode, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}
