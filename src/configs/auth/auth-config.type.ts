export type AuthConfig = {
  accessTokenSecret: string;
  accessTokenExpires: string;
  refreshTokenSecret: string;
  refreshTokenExpires: string;
  forgotSecret: string;
  forgotExpires: string;
  confirmEmailSecret: string;
  confirmEmailExpires: string;
};
