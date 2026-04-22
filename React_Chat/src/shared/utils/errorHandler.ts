

/**
 * API Error response handler
 */
export interface ApiError {
  message?: string;
  error?: string;
  statusCode?: number;
  details?: any;
}

/**
 * Format error message from API response
 */
export const formatErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    return (
      apiError.message ||
      apiError.error ||
      'An error occurred. Please try again.'
    );
  }

  return 'An unexpected error occurred.';
};

/**
 * Check if error is authentication-related
 */
export const isAuthError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    return (
      apiError.statusCode === 401 ||
      apiError.error === 'UNAUTHORIZED' ||
      (apiError.message?.toLowerCase().includes('unauthorized') ?? false)
    );
  }
  return false;
};

/**
 * Check if error is validation-related
 */
export const isValidationError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    return (
      apiError.statusCode === 400 ||
      apiError.error === 'VALIDATION_ERROR' ||
      (apiError.message?.toLowerCase().includes('invalid') ?? false)
    );
  }
  return false;
};

/**
 * Check if error is rate limit
 */
export const isRateLimitError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    return (
      apiError.statusCode === 429 ||
      apiError.error === 'RATE_LIMITED'
    );
  }
  return false;
};

export default {
  formatErrorMessage,
  isAuthError,
  isValidationError,
  isRateLimitError,
};
