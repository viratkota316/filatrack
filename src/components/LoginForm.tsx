"use client";
import { useState } from "react";

interface Props {
  auth: {
    login: (email: string, password: string) => Promise<void>;
    loading: boolean;
    error: string | null;
  };
}

export default function LoginForm({ auth }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🖨️</div>
          <h1 className="text-3xl font-bold">FilaTrack</h1>
          <p className="text-gray-500 mt-1">Connect to your Bambu Lab printer</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            auth.login(email, password);
          }}
          className="bg-white rounded-xl shadow p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {auth.error && (
            <p className="text-red-500 text-sm">{auth.error}</p>
          )}

          <button
            type="submit"
            disabled={auth.loading || !email || !password}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {auth.loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Sign in with your Bambu Lab account
          </p>
        </form>
      </div>
    </div>
  );
}
