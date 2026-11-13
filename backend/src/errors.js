export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function databaseError(error) {
  const code = typeof error?.code === 'string' ? error.code : '';
  const unavailable = /^(08|28|53)/.test(code)
    || ['3D000', '57P01', '57P02', '57P03', '57014', 'ECONNREFUSED', 'ECONNRESET',
      'ETIMEDOUT', 'EPIPE', 'ENOTFOUND', 'EAI_AGAIN'].includes(code)
    // pg pool acquisition/query timeouts do not always have an error code.
    || /timeout|timed out|connection terminated/i.test(error?.message ?? '');
  return unavailable
    ? new HttpError(503, 'DATABASE_UNAVAILABLE', 'Database sementara tidak tersedia.')
    : new HttpError(500, 'INTERNAL_ERROR', 'Terjadi kesalahan internal.');
}

export function errorBody(error) {
  return { error: { code: error.code, message: error.message } };
}
