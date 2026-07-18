import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as apiRegister } from "../api/auth";
import { useAuth } from "../hooks/useAuth";
import type { ApiError } from "../api/client";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiRegister(name, email, password);
      await login(res.token);
      navigate("/app");
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-base font-semibold text-text-primary no-underline tracking-tight block text-center mb-8">
          SnapMind
        </Link>

        <h1 className="text-xl font-semibold text-center mb-6 tracking-tight">Create your account</h1>

        {error && (
          <div className="text-sm text-danger bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="register-name" className="block text-[13px] font-medium text-text-secondary mb-1.5">
              Name
            </label>
            <input
              id="register-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="register-email" className="block text-[13px] font-medium text-text-secondary mb-1.5">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="register-password" className="block text-[13px] font-medium text-text-secondary mb-1.5">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium bg-text-primary text-white rounded-md hover:opacity-90 disabled:opacity-50 cursor-pointer border-none"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-[13px] text-text-secondary text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
