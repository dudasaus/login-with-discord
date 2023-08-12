import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import { env } from "node:process";

export function verifyLoggedIn(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const token = req.cookies.auth;
  return jwt.verify(token, env["JWT_PRIVATE_KEY"], (err, decoded) => {
    if (err) {
      return res.redirect("/login");
    } else {
      // Extend the cookies to include authenticated values.
      if (!req.cookies) req.cookies = {};
      req.cookies["discordToken"] = decoded.discordToken;
      req.cookies["username"] = decoded.username;
      next();
    }
  });
}
