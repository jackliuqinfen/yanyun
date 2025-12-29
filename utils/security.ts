
/**
 * Data Masking Utility for GDPR/PIPL Compliance
 */

export const maskPhone = (phone: string | undefined): string => {
  if (!phone) return '-';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

export const maskEmail = (email: string | undefined): string => {
  if (!email) return '-';
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const maskedName = name.length > 2 ? name.substring(0, 2) + '****' : name + '****';
  return `${maskedName}@${domain}`;
};

export const maskIdCard = (id: string | undefined): string => {
  if (!id) return '-';
  return id.replace(/^(.{6})(?:\d+)(.{4})$/, '$1******$2');
};

/**
 * Password Strength Validator (NIST Guidelines)
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: '密码长度至少需要 8 位' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '密码需包含至少一个大写字母' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码需包含至少一个小写字母' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '密码需包含至少一个数字' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: '密码需包含至少一个特殊符号' };
  }
  return { valid: true };
};

/**
 * Audit Log Helper
 * In a real app, this would capture IP and detailed metadata.
 */
export const createAuditLogEntry = (
  userId: string,
  userName: string,
  action: string,
  resource: string,
  details: string,
  status: 'SUCCESS' | 'FAILURE'
) => {
  return {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    userName,
    action,
    resource,
    details,
    timestamp: new Date().toISOString(),
    ipAddress: '192.168.1.xxx (Simulated)', // In real app, get from request
    status
  };
};
