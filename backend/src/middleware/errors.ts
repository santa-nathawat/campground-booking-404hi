import type { ErrorRequestHandler } from 'express';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ success: false, message: error.message });
  } else if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ success: false, message: 'Invalid JSON body' });
  } else if (error?.type === 'entity.too.large') {
    res.status(413).json({ success: false, message: 'Request body too large' });
  } else {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
