import type { RequestHandler } from 'express';
import { HttpError } from '../../middleware/errors.js';
import { bookingInput } from './bookings.validation.js';
import * as bookings from './bookings.service.js';

export const create: RequestHandler = async (req, res) => {
  const input = bookingInput.safeParse(req.body);
  if (!input.success) throw new HttpError(400, 'Invalid booking fields');
  const data = await bookings.createBooking(res.locals.user.id, input.data);
  res.status(201).json({ success: true, data });
};
