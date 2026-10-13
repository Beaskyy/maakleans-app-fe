'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  Building,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('emeka@maakleans.com');
  const [password, setPassword] = useState('password123');

  // Register fields
  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const res = await fetchApi('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            businessName,
            name: fullName,
            email,
            password,
            phone,
            currency: 'NGN',
          }),
        });

        if (res.success && res.data) {
          login(
            res.data.token,
            res.data.user,
            res.data.business,
            res.data.role,
            res.data.permissions
          );
          router.push('/');
        }
      } else {
        const res = await fetchApi('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        if (res.success && res.data) {
          login(
            res.data.token,
            res.data.user,
            res.data.business,
            res.data.role,
            res.data.permissions
          );
          router.push('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setIsRegister(false);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left Marketing / Value Proposition Panel */}
      <div className="md:w-1/2 bg-slate-900 text-white p-6 sm:p-8 md:p-14 flex flex-col justify-between relative overflow-hidden min-h-[40vh] md:min-h-0">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-sky-500/30">
              MK
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white">MaakLeans</span>
              <span className="text-xs ml-2 text-sky-400 font-medium px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800">
                SaaS 2026
              </span>
            </div>
          </div>

          <div className="mt-8 md:mt-12 space-y-4 max-w-lg">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Enterprise Laundry & Dry-Cleaning Operations Platform
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Complete multi-tenant management: barcode garment tracking, real-time stage queues, automated WhatsApp receipts, and multi-staff role permissions.
            </p>
          </div>

          <div className="mt-6 md:mt-10 space-y-3 hidden sm:block">
            {[
              'Individual Garment Tag Tracking & Location Movement',
              'Multi-Step Order Wizard with Authoritative NGN Pricing',
              'External Partner Batch Processing & Discrepancy Audits',
              'Immutable Payment Ledger, Partial Settlements & Refunds',
              'Instant Printable & Downloadable PDF Invoices',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="mt-12 pt-6 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            One-Click Demo Personas:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('emeka@maakleans.com')}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
            >
              👔 Emeka (Owner)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('folake@maakleans.com')}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
            >
              📋 Folake (Manager)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('chinedu@maakleans.com')}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
            >
              🏷️ Chinedu (Counter)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('amina@maakleans.com')}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
            >
              🧺 Amina (Processing)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('babatunde@maakleans.com')}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
            >
              🚚 Babatunde (Driver)
            </button>
          </div>
        </div>
      </div>

      {/* Right Login / Register Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 md:p-14">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {isRegister ? 'Register Laundry Business' : 'Welcome Back'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {isRegister
                  ? 'Start managing your laundry facility today'
                  : 'Enter your credentials to access your console'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Business Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Cleaners Lekki"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Adeola Adeleke"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+234 803 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Register Business' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-sky-600 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                New laundry facility?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-sky-600 font-semibold hover:underline"
                >
                  Create Business Account
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
