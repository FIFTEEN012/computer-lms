import * as z from "zod"

export const loginSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"),
})

export const createClassSchema = z.object({
  name: z.string().min(3, "ชื่อคลาสต้องมีความยาวอย่างน้อย 3 ตัวอักษร").max(100),
  description: z.string().optional(),
  class_code: z.string().min(4, "รหัสคลาสต้องมีความยาวอย่างน้อย 4 ตัวอักษร").max(20),
  academic_year: z.string().min(4, "กรุณาระบุปีการศึกษา"),
  semester: z.number().min(1).max(3),
})

export const createLessonSchema = z.object({
  title: z.string().min(3, "ชื่อบทเรียนต้องมีความยาวอย่างน้อย 3 ตัวอักษร").max(200),
  content: z.string().optional(),
  lesson_order: z.number().min(1),
  is_published: z.boolean().default(false),
})

export const createQuizSchema = z.object({
  title: z.string().min(3, "ชื่อแบบทดสอบต้องมีความยาวอย่างน้อย 3 ตัวอักษร").max(200),
  time_limit_minutes: z.number().min(1).optional(),
  max_attempts: z.number().min(1).default(1),
  is_published: z.boolean().default(false),
})

export const registerSchema = z.object({
  fullName: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล").max(100),
  email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร").regex(/[A-Z]/, "ต้องมีตัวอักษรภาษาอังกฤษตัวพิมพ์ใหญ่ตัวอย่างน้อย 1 ตัว").regex(/[0-9]/, "ต้องมีตัวเลขอย่างน้อย 1 ตัว"),
  confirmPassword: z.string(),
  role: z.enum(["teacher", "student"]),
  studentId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === 'student' && (!data.studentId || data.studentId.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "กรุณาระบุรหัสนักเรียน",
  path: ["studentId"],
})
