import { HttpError } from '../../middleware/errors.js';
import { Campground, publicCampground } from '../campgrounds/campground.model.js';
import { getCampground } from '../campgrounds/campgrounds.service.js';
import { Booking } from './booking.model.js';
import { validateStay, type BookingInput } from './bookings.validation.js';

// Explicit serialization keeps account details and unexpected stored fields private.
async function publicBooking(booking: InstanceType<typeof Booking>) {
  const campground = await Campground.findById(booking.campground);
  if (!campground) throw new HttpError(404, 'Campground not found');
  return {
    id: booking.id as string,
    ownerId: String(booking.owner),
    campground: publicCampground(campground),
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
  };
}

export async function createBooking(ownerId: string, input: BookingInput) {
  validateStay(input.checkIn, input.checkOut);
  await getCampground(input.campgroundId);
  const booking = await Booking.create({
    owner: ownerId, campground: input.campgroundId, checkIn: input.checkIn, checkOut: input.checkOut,
  });
  return publicBooking(booking);
}
