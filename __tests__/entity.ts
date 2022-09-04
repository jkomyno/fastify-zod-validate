import { z } from 'zod'

export const UserBody = z
  .object({
    username: z.string().min(5).max(10),
    balance: z.number().min(1000),
  })
  .strict()
export type UserBody = z.infer<typeof UserBody>

export const UserPathParams = z
  .object({
    userID: z.string().min(4).max(4),
  })
  .strict()
export type UserPathParams = z.infer<typeof UserPathParams>

export const UserQueryParams = z
  .object({
    force: z.union([z.literal('true'), z.literal('false')]).transform((v) => v === 'true'),
  })
  .strict()
export type UserQueryParams = z.infer<typeof UserQueryParams>
