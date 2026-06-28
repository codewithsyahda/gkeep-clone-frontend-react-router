import { z } from 'zod';

export const SignupFormScheme = z.strictObject({
  fullname: z
    .string('Fullname must be a string value.')
    .trim()
    .min(1, 'Fullname must not be empty.')
    .max(128, 'Fullname must not more than 128 chars.'),
  email: z.email('Email format must be valid.'),
  password: z
    .string('Password must be a string value.')
    .min(8, 'Password must be at least 8 chars.'),
});

export const SigninFormScheme = z.strictObject({
  email: z.email('Email format must be valid.'),
  password: z
    .string('Password must be a string value.')
    .min(1, 'Password must not be empty.'),
});
