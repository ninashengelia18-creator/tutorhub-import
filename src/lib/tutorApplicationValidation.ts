import { z } from "zod";

const tutorApplicationBaseSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(100, "First name is too long."),
  lastName: z.string().trim().min(1, "Last name is required.").max(100, "Last name is too long."),
  email: z.string().trim().email("Please enter a valid email address.").max(255, "Email is too long."),
  password: z.string().min(6, "Password must be at least 6 characters.").max(128, "Password is too long."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
  phone: z.string().trim().max(50, "Phone number is too long.").optional().or(z.literal("")),
  country: z.string().trim().max(100, "Country is too long.").optional().or(z.literal("")),
  experience: z.string().trim().min(1, "Please select your teaching experience."),
  education: z.string().trim().max(255, "Education is too long.").optional().or(z.literal("")),
  certifications: z.string().trim().max(255, "Certifications are too long.").optional().or(z.literal("")),
  bio: z.string().trim().min(1, "About you is required.").max(2000, "About you is too long."),
  selectedSubjects: z.array(z.string().trim()).min(1, "Please select at least one subject."),
  hourlyRate: z
    .string()
    .trim()
    .min(1, "Price per lesson is required.")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, "Please enter a valid price per lesson."),
  nativeLanguage: z.string().trim().max(100, "Native language is too long.").optional().or(z.literal("")),
  otherLanguages: z.string().trim().max(255, "Languages spoken are too long.").optional().or(z.literal("")),
  availability: z.string().trim().min(1, "Please select your availability."),
  timezone: z.string().trim().max(100, "Timezone is too long.").optional().or(z.literal("")),
  aboutTeaching: z.string().trim().max(1500, "About teaching is too long.").optional().or(z.literal("")),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms before submitting." }),
  }),
});

export const tutorApplicationFieldSchemas = tutorApplicationBaseSchema.shape;

export const tutorApplicationSchema = tutorApplicationBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  }
);

export type TutorApplicationFormValues = z.infer<typeof tutorApplicationSchema>;

export function getTutorApplicationErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Please review the form and try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while submitting your application. Please try again.";
}
