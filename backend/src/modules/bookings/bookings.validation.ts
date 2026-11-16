import { z } from 'zod';
import { HttpError } from '../../middleware/errors.js';

export const bookingInput = z.strictObject({
  campgroundId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
});
export const bookingUpdateInput = bookingInput.partial().refine(input => Object.keys(input).length > 0);
export type BookingInput = z.infer<typeof bookingInput>;

// UTC is only an arithmetic coordinate for calendar dates, not the stay's timezone.
function calendarDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return NaN;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return NaN;
  return date.getTime() / 86_400_000;
}

export function validateStay(checkIn: string, checkOut: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (name: string) => parts.find(value => value.type === name)!.value;
  const today = `${part('year').padStart(4, '0')}-${part('month')}-${part('day')}`;
  const start = calendarDay(checkIn);
  const end = calendarDay(checkOut);
  if (!Number.isFinite(start) || !Number.isFinite(end)
    || checkIn < today || end - start < 1 || end - start > 3) {
    throw new HttpError(400, 'Invalid booking dates');
  }
}
