import React from "react";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 active:bg-slate-100 transition z-50"
      >
        ← Back
      </button>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-3">Privacy Policy</h1>
          <p className="text-lg text-slate-600">Last updated: April 6, 2026</p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Information We Collect</h2>
            <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
              <p className="text-slate-700 leading-relaxed mb-4">
                We collect information you provide directly, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Name and email address</li>
                <li>Property details and tenant information</li>
                <li>Financial records and transaction data</li>
                <li>Contact information and preferences</li>
                <li>Usage data and device information</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">How We Use Information</h2>
            <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
              <p className="text-slate-700 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
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

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Security</h2>
            <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
              <p className="text-slate-700 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit and at rest using industry-standard protocols.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Third-Party Services</h2>
            <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
              <p className="text-slate-700 leading-relaxed mb-4">
                We use third-party service providers to assist with our operations:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Supabase for database and authentication</li>
                <li>Netlify for hosting and deployment</li>
                <li>Payment processors for financial transactions</li>
                <li>Analytics providers for usage insights</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                These providers are contractually obligated to use your information only as necessary to provide services.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">User Rights</h2>
            <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
              <p className="text-slate-700 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent at any time</li>
                <li>Request a copy of your data in portable format</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@ponprop.com.
              </p>
            </div>
          </section>

          <section className="rounded-2xl bg-sky-50 border border-sky-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-3">Questions?</h2>
            <p className="text-slate-700">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a
                href="mailto:privacy@ponprop.com"
                className="text-sky-600 hover:text-sky-700 font-medium"
              >
                privacy@ponprop.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
