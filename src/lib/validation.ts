import { z } from 'zod';

// ============================================
// Utility functions for sanitization
// ============================================

/**
 * Sanitize a string by removing potential XSS vectors
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 10000); // Max length safety
}

/**
 * Sanitize a number input
 */
export function sanitizeNumber(input: string | number): number {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.max(0, num); // Ensure non-negative
}

/**
 * Sanitize amount (currency) - max 2 decimal places, max 999,999,999.99
 */
export function sanitizeAmount(input: string | number): number {
  const num = sanitizeNumber(input);
  const maxAmount = 999999999.99;
  const sanitized = Math.min(num, maxAmount);
  return Math.round(sanitized * 100) / 100; // Round to 2 decimal places
}

/**
 * Sanitize percentage (0-100 or higher for returns)
 */
export function sanitizePercentage(input: string | number, max = 1000): number {
  const num = sanitizeNumber(input);
  return Math.min(Math.max(num, -100), max);
}

// ============================================
// Validation Schemas
// ============================================

// Common field schemas
const stringField = (maxLength: number = 255) => z
  .string()
  .trim()
  .max(maxLength, { message: `Máximo ${maxLength} caracteres` })
  .transform(sanitizeString);

const requiredStringField = (maxLength: number = 255) => z
  .string()
  .trim()
  .min(1, { message: "Campo obrigatório" })
  .max(maxLength, { message: `Máximo ${maxLength} caracteres` })
  .transform(sanitizeString);

const amountField = z
  .union([z.string(), z.number()])
  .refine((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return !isNaN(num) && num > 0;
  }, { message: "Valor deve ser maior que zero" })
  .transform((val): number => sanitizeAmount(val));

const optionalAmountField = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((val): number => {
    if (val === null || val === undefined || val === '') return 0;
    return sanitizeAmount(val);
  });

const dateField = z
  .union([z.date(), z.string()])
  .transform((val): Date => {
    if (val instanceof Date) return val;
    const date = new Date(val);
    if (isNaN(date.getTime())) throw new Error("Data inválida");
    return date;
  });

const optionalDateField = z
  .union([z.date(), z.string(), z.null(), z.undefined()])
  .transform((val): string | null => {
    if (!val) return null;
    if (val instanceof Date) return val.toISOString().split('T')[0];
    const date = new Date(val);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  });

// ============================================
// Transaction Schema
// ============================================

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], { 
    errorMap: () => ({ message: "Tipo deve ser 'income' ou 'expense'" }) 
  }),
  amount: amountField,
  category: requiredStringField(100),
  description: stringField(500).optional().default(''),
  date: dateField,
  is_recurring: z.boolean().optional().default(false),
  recurrence_pattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).nullable().optional(),
  recurrence_end_date: optionalDateField.optional()
});

export type TransactionInput = z.infer<typeof transactionSchema>;

// ============================================
// Goal Schema
// ============================================

export const goalSchema = z.object({
  name: requiredStringField(200),
  target_amount: amountField,
  current_amount: optionalAmountField.default(0),
  target_date: optionalDateField.optional(),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  note: stringField(1000).optional().default('')
});

export type GoalInput = z.infer<typeof goalSchema>;

// ============================================
// Investment Schema
// ============================================

export const investmentSchema = z.object({
  name: requiredStringField(200),
  type: z.enum(['stocks', 'bonds', 'crypto', 'real_estate', 'funds', 'savings'], {
    errorMap: () => ({ message: "Tipo de investimento inválido" })
  }),
  amount: amountField,
  expected_return: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return null;
      return sanitizePercentage(val);
    })
    .optional(),
  purchase_date: dateField
});

export type InvestmentInput = z.infer<typeof investmentSchema>;

// ============================================
// Budget Schema
// ============================================

export const budgetSchema = z.object({
  category: requiredStringField(100),
  amount_limit: amountField,
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100)
});

export type BudgetInput = z.infer<typeof budgetSchema>;

// ============================================
// Challenge Schema
// ============================================

export const challengeSchema = z.object({
  title: requiredStringField(200),
  description: stringField(1000).optional().default(''),
  target_amount: optionalAmountField.optional(),
  duration_days: z.number().int().min(1).max(365)
});

export type ChallengeInput = z.infer<typeof challengeSchema>;

// ============================================
// Profile Schema
// ============================================

export const profileSchema = z.object({
  full_name: stringField(100).optional(),
  email: z.string().email({ message: "Email inválido" }).max(255).optional(),
  phone: z
    .string()
    .max(20)
    .regex(/^[\d\s\-+()]*$/, { message: "Telefone inválido" })
    .optional()
    .transform((val) => val?.replace(/[^\d+]/g, '') || null),
  currency: z.enum(['BRL', 'USD', 'EUR']).optional().default('BRL'),
  risk_profile: z.enum(['conservative', 'moderate', 'aggressive']).optional()
});

export type ProfileInput = z.infer<typeof profileSchema>;

// ============================================
// Validation Result Types
// ============================================

export type ValidationSuccess<T> = { success: true; data: T };
export type ValidationError = { success: false; errors: Record<string, string> };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

// ============================================
// Validation helper
// ============================================

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.') || 'value';
    errors[path] = err.message;
  });
  
  return { success: false, errors };
}

// Type guard for validation result
export function isValidationError<T>(
  result: ValidationResult<T>
): result is ValidationError {
  return !result.success;
}

// ============================================
// Auth check helper
// ============================================

export function requireAuth(userId: string | undefined): asserts userId is string {
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }
}

export function requireWorkspace(workspaceId: string | undefined): asserts workspaceId is string {
  if (!workspaceId) {
    throw new Error('Workspace não selecionado');
  }
}
