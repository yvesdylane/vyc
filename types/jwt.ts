export type JWTPayload = {
  iss: string;
  sub: string;
  iat: number;
  exp: number;
  [key: string]: any;
};
