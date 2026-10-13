'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../lib/api';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  Filter,
  RotateCcw,
  Receipt,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
} from 'lucide-react';

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('ALL');
  const [refundPayment, setRefundPayment] = useState<any | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['payments-ledger', search, method],
    queryFn: async () => {
      let query = `?limit=50`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (method !== 'ALL') query += `&method=${method}`;
      const res = await fetchApi(`/payments${query}`);
      return res.data;
    },
  });

  const payments = data?.payments || [];

  const handleIssueRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundPayment || refundAmount <= 0 || !refundReason) return;
    setSubmittingRefund(true);

    try {
      await fetchApi(`/payments/${refundPayment.id}/refund`, {
        method: 'POST',
        body: JSON.stringify({
          amount: refundAmount,
          reason: refundReason,
        }),
      });

      setRefundPayment(null);
      setRefundAmount(0);
      setRefundReason('');
      queryClient.invalidateQueries({ queryKey: ['payments-ledger'] });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Refund failed');
    } finally {
      setSubmittingRefund(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Financial Ledger & Payments
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Immutable monetary history across Cash, POS, Bank Transfer & Card transactions
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transaction ref, order #, customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase">Method:</span>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold px-3 py-2 text-slate-700"
          >
            <option value="ALL">All Methods</option>
            <option value="POS">POS Terminal</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CARD">Card</option>
            <option value="ONLINE">Online</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Transaction Ref</th>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Received By</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length > 0 ? (
                payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-900">
                      {p.reference || `TXN-${p.id.slice(0, 8)}`}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sky-600">
                      <Link href={`/orders/${p.order?.id}`} className="hover:underline">
                        {p.order?.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-800">
                      {p.order?.customer?.name}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      ₦{p.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          p.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'PARTIALLY_REFUNDED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {p.receivedBy?.name || 'Staff'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status === 'SUCCESS' && (
                        <button
                          onClick={() => {
                            setRefundPayment(p);
                            setRefundAmount(p.amount);
                            setRefundReason('');
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Refund</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                    {isLoading ? 'Loading payments...' : 'No payments found matching filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      {refundPayment && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Issue Payment Refund</h3>
            <p className="text-xs text-slate-500">
              Refunding Order #{refundPayment.order?.orderNumber} (Max: ₦
              {refundPayment.amount.toLocaleString()})
            </p>

            <form onSubmit={handleIssueRefund} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Refund Amount (₦) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={refundPayment.amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reason for Refund / Reversal *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Order cancelled prior to processing initiation, customer goodwill"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRefundPayment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund || refundAmount <= 0}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white shadow-md shadow-rose-600/20"
                >
                  {submittingRefund ? 'Processing...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
