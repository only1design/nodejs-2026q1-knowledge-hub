export const jwtConstants = {
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessTll: process.env.JWT_ACCESS_TTL,
  refreshTll: process.env.JWT_REFRESH_TTL,
};
