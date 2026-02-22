import { z } from 'zod/v4';

export const addChildSchema = z.object({
  displayName: z.string().min(1, 'Name is required').max(50),
  dateOfBirth: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  pin: z
    .string()
    .regex(/^\d{4}$/, 'PIN must be 4 digits')
    .optional(),
});

export const updateChildSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  dateOfBirth: z.string().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const setChildPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, 'PIN must be 4 digits'),
});

export const removeChildPinSchema = z.object({});

export const childLoginSchema = z.object({
  childProfileId: z.string().min(1, 'Child profile is required'),
  pin: z.string().optional(),
});

export const updateFamilySchema = z.object({
  familyName: z.string().min(1, 'Family name is required').max(50),
});

export type AddChildInput = z.infer<typeof addChildSchema>;
export type UpdateChildInput = z.infer<typeof updateChildSchema>;
export type SetChildPinInput = z.infer<typeof setChildPinSchema>;
export type ChildLoginInput = z.infer<typeof childLoginSchema>;
export type UpdateFamilyInput = z.infer<typeof updateFamilySchema>;
