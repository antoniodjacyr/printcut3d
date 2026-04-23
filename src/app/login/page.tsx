import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-zinc-400">…</div>}>
      <LoginForm />
    </Suspense>
  );
}
