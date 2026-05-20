import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign Up — PharmFlow" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
