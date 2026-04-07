/**
 * Security: Input Validation & Sanitization Utility
 * Provides strict validation and sanitization for all user inputs
 */

// Length limitations to prevent abuse
export const VALIDATION_LIMITS = {
  NAME_MIN: 1,
  NAME_MAX: 255,
  EMAIL_MAX: 254,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  TEXT_MIN: 1,
  TEXT_MAX: 5000,
  ADDRESS_MAX: 500,
  UNIT_MAX: 100,
  DESCRIPTION_MAX: 2000,
  CATEGORY_MAX: 100,
  STATUS_MAX: 50,
};

// Allowed values for enums
export const ALLOWED_VALUES = {
  PROPERTY_STATUS: ["Active", "Inactive", "Maintenance"],
  TENANT_STATUS: ["Active", "Inactive", "Evicted"],
  TRANSACTION_TYPE: ["Income", "Expense"],
  TASK_PRIORITY: ["Low", "Medium", "High"],
  TASK_STATUS: ["Open", "Completed", "Cancelled"],
  WORK_ORDER_STATUS: ["Open", "In Progress", "Completed"],
};

/**
 * Sanitizes a string by trimming, removing null bytes, and limiting length
 */
export function sanitizeString(value: unknown, maxLength: number = 1000): string {
  if (typeof value !== "string") {
    return "";
  }
  
  // Remove null bytes and other dangerous characters
  let sanitized = value.replace(/\0/g, "").trim();
  
  // Enforce length limit
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitizes and validates an email address
 */
export function sanitizeAndValidateEmail(value: unknown): string {
  const sanitized = sanitizeString(value, VALIDATION_LIMITS.EMAIL_MAX).toLowerCase();
  
  if (!sanitized) {
    throw new Error("Email is required");
  }
  
  // RFC 5322 simplified validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error("Invalid email address format");
  }
  
  return sanitized;
}

/**
 * Sanitizes and validates a number within a range
 */
export function sanitizeNumber(
  value: unknown,
  min: number = Number.MIN_SAFE_INTEGER,
  max: number = Number.MAX_SAFE_INTEGER
): number {
  const num = Number(value);
  
  if (isNaN(num)) {
    throw new Error("Value must be a valid number");
  }
  
  if (num < min || num > max) {
    throw new Error(`Value must be between ${min} and ${max}`);
  }
  
  return num;
}

/**
 * Sanitizes and validates a name/string field
 */
export function sanitizeName(value: unknown, fieldName: string = "Name"): string {
  const sanitized = sanitizeString(value, VALIDATION_LIMITS.NAME_MAX);
  
  if (sanitized.length < VALIDATION_LIMITS.NAME_MIN) {
    throw new Error(`${fieldName} is required`);
  }
  
  if (sanitized.length > VALIDATION_LIMITS.NAME_MAX) {
    throw new Error(`${fieldName} is too long (max ${VALIDATION_LIMITS.NAME_MAX} characters)`);
  }
  
  return sanitized;
}

/**
 * Validates an enum value against allowed values
 */
export function validateEnumValue(
  value: unknown,
  allowedValues: readonly string[],
  fieldName: string = "Value"
): string {
  const stringValue = sanitizeString(value, VALIDATION_LIMITS.STATUS_MAX);
  
  if (!allowedValues.includes(stringValue)) {
    throw new Error(
      `${fieldName} must be one of: ${allowedValues.join(", ")}`
    );
  }
  
  return stringValue;
}

/**
 * Sanitizes and validates a date string
 */
export function sanitizeDate(value: unknown): string {
  const stringValue = sanitizeString(value, 10);
  
  // Basic ISO date validation (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    throw new Error("Invalid date format. Use YYYY-MM-DD");
  }
  
  // Verify it's a valid date
  const date = new Date(stringValue + "T00:00:00Z");
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }
  
  return stringValue;
}

/**
 * Validates property data
 */
export function validateProperty(data: any) {
  return {
    name: sanitizeName(data.name, "Property name"),
    address: sanitizeName(data.address, "Address"),
    units: sanitizeNumber(data.units, 1, 10000),
    status: validateEnumValue(data.status, ALLOWED_VALUES.PROPERTY_STATUS, "Status"),
  };
}

/**
 * Validates tenant data
 */
export function validateTenant(data: any) {
  return {
    name: sanitizeName(data.name, "Tenant name"),
    unit: sanitizeString(data.unit, VALIDATION_LIMITS.UNIT_MAX) || null,
    balance: sanitizeNumber(data.balance ?? 0, 0, 1000000),
    status: validateEnumValue(data.status, ALLOWED_VALUES.TENANT_STATUS, "Status"),
  };
}

/**
 * Validates a ledger entry (ledger_entries table).
 * Replaces the old validateTransaction — type is "Income" or "Expense".
 */
export function validateLedgerEntry(data: any) {
  return {
    date: sanitizeDate(data.date),
    type: validateEnumValue(data.type, ALLOWED_VALUES.TRANSACTION_TYPE, "Type"),
    amount: sanitizeNumber(data.amount, 0, 1000000000),
    tenant: sanitizeString(data.tenant, VALIDATION_LIMITS.NAME_MAX) || null,
    property: sanitizeString(data.property, VALIDATION_LIMITS.NAME_MAX) || null,
    unit: sanitizeString(data.unit, VALIDATION_LIMITS.UNIT_MAX) || null,
    method: sanitizeString(data.method, VALIDATION_LIMITS.NAME_MAX) || null,
  };
}

/** @deprecated Use validateLedgerEntry instead */
export function validateTransaction(data: any) {
  return validateLedgerEntry(data);
}

/**
 * Validates task data
 */
export function validateTask(data: any) {
  return {
    text: sanitizeName(data.text, "Task"),
    priority: validateEnumValue(data.priority, ALLOWED_VALUES.TASK_PRIORITY, "Priority"),
    status: validateEnumValue(data.status, ALLOWED_VALUES.TASK_STATUS, "Status"),
  };
}

/**
 * Validates work order data
 */
export function validateWorkOrder(data: any) {
  return {
    title: sanitizeName(data.title, "Title"),
    description: sanitizeString(data.description, VALIDATION_LIMITS.DESCRIPTION_MAX),
    status: validateEnumValue(data.status, ALLOWED_VALUES.WORK_ORDER_STATUS, "Status"),
    priority: validateEnumValue(data.priority, ALLOWED_VALUES.TASK_PRIORITY, "Priority"),
  };
}

/**
 * Ensures a value exists and is not null/undefined
 */
export function requireValue<T>(value: T | null | undefined, fieldName: string = "Value"): T {
  if (value === null || value === undefined) {
    throw new Error(`${fieldName} is required`);
  }
  return value;
}

/**
 * Sanitizes a database ID (UUID format)
 */
export function sanitizeId(value: unknown): string {
  const stringValue = sanitizeString(value, 50);
  
  // Basic UUID validation (allows both with and without hyphens)
  if (!/^[a-f0-9\-]*$/.test(stringValue)) {
    throw new Error("Invalid ID format");
  }
  
  return stringValue;
}
