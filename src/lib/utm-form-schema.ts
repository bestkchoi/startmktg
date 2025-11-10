import { z } from "zod";

export const utmSchema = z.object({
  baseUrl: z.string().url({ message: "유효한 URL이어야 합니다." }),
  utm_source: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9_]+$/, "소문자, 숫자, 언더스코어만 허용됩니다."),
  utm_medium: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9_]+$/, "소문자, 숫자, 언더스코어만 허용됩니다."),
  utm_campaign: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9_]+$/, "소문자, 숫자, 언더스코어만 허용됩니다."),
  utm_content: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  utm_term: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val))
});

export type UtmFormValues = z.infer<typeof utmSchema>;


