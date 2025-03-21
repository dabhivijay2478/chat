import {
    type RouteConfig,
    route,
    index,
    layout,
    prefix,
} from "@react-router/dev/routes";

export default [
    // Public routes
    index("./auth/login.tsx"),
    route('create-user', './routes/createuserpage.tsx'),
    // Protected routes
    layout("./layout/ProtectedLayout.tsx", [
        // Chat routes
        ...prefix("chat", [
            index("./routes/chat.tsx"),
        ]),
    ]),
] satisfies RouteConfig;