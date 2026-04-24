/**
 * Validation utilities
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Validate password strength (advanced)
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const isStrongPassword = (password: string): boolean => {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongRegex.test(password);
};

/**
 * Get password strength level (0-4)
 */
export const getPasswordStrength = (password: string): number => {
  let strength = 0;

  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password) && /[@$!%*?&]/.test(password)) strength++;

  return strength;
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (password: string): string => {
  const strength = getPasswordStrength(password);
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  return labels[strength] || 'Weak';
};

export default {
  isValidEmail,
  isValidPassword,
  isStrongPassword,
  getPasswordStrength,
  getPasswordStrengthLabel,
};
