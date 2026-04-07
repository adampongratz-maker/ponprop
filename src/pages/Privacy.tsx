import React from "react";
import { useNavigate } from "react-router-dom";

const PRIVACY_KEY = "ponprop_privacy_v1";

export function markPrivacyAccepted() {
  localStorage.setItem(PRIVACY_KEY, "accepted");
}

export function isPrivacyAccepted(): boolean {
  return localStorage.getItem(PRIVACY_KEY) === "accepted";
}

interface PrivacyProps {
  /** When true, renders as the onboarding gate with Accept & Continue button */
  asGate?: boolean;
  /** Called when the user accepts (gate mode only) */
  onAccept?: () => void;
}

export default function Privacy({ asGate = false, onAccept }: PrivacyProps) {
  const navigate = useNavigate();

  function handleAccept() {
    markPrivacyAccepted();
    if (onAccept) {
      onAccept();
    } else {
      navigate("/");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {!asGate && (
        <button
          onClick={() => navigate(-1)}
          className="fixed top-6 left-6 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 active:bg-slate-100 transition z-50 focus:outline-none focus:ring-2 focus:ring-orange-300"
          aria-label="Go back"
        >
          ← Back
        </button>
      )}

      <div className="max-w-3xl mx-auto px-4 py-16">
        {asGate && (
          <div className="mb-10 flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 shrink-0" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24" aria-hidden="true">
                <path d="M12 2L2 10h3v10h5v-6h4v6h5V10h3L12 2z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Welcome to PonProp</h2>
              <p className="text-slate-500 text-sm">Please review and accept our Privacy Policy to continue.</p>
            </div>
          </div>
        )}

        <div className="mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-3">Privacy Policy</h1>
          <p className="text-lg text-slate-600">Last updated: April 6, 2026</p>
        </div>

        <div className="space-y-8">
          <section aria-labelledby="info-heading">
            <h2 id="info-heading" className="text-2xl font-bold text-slate-900 mb-4">Information We Collect</h2>
            <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
              <p className="text-slate-700 leading-relaxed mb-4">We collect information you provide directly, including:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Name and email address</li>
                <li>Property details and tenant information</li>
                <li>Financial records and transaction data</li>
                <li>Contact information and preferences</li>
                <li>Usage data and device information</li>
              </ul>
            </div>
          </section>

          <section aria-labelledby="use-heading">
            <h2 id="use-heading" className="text-2xl font-bold text-slate-900 mb-4">How We Use Information</h2>
            <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
              <p className="text-slate-700 leading-relaxed mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Provide and maintain our service</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Improve our service and user experience</li>
                <li>Detect and prevent fraudulent transactions</li>
              </ul>
            </div>
          </section>

          <section aria-labelledby="security-heading">
            <h2 id="security-heading" className="text-2xl font-bold text-slate-900 mb-4">Data Security</h2>
            <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
              <p className="text-slate-700 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit and at rest using industry-standard protocols.
              </p>
            </div>
          </section>

          <section aria-labelledby="third-party-heading">
            <h2 id="third-party-heading" className="text-2xl font-bold text-slate-900 mb-4">Third-Party Services</h2>
            <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
              <p className="text-slate-700 leading-relaxed mb-4">We use third-party service providers to assist with our operations:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Supabase for database and authentication</li>
                <li>Netlify for hosting and deployment</li>
                <li>Google for OAuth sign-in</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                These providers are contractually obligated to use your information only as necessary to provide services.
              </p>
            </div>
          </section>

          <section aria-labelledby="rights-heading">
            <h2 id="rights-heading" className="text-2xl font-bold text-slate-900 mb-4">Your Rights</h2>
            <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
              <p className="text-slate-700 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent at any time</li>
                <li>Request a copy of your data in portable format</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                To exercise these rights, contact us at{" "}
                <a href="mailto:privacy@ponprop.com" className="text-orange-600 hover:text-orange-700 font-medium focus:outline-none focus:underline">
                  privacy@ponprop.com
                </a>.
              </p>
            </div>
          </section>

          <section className="rounded-2xl bg-orange-50 border border-orange-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-3">Questions?</h2>
            <p className="text-slate-700">
              If you have any questions, contact us at{" "}
              <a href="mailto:privacy@ponprop.com" className="text-orange-600 hover:text-orange-700 font-medium focus:outline-none focus:underline">
                privacy@ponprop.com
              </a>.
            </p>
          </section>
        </div>

        {/* Accept CTA — shown in both gate mode and standalone */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <button
            onClick={handleAccept}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-base hover:shadow-lg transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {asGate ? "Accept & Continue" : "Accept Policy"}
          </button>
          {asGate && (
            <p className="text-sm text-slate-500">
              By clicking Accept, you agree to the terms of this Privacy Policy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
