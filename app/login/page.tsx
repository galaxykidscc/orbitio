"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateInputs = () => {
    if (!email.trim()) {
      setMessage("Please enter an email address.");
      return false;
    }

    if (!password.trim()) {
      setMessage("Please enter a password.");
      return false;
    }

    if (password.length < 6) {
      setMessage("Password should be at least 6 characters.");
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!validateInputs()) return;

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Logged in!");
    window.location.href = "/";
  };

  const handleSignup = async () => {
    setMessage("");

    if (!validateInputs()) return;

    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Check your email to confirm your account.");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-4 text-2xl font-bold">Student Login</h1>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            className="w-full rounded border p-3"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full rounded border p-3"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-violet-900 p-3 text-white disabled:opacity-60"
          >
            {isLoading ? "Working..." : "Log In"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleSignup}
          disabled={isLoading}
          className="mt-3 text-sm text-violet-800 disabled:opacity-60"
        >
          Create account instead
        </button>

        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </main>
  );
}