import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

const createToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expireTime: string
): string => {
  // Type assertion needed due to strict type checking with exactOptionalPropertyTypes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, secret as string, {
    expiresIn: expireTime,
  } as any);
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelpers = {
  createToken,
  verifyToken,
};
