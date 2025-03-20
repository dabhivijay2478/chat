# 🚀 Welcome to VConnect!

## ✨ Features

- ⚡ **Vite** – Lightning-fast development experience
- 🚀 **Server-side Rendering (SSR)** – Improved SEO & performance
- 🔄 **React Router** – Modern routing solution for React
- 💎 **ShadCN** – Pre-built, beautiful UI components
- 🎨 **Tailwind CSS** – Utility-first styling for rapid UI development
- 🔥 **Hot Module Replacement (HMR)** – Instant updates in development
- 🛠 **TypeScript by default** – Static typing for robust code
- 📦 **Optimized Bundling** – Efficient asset management for production
- 🔑 **Clerk Authentication** – Secure user authentication and access control

## 🚀 Getting Started

### 📦 Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 💻 Development

Start the development server:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## 🔑 Authentication with Clerk

This template integrates [Clerk](https://clerk.dev/) for seamless authentication and user management.

### 📦 Setup Clerk

1. Sign up at [Clerk.dev](https://clerk.dev/) and create a new application.
2. Copy your Clerk **Frontend API URL** and **Publishable Key**.
3. Add the following environment variables to your `.env` file:

```env
CLERK_SECRET_KEY=<your-clerk-frontend-api>
VITE_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
```

4. Wrap your application with `ClerkProvider` in `root.tsx`:

```tsx
export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <ClerkProvider
      loaderData={loaderData}
      signUpUrl="/signup"
      signInUrl="/"
    >
      <Outlet />
    </ClerkProvider>
  );
}

```

5. Use Clerk authentication components in your app:

```tsx
import { SignIn, SignUp, UserButton } from "@clerk/react-router";

function AuthPage() {
  return (
    <div>
      <SignIn />
      <SignUp />
      <UserButton />
    </div>
  );
}
```

## 🏗 Building for Production

Generate a production-ready build:

```bash
npm run build
```

## 🚢 Deployment

### 📦 Docker Deployment

Build and run your application using Docker:

```bash
docker build -t my-app .

docker run -p 3000:3000 my-app
```

This can be deployed to any containerized platform like:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### 🛠 DIY Deployment

For manual deployment, ensure you deploy the output of `npm run build`:

```
app/
├─ auth/
│  ├─ login.tsx
│  └─ signup.tsx
├─ components/
│  ├─ blocks/
│  │  ├─ chat-template.tsx
│  │  └─ sidebar.tsx
│  └─ ui/
│     ├─ avatar.tsx
│     ├─ button.tsx
│     ├─ card.tsx
│     ├─ checkbox.tsx
│     ├─ dropdown-menu.tsx
│     ├─ header.tsx
│     ├─ icons.tsx
│     ├─ input.tsx
│     ├─ label.tsx
│     ├─ navigation-menu.tsx
│     ├─ resizable.tsx
│     ├─ scroll-area.tsx
│     ├─ select.tsx
│     ├─ separator.tsx
│     ├─ sheet.tsx
│     ├─ sidebar.tsx
│     ├─ sign-in.tsx
│     ├─ skeleton.tsx
│     ├─ switch.tsx
│     ├─ textarea.tsx
│     └─ tooltip.tsx
├─ hooks/
│  ├─ use-mobile.ts
│  └─ use-mobile.tsx
├─ layout/
│  └─ ProtectedLayout.tsx
├─ lib/
│  └─ utils.ts
├─ routes/
│  ├─ chat.tsx
│  ├─ login.tsx
│  └─ signup.tsx
├─ app.css
├─ root.tsx
└─ routes.ts
```

## 🎨 Styling

This template comes pre-configured with [Tailwind CSS](https://tailwindcss.com/) for a smooth and customizable styling experience. Additionally, [ShadCN](https://ui.shadcn.com/) is included for modern, beautiful UI components.

Feel free to customize the styles and components as per your requirements! 💡

---

Built with ❤️ using **React Router, Vite, Tailwind CSS, ShadCN, and Clerk**.