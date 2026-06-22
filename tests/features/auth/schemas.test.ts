import { describe, expect, it } from 'vitest'

import {
  loginSchema,
  changePasswordSchema,
  profileSchema,
  editUserSchema,
} from '@/features/auth/schemas'

describe('login schema', () => {
  it('rejects empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'something' })
    expect(result.success).toBe(false)
  })

  it('rejects malformed email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'something',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '12345' })
    expect(result.success).toBe(false)
  })

  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'admin@wslny.com',
      password: 'StrongPass123!',
    })
    expect(result.success).toBe(true)
  })
})

describe('changePassword schema', () => {
  it('requires confirmation to match new password', () => {
    const result = changePasswordSchema.safeParse({
      current_password: 'OldPass123!',
      new_password: 'NewPass456!',
      confirm_password: 'DifferentPass789!',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('confirm_password')
    }
  })

  it('requires at least one letter and one number in the new password', () => {
    const result = changePasswordSchema.safeParse({
      current_password: 'OldPass123!',
      new_password: 'onlyletters',
      confirm_password: 'onlyletters',
    })
    expect(result.success).toBe(false)
  })

  it('accepts a valid password change', () => {
    const result = changePasswordSchema.safeParse({
      current_password: 'OldPass123!',
      new_password: 'NewPass456!',
      confirm_password: 'NewPass456!',
    })
    expect(result.success).toBe(true)
  })
})

describe('profile schema', () => {
  it('requires first and last name', () => {
    const result = profileSchema.safeParse({ first_name: '', last_name: '' })
    expect(result.success).toBe(false)
  })

  it('accepts optional fields', () => {
    const result = profileSchema.safeParse({
      first_name: 'Ali',
      last_name: 'Hassan',
    })
    expect(result.success).toBe(true)
  })
})

describe('editUser schema (admin only)', () => {
  it('rejects role values other than Admin / User', () => {
    const result = editUserSchema.safeParse({
      first_name: 'Ali',
      last_name: 'Hassan',
      role: 'superuser',
      is_active: true,
    })
    expect(result.success).toBe(false)
  })

  it('accepts Admin and User role values (case-sensitive)', () => {
    expect(
      editUserSchema.safeParse({
        first_name: 'Ali',
        last_name: 'Hassan',
        role: 'Admin',
        is_active: true,
      }).success,
    ).toBe(true)
    expect(
      editUserSchema.safeParse({
        first_name: 'Ali',
        last_name: 'Hassan',
        role: 'User',
        is_active: true,
      }).success,
    ).toBe(true)
    expect(
      editUserSchema.safeParse({
        first_name: 'Ali',
        last_name: 'Hassan',
        role: 'admin',
        is_active: true,
      }).success,
    ).toBe(false)
  })
})
