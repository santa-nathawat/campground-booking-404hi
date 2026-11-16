import { Schema, model } from 'mongoose';

const bookingSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  campground: { type: Schema.Types.ObjectId, ref: 'Campground', required: true },
  checkIn: { type: String, required: true },
  checkOut: { type: String, required: true },
});

export const Booking = model('Booking', bookingSchema);
