import SignUpPage from "~/auth/signup";


export function meta({ }) {
    return [
        { title: "SignUp" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function chat() {
    return (
        <SignUpPage />
    );
}
