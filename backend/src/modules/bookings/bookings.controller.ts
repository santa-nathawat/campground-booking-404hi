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

export const list: RequestHandler = async (_req, res) => {
  const data = await bookings.listBookings(res.locals.user);
  res.json({ success: true, count: data.length, data });
};

export const detail: RequestHandler<{ id: string }> = async (req, res) => {
  const data = await bookings.getBooking(req.params.id, res.locals.user);
  res.json({ success: true, data });
};

export const update: RequestHandler<{ id: string }> = async (req, res) => {
  const data = await bookings.updateBooking(req.params.id, res.locals.user, req.body);
  res.json({ success: true, data });
};

export const remove: RequestHandler<{ id: string }> = async (req, res) => {
  await bookings.deleteBooking(req.params.id, res.locals.user);
  res.json({ success: true, data: {} });
};
