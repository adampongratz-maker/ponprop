import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

/**
 * OAuth PKCE callback handler.
 *
 * DO NOT call supabase.auth.exchangeCodeForSession() here manually.
 * The Supabase client is configured with detectSessionInUrl: true and
 * flowType: 'pkce', which means it automatically exchanges the ?code=
 * parameter during client initialization. Calling exchangeCodeForSession()
 * a second time would consume an already-used code and fail, sending the
 * user back to the login page.
 *
 * This component simply waits for onAuthStateChange to confirm the session
 * and then navigates to /home.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[AuthCallback] mounted — waiting for Supabase to process OAuth callback");

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AuthCallback] auth event:", event, "| user:", session?.user?.email ?? null);

      if (session?.user) {
        // Session confirmed — either from auto PKCE exchange (SIGNED_IN)
        // or already present in storage (INITIAL_SESSION)
        console.log("[AuthCallback] session confirmed, navigating to /home");
        subscription.unsubscribe();
        navigate("/home", { replace: true });
        return;
      }

      if (event === "INITIAL_SESSION" && !session) {
        // Supabase hasn't finished the PKCE exchange yet — stay on the
        // spinner and wait for the SIGNED_IN event.
        console.log("[AuthCallback] INITIAL_SESSION null — waiting for SIGNED_IN...");
      }
    });

    // Safety net: if SIGNED_IN never fires after 15 s, something went wrong
    // (e.g. redirect URL not in Supabase allowlist → exchange rejected).
    const timeout = setTimeout(() => {
      console.error("[AuthCallback] timed out waiting for session — check Supabase Redirect URL allowlist");
      subscription.unsubscribe();
      navigate("/?auth_error=" + encodeURIComponent("Sign-in timed out. The redirect URL may not be allowed in your Supabase project settings."), { replace: true });
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
