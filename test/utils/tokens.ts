import { config } from 'dotenv';
import { sign, SignOptions } from 'jsonwebtoken';

config({ path: 'config/.env.local' });

const refreshTokenSecurityKey = process.env.JWT_REFRESH_SECRET || '';

const generateRefreshToken = (payload: any, options: SignOptions): string => {
  return sign(payload, refreshTokenSecurityKey, options);
};

export default generateRefreshToken;
