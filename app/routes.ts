import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/login.tsx"),
    route("chat", "./routes/chat.tsx"),
    route("signup", "./routes/signup.tsx"),
] satisfies RouteConfig;
