import { Response } from "express";

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge?: number;
  expires?: Date;
}

export const setCookie = (
  res: Response,
  name: string,
  value: string | undefined,
  options: Partial<CookieOptions> = {}
) => {
  const defaultOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development",
    sameSite: "strict" as const,
  };

  res.cookie(name, value, {
    ...defaultOptions,
    ...options,
  });
};

export const clearCookie = (res: Response, name: string) => {
  res.clearCookie(name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development",
    sameSite: "strict",
  });
};
