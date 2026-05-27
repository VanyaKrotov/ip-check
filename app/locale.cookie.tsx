import { createCookie } from "react-router";

const isProduction = process.env.NODE_ENV === "production";

export const localeCookie = createCookie("lng", {
  path: "/",
  sameSite: "lax",
  secure: isProduction,
  httpOnly: true,
});
