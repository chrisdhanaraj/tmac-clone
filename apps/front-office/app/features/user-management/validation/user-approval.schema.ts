import { z } from "zod";

// Schema for user approval (single or bulk)
export const UserApprovalSchema = z.object({
  userIds: z
    .array(z.string().uuid("Invalid user ID format"))
    .min(1, "At least one user must be selected")
    .max(100, "Cannot approve more than 100 users at once"),
});

// Schema for user listing query parameters
export const UserListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(10).max(100).default(50),
  search: z.string().optional(),
  approved: z.enum(["true", "false", "all"]).optional().default("all"),
  sortBy: z
    .enum([
      "email",
      "firstName",
      "lastName",
      "createdAt",
      "updatedAt",
      "approved",
    ])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Schema for user data display
export const UserDisplaySchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string().email(),
  approved: z.boolean(),
  emailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for paginated response
export const PaginatedUsersSchema = z.object({
  users: z.array(UserDisplaySchema),
  pagination: z.object({
    currentPage: z.number().min(1),
    pageSize: z.number().min(10).max(100),
    totalPages: z.number().min(0),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
  totalCount: z.number().min(0),
});

// Schema for approval response
export const ApprovalResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  results: z.array(
    z.object({
      userId: z.string().uuid(),
      success: z.boolean(),
      error: z.string().optional(),
      emailSent: z.boolean(),
    })
  ),
  approvedCount: z.number().min(0),
  failedCount: z.number().min(0),
});

// Type exports for TypeScript
export type UserApproval = z.infer<typeof UserApprovalSchema>;
export type UserListQuery = z.infer<typeof UserListQuerySchema>;
export type UserDisplay = z.infer<typeof UserDisplaySchema>;
export type PaginatedUsers = z.infer<typeof PaginatedUsersSchema>;
export type PaginationInfo = PaginatedUsers["pagination"];
export type ApprovalResponse = z.infer<typeof ApprovalResponseSchema>;
