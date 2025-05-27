import { Response } from "express";
interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge?: number;
  expires?: Date;
  path?: string;
}

export const setCookie = (
  res: Response,
  name: string,
  value: string | undefined,
  options: Partial<CookieOptions> = {}
) => {
  const defaultOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none" as const,
    path: "/",
  };

  res.cookie(name, value, {
    ...defaultOptions,
    ...options,
  });
};

export const clearCookie = (res: Response, name: string) => {
  res.clearCookie(name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
  });
};
