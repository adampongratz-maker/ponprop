import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

/**
 * Handles the OAuth PKCE callback.
 *
 * Supabase v2 uses PKCE flow by default — Google redirects back with a
 * `?code=` query param (not a hash). This page exchanges that code for a
 * real session and then sends the user to /home.
 *
 * It must be mounted OUTSIDE PrivacyGate and ProtectedRoute so nothing
 * can interfere with the exchange before it completes.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const exchanged = useRef(false);

  useEffect(() => {
    // Guard against React 18 double-invoke in dev
    if (exchanged.current) return;
    exchanged.current = true;

    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        // PKCE flow: exchange the authorization code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("OAuth code exchange failed:", error.message);
          navigate("/?auth_error=" + encodeURIComponent(error.message), { replace: true });
          return;
        }
      } else {
        // Implicit flow fallback: Supabase detects #access_token hash automatically.
        // Just wait for onAuthStateChange to fire SIGNED_IN.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session) {
            subscription.unsubscribe();
            navigate("/home", { replace: true });
          } else if (event === "INITIAL_SESSION" && !session) {
            // No code, no hash session — something went wrong
            subscription.unsubscribe();
            navigate("/", { replace: true });
          }
        });
        return;
      }

      navigate("/home", { replace: true });
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
      <div className="text-center">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500"
          aria-hidden="true"
        />
        <p className="mt-3 text-slate-600">Signing you in…</p>
      </div>
    </div>
  );
}
