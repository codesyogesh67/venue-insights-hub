"use client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { adminLogin } from "@/lib/clientStore";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = () => {
    if (!email || !password) {
      toast.error("Email and password required");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      adminLogin(email);
      toast.success("Welcome back");
      navigate({ to: "/admin" });
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="card-vq p-8 w-full max-w-sm space-y-5">
        <div className="text-center">
          <div className="font-mono-vq font-bold tracking-wider text-2xl">
            Venue<span className="text-accent-vq">IQ</span>
          </div>
          <div className="font-mono-vq text-[10px] uppercase text-muted-vq mt-1">Admin sign in</div>
        </div>
        <input className="input-vq" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input-vq" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        <button onClick={submit} disabled={busy} className="btn-filled w-full">
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-xs text-muted-vq text-center">
          Demo mode — any email & password works. Sessions persist in this browser.
        </p>
      </div>
    </div>
  );
}
