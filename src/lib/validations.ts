import * as z from "zod"

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const createClassSchema = z.object({
  name: z.string().min(3, "Class name must be at least 3 characters").max(100),
  description: z.string().optional(),
  class_code: z.string().min(4, "Code must be at least 4 characters").max(20),
  academic_year: z.string().min(4),
  semester: z.number().min(1).max(3),
})

export const createLessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  content: z.string().optional(),
  lesson_order: z.number().min(1),
  is_published: z.boolean().default(false),
})

export const createQuizSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  time_limit_minutes: z.number().min(1).optional(),
  max_attempts: z.number().min(1).default(1),
  is_published: z.boolean().default(false),
})

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Must contain at least one uppercase letter").regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
  role: z.enum(["teacher", "student"]),
  studentId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === 'student' && (!data.studentId || data.studentId.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Student ID is required for students",
  path: ["studentId"],
})
