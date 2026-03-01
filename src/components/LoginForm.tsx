"use client";
import { useState } from "react";

interface Props {
  auth: {
    login: (email: string, password: string) => Promise<void>;
    verifyCode: (code: string) => Promise<void>;
    cancelVerification: () => void;
    loading: boolean;
    error: string | null;
    needsVerification: boolean;
  };
}

export default function LoginForm({ auth }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  if (auth.needsVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">📧</div>
            <h1 className="text-3xl font-bold">Verify Email</h1>
            <p className="text-gray-500 mt-1">
              A verification code was sent to your email
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              auth.verifyCode(code);
            }}
            className="bg-white rounded-xl shadow p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                autoFocus
                required
              />
            </div>

            {auth.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{auth.error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={auth.loading || !code}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {auth.loading ? "Verifying..." : "Verify"}
            </button>

            <button
              type="button"
              onClick={() => {
                auth.cancelVerification();
                setCode("");
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Back to login
            </button>
          </form>
        </div>
      </div>
    );
  }

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
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{auth.error}</p>
            </div>
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
