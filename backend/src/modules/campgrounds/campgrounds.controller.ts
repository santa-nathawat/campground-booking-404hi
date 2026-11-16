import type { RequestHandler } from 'express';
import * as campgrounds from './campgrounds.service.js';

export const list: RequestHandler = async (_req, res) => {
  const data = await campgrounds.listCampgrounds();
  res.json({ success: true, count: data.length, data });
};

export const detail: RequestHandler<{ id: string }> = async (req, res) => {
  const data = await campgrounds.getCampground(req.params.id);
  res.json({ success: true, data });
};
