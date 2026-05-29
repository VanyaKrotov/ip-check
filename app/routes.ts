import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("_api/locales/:lng/:ns", "routes/api.locales.ts"),
  route("api/ip-info", "routes/api.ip-info.ts"),
] satisfies RouteConfig;
