
import { SidebarProvider } from "~/components/blocks/sidebar"; import { Home } from "~/components/blocks/chat-template";

export function meta({ }) {
    return [
        { title: "Home" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function chat() {
    return (
        <SidebarProvider>
            <Home />
        </SidebarProvider>
    );
}
