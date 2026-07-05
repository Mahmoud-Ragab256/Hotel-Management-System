import bcrypt from 'bcrypt';

const getEnvValue = (key: string, fallback = ''): string => {
  const value = process.env[key];
  return typeof value === 'string' ? value : fallback;
};

export const normalizeEmail = (email?: string | null): string => {
  return (email || '').trim().toLowerCase();
};

export const hashPassword = async (password: string): Promise<string> => {
  const pepper = getEnvValue('PEPPER');
  const saltRounds = Number(getEnvValue('SALT_ROUNDS', '10'));
  const rounds = Number.isInteger(saltRounds) && saltRounds > 0 ? saltRounds : 10;

  return bcrypt.hash(`${password}${pepper}`, rounds);
};

export const verifyPassword = async (
  plainPassword: string,
  savedPassword: string,
): Promise<{ matched: boolean; needsRehash: boolean }> => {
  if (!plainPassword || !savedPassword) {
    return { matched: false, needsRehash: false };
  }

  const pepper = getEnvValue('PEPPER');
  const looksLikeBcryptHash = /^\$2[aby]\$\d{2}\$/.test(savedPassword);

  if (!looksLikeBcryptHash) {
    return {
      matched: savedPassword === plainPassword || savedPassword === `${plainPassword}${pepper}`,
      needsRehash: true,
    };
  }

  const compareWithPepper = await bcrypt.compare(`${plainPassword}${pepper}`, savedPassword);
  if (compareWithPepper) {
    return { matched: true, needsRehash: false };
  }

  const compareWithoutPepper = await bcrypt.compare(plainPassword, savedPassword);
  if (compareWithoutPepper) {
    return { matched: true, needsRehash: true };
  }

  return { matched: false, needsRehash: false };
};
