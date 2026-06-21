import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(6, 'Enter your current password'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Must contain at least one letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  mobile_number: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>

export const editUserSchema = profileSchema.extend({
  role: z.enum(['Admin', 'User']),
  is_active: z.boolean(),
})

export type EditUserInput = z.infer<typeof editUserSchema>
