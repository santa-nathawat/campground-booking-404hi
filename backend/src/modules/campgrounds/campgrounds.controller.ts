import type { RequestHandler } from 'express';
import { z } from 'zod';
import { HttpError } from '../../middleware/errors.js';
import * as campgrounds from './campgrounds.service.js';

export const list: RequestHandler = async (_req, res) => {
  const data = await campgrounds.listCampgrounds();
  res.json({ success: true, count: data.length, data });
};

export const detail: RequestHandler<{ id: string }> = async (req, res) => {
  const data = await campgrounds.getCampground(req.params.id);
  res.json({ success: true, data });
};

const contact = z.string().trim().min(1);
const campgroundInput = z.strictObject({ name: contact, address: contact, telephone: contact });

export const create: RequestHandler = async (req, res) => {
  const input = campgroundInput.safeParse(req.body);
  if (!input.success) throw new HttpError(400, 'Invalid campground fields');
  const data = await campgrounds.createCampground(input.data);
  res.status(201).json({ success: true, data });
};
