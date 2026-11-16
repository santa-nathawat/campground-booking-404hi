import mongoose from 'mongoose';
import { HttpError } from '../../middleware/errors.js';
import { publicCampground, type CampgroundFields } from '../campgrounds/campground.model.js';
import { getCampground } from '../campgrounds/campgrounds.service.js';
import { Booking } from './booking.model.js';
import { bookingUpdateInput, validateStay, type BookingInput } from './bookings.validation.js';

type PopulatedCampground = { campground: (CampgroundFields & { _id: unknown }) | null };
type PublicBookingSource = {
  _id: unknown; owner: unknown; checkIn: string; checkOut: string;
} & PopulatedCampground;

// Explicit serialization keeps account details and unexpected stored fields private.
function publicBooking(booking: PublicBookingSource) {
  if (!booking.campground) throw new HttpError(404, 'Campground not found');
  return {
    id: String(booking._id),
    ownerId: String(booking.owner),
    campground: publicCampground(booking.campground),
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
  };
}

async function ownedBooking(id: string, ownerId: string) {
  if (!mongoose.isObjectIdOrHexString(id)) throw new HttpError(400, 'Invalid booking identifier');
  const booking = await Booking.findById(id);
  if (!booking) throw new HttpError(404, 'Booking not found');
  if (String(booking.owner) !== ownerId) throw new HttpError(403, 'Booking access denied');
  return booking;
}

export async function createBooking(ownerId: string, input: BookingInput) {
  validateStay(input.checkIn, input.checkOut);
  await getCampground(input.campgroundId);
  const booking = await Booking.create({
    owner: ownerId, campground: input.campgroundId, checkIn: input.checkIn, checkOut: input.checkOut,
  });
  return publicBooking(await booking.populate<PopulatedCampground>('campground'));
}

export async function listBookings(ownerId: string) {
  const bookings = await Booking.find({ owner: ownerId }).sort({ _id: 1 })
    .populate<PopulatedCampground>('campground');
  return bookings.map(publicBooking);
}

export async function getBooking(id: string, ownerId: string) {
  const booking = await ownedBooking(id, ownerId);
  return publicBooking(await booking.populate<PopulatedCampground>('campground'));
}

export async function updateBooking(id: string, ownerId: string, body: unknown) {
  const booking = await ownedBooking(id, ownerId);
  const input = bookingUpdateInput.safeParse(body);
  if (!input.success) throw new HttpError(400, 'Invalid booking fields');
  const checkIn = input.data.checkIn ?? booking.checkIn;
  const checkOut = input.data.checkOut ?? booking.checkOut;
  validateStay(checkIn, checkOut);
  const campgroundId = input.data.campgroundId ?? String(booking.campground);
  await getCampground(campgroundId);
  // Write the entire validated stay together, including dates omitted by the caller.
  const updated = await Booking.findOneAndUpdate({ _id: booking._id, owner: ownerId }, {
    $set: { campground: campgroundId, checkIn, checkOut },
  }, { returnDocument: 'after', runValidators: true }).populate<PopulatedCampground>('campground');
  if (!updated) throw new HttpError(404, 'Booking not found');
  return publicBooking(updated);
}

export async function deleteBooking(id: string, ownerId: string) {
  const booking = await ownedBooking(id, ownerId);
  const result = await Booking.deleteOne({ _id: booking._id, owner: ownerId });
  if (result.deletedCount === 0) throw new HttpError(404, 'Booking not found');
}
