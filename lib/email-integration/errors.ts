export class EmailProviderError extends Error {
  constructor(message: string, public provider: string, public originalError?: any) {
    super(message);
    this.name = 'EmailProviderError';
  }
}

export class EmailAuthError extends EmailProviderError {
  constructor(message: string, provider: string, originalError?: any) {
    super(message, provider, originalError);
    this.name = 'EmailAuthError';
  }
}

export class EmailRateLimitError extends EmailProviderError {
  constructor(message: string, provider: string, public retryAfterSeconds?: number, originalError?: any) {
    super(message, provider, originalError);
    this.name = 'EmailRateLimitError';
  }
}

export class EmailTemporaryError extends EmailProviderError {
  constructor(message: string, provider: string, originalError?: any) {
    super(message, provider, originalError);
    this.name = 'EmailTemporaryError';
  }
}
