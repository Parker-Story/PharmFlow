import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign In — PharmFlow" };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
