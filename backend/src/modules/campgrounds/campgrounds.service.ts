import mongoose from 'mongoose';
import { HttpError } from '../../middleware/errors.js';
import { Campground, publicCampground } from './campground.model.js';

export async function listCampgrounds() {
  const campgrounds = await Campground.find().sort({ _id: 1 });
  return campgrounds.map(publicCampground);
}

export async function getCampground(id: string) {
  if (!mongoose.isObjectIdOrHexString(id)) throw new HttpError(400, 'Invalid campground identifier');
  const campground = await Campground.findById(id);
  if (!campground) throw new HttpError(404, 'Campground not found');
  return publicCampground(campground);
}

export async function createCampground(input: { name: string; address: string; telephone: string }) {
  return publicCampground(await Campground.create(input));
}
