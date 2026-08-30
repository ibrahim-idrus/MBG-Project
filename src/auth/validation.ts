export interface RegistrationInput {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface NormalizedRegistrationInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface NormalizedLoginInput {
  email: string;
  password: string;
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: Record<string, string> };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_PATH_ORIGIN = 'http://mbg.local';

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function validateRegistration(input: RegistrationInput): ValidationResult<NormalizedRegistrationInput> {
  const name = stringValue(input?.name).trim();
  const email = stringValue(input?.email).trim().toLowerCase();
  const password = stringValue(input?.password);
  const confirmPassword = stringValue(input?.confirm_password);
  const errors: Record<string, string> = {};

  if (!name) {
    errors.name = 'Nama wajib diisi.';
  }

  if (!email) {
    errors.email = 'Email wajib diisi.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Format email tidak valid.';
  }

  if (!password) {
    errors.password = 'Kata sandi wajib diisi.';
  } else if (password.length < 8) {
    errors.password = 'Kata sandi minimal 8 karakter.';
  }

  if (!confirmPassword) {
    errors.confirm_password = 'Konfirmasi kata sandi wajib diisi.';
  } else if (confirmPassword !== password) {
    errors.confirm_password = 'Konfirmasi kata sandi tidak cocok.';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { name, email, password },
  };
}

export function validateLogin(input: LoginInput): ValidationResult<NormalizedLoginInput> {
  const email = stringValue(input?.email).trim().toLowerCase();
  const password = stringValue(input?.password);
  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = 'Email wajib diisi.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Format email tidak valid.';
  }

  if (!password) {
    errors.password = 'Kata sandi wajib diisi.';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { email, password },
  };
}

export function isSafeNextPath(value: string | null): boolean {
  if (
    typeof value !== 'string'
    || value.length === 0
    || !value.startsWith('/')
    || value.startsWith('//')
    || value.includes('\\')
    || /[\[\]]/.test(value)
    || /[\u0000-\u001f\u007f]/.test(value)
    || /%(?![0-9a-fA-F]{2})/.test(value)
  ) {
    return false;
  }

  try {
    const url = new URL(value, SAFE_PATH_ORIGIN);
    return url.origin === SAFE_PATH_ORIGIN;
  } catch {
    return false;
  }
}
