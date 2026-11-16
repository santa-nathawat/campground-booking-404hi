import { z } from 'zod';

const contact = z.string().trim().min(1);
const email = z.string().trim().toLowerCase().email();
const password = z.string().min(8).refine(value => Buffer.byteLength(value) <= 72);
export const registration = z.strictObject({ name: contact, telephone: contact, email, password });
export const credentials = z.strictObject({
  email,
  password: z.string().min(1).refine(value => Buffer.byteLength(value) <= 72),
});
