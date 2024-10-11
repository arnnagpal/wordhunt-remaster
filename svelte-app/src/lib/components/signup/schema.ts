
import { z } from "zod";

export const formSchema = z.object({
    display_name: z.string().min(2).max(16),
    email: z.string().email(),
    username: z.string().min(2).max(50).regex(/^[a-zA-Z0-9.-]*$/, "Special letters allowed: .-_"),
    password: z.string().min(8).max(50),
    confirm_password: z.string().min(8).max(50),
    accept_terms: z.boolean(),
})    .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});

export type FormSchema = typeof formSchema;

