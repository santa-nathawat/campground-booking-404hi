import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  telephone: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
});

userSchema.set('toJSON', {
  transform: (_doc, value) => {
    const { passwordHash: _hash, ...safe } = value;
    return safe;
  },
});

export const User = model('User', userSchema);
export type UserFields = InferSchemaType<typeof userSchema>;

export function publicUser(user: UserFields & { _id: unknown }) {
  return {
    id: String(user._id),
    name: user.name,
    telephone: user.telephone,
    email: user.email,
    role: user.role,
  };
}
