import Login from "~/auth/login";


export function meta({ }) {
    return [
        { title: "Login" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function chat() {
    return (
        <Login />
    );
}
