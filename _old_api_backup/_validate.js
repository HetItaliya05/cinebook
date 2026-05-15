// Lightweight input validation for API routes
export function validate(body, rules) {
  const errors = [];
  for (const [field, rule] of Object.entries(rules)) {
    const value = body[field];
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    if (value !== undefined && value !== null) {
      if (rule.type === 'number' && (typeof value !== 'number' || isNaN(value))) {
        errors.push(`${field} must be a number`);
      }
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      }
      if (rule.type === 'email' && typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${field} must be a valid email`);
      }
      if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
        errors.push(`${field} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
        errors.push(`${field} must be at most ${rule.max}`);
      }
      if (rule.maxLength !== undefined && typeof value === 'string' && value.length > rule.maxLength) {
        errors.push(`${field} must be at most ${rule.maxLength} characters`);
      }
    }
  }
  return errors.length > 0 ? errors.join('; ') : null;
}
