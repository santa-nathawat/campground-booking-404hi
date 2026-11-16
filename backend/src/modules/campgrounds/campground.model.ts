import { Schema, model, type InferSchemaType } from 'mongoose';

const campgroundSchema = new Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  telephone: { type: String, required: true, trim: true },
});

export const Campground = model('Campground', campgroundSchema);
export type CampgroundFields = InferSchemaType<typeof campgroundSchema>;

export function publicCampground(campground: CampgroundFields & { _id: unknown }) {
  return {
    id: String(campground._id),
    name: campground.name,
    address: campground.address,
    telephone: campground.telephone,
  };
}
