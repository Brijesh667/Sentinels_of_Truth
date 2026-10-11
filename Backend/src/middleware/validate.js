import { z } from "zod";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0]?.message || "Validation failed" });
  }
  req.body = result.data;
  next();
};

export const querySchema = z.object({
  query: z
    .string({ required_error: "query is required" })
    .trim()
    .min(3, "Query must be at least 3 characters")
    .max(300, "Query cannot exceed 300 characters"),
});