import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [sessionCheckLoading, setSessionCheckLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          navigate("/home");
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setSessionCheckLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  const validate = () => {
    if (!email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Please enter a valid email address";
    if (!password.trim()) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setSuccessMsg("Signed in successfully.");
      setTimeout(() => {
        navigate("/home");
      }, 500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setSuccessMsg("Account created. Check your email for confirmation if required.");
      setPassword("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim()) {
      setErrorMsg("Enter your email first.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setSuccessMsg("Password reset email sent.");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (sessionCheckLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
          <p className="mt-3 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white shadow-lg p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-600 mb-4">
              <span className="text-2xl font-bold text-white">▤</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">PonProp</h1>
            <p className="text-lg text-slate-500">Property Management Made Simple</p>
          </div>

          <form onSubmit={handleSignIn} noValidate className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {errorMsg ? (
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-start gap-3">
                <span>⚠</span>
                <span>{errorMsg}</span>
              </div>
            ) : null}

            {successMsg ? (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-start gap-3">
                <span>✓</span>
                <span>{successMsg}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 text-white font-semibold hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Please wait..." : "Sign In"}
            </button>

            <button
              type="button"
              onClick={handleCreateAccount}
              disabled={loading}
              className="w-full py-3 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Please wait..." : "Create Account"}
            </button>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              Forgot Password?
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            <a
              href="/privacy"
              className="text-sky-600 hover:text-sky-700 font-medium transition cursor-pointer"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
