'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../lib/api';
import {
  Settings,
  Building,
  DollarSign,
  Tag,
  Receipt,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: business, isLoading } = useQuery({
    queryKey: ['business-settings'],
    queryFn: async () => {
      const res = await fetchApi('/settings');
      return res.data;
    },
  });

  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [currencySymbol, setCurrencySymbol] = useState('₦');
  const [orderPrefix, setOrderPrefix] = useState('MK-');
  const [garmentPrefix, setGarmentPrefix] = useState('TAG-');
  const [taxRatePercent, setTaxRatePercent] = useState(7.5);
  const [receiptFooterNote, setReceiptFooterNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (business) {
      setBusinessName(business.name || '');
      setPhone(business.phone || '');
      setEmail(business.email || '');
      setCurrency(business.currency || 'NGN');
      if (business.settings) {
        setCurrencySymbol(business.settings.currencySymbol || '₦');
        setOrderPrefix(business.settings.orderPrefix || 'MK-');
        setGarmentPrefix(business.settings.garmentPrefix || 'TAG-');
        setTaxRatePercent(business.settings.taxRatePercent || 7.5);
        setReceiptFooterNote(business.settings.receiptFooterNote || '');
      }
    }
  }, [business]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await fetchApi('/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          businessName,
          phone,
          email,
          currency,
          currencySymbol,
          orderPrefix,
          garmentPrefix,
          taxRatePercent,
          receiptFooterNote,
          enableWhatsAppNotifications: true,
          expressMultiplier: 1.5,
        }),
      });

      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['business-settings'] });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const plan = business?.subscription?.plan;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Business Profile & SaaS Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure branding, numbering prefixes, currency symbols, and invoice footers
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Business configuration saved successfully!</span>
        </div>
      )}

      {/* Subscription Tier Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
            Current Subscription Tier
          </span>
          <div className="text-xl font-black mt-0.5">{plan?.name || 'Growth Pro Plan'}</div>
          <div className="text-xs text-slate-300 mt-1">
            Limits: Up to 2,500 orders/month • 20 Staff Accounts • 3,000 Customer Records
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
            Status: ACTIVE
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Branding */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Facility Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Facility / Brand Name *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Official Support Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Official Business Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Operating Currency
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Numbering & Tax Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Numbering & Tax Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Order Number Prefix
              </label>
              <input
                type="text"
                value={orderPrefix}
                onChange={(e) => setOrderPrefix(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">e.g. MK-1001</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Garment Tag Prefix
              </label>
              <input
                type="text"
                value={garmentPrefix}
                onChange={(e) => setGarmentPrefix(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">e.g. TAG-10025</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                VAT / Sales Tax (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Nigeria VAT default 7.5%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Receipt & Invoice Footer Message
            </label>
            <textarea
              rows={2}
              value={receiptFooterNote}
              onChange={(e) => setReceiptFooterNote(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white font-bold rounded-xl shadow-md shadow-sky-600/20 transition-all text-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
