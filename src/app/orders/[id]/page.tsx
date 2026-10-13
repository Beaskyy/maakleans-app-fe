'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi, downloadInvoicePdf } from '../../../lib/api';
import Link from 'next/link';
import {
  ShoppingBag,
  User,
  Calendar,
  CreditCard,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tag,
  Truck,
  MessageSquare,
  Plus,
  RefreshCw,
  Loader2,
  ChevronLeft,
} from 'lucide-react';

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'CASH' | 'POS' | 'BANK_TRANSFER' | 'CARD'>('POS');
  const [payReference, setPayReference] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [transitioningStatus, setTransitioningStatus] = useState(false);

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: async () => {
      const res = await fetchApi(`/orders/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Status transition mutation
  const handleStatusChange = async (newStatus: string) => {
    setTransitioningStatus(true);
    try {
      await fetchApi(`/orders/${id}/status-transitions`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus }),
      });
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Status transition failed');
    } finally {
      setTransitioningStatus(false);
    }
  };

  // Record payment mutation
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;
    setSubmittingPayment(true);
    try {
      await fetchApi('/payments', {
        method: 'POST',
        body: JSON.stringify({
          orderId: id,
          amount: payAmount,
          method: payMethod,
          reference: payReference || undefined,
        }),
      });
      setPaymentModalOpen(false);
      setPayAmount(0);
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Payment recording failed');
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-slate-500">
        <AlertCircle className="w-10 h-10 mx-auto text-rose-500 mb-2" />
        <p className="text-base font-semibold">Order not found</p>
        <Link href="/orders" className="text-sm text-sky-600 hover:underline mt-2 inline-block">
          Return to Orders List
        </Link>
      </div>
    );
  }

  const cleanPhone = order.customer?.phone?.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${order.customer?.name}, this is an update regarding your MaakLeans order #${order.orderNumber}. Current Status: ${order.status}. Balance: ₦${order.balanceAmount.toLocaleString()}. Thank you!`
  )}`;

  return (
    <div className="space-y-6">
      {/* Back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Order #{order.orderNumber}
              </h1>
              {order.isPriority && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  EXPRESS VIP
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Received {new Date(order.receivedDate).toLocaleDateString()} • Promised Ready:{' '}
              <span className="font-semibold text-slate-700">
                {new Date(order.expectedCompletionDate).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Notify on WhatsApp</span>
          </a>

          <button
            onClick={() => downloadInvoicePdf(order.id, order.orderNumber)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Invoice PDF</span>
          </button>

          {order.balanceAmount > 0 && (
            <button
              onClick={() => {
                setPayAmount(order.balanceAmount);
                setPaymentModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-600/20 transition-all"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Status & Highlights Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Workflow Status
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Payment State
            </span>
            <span
              className={`text-xs font-extrabold px-2.5 py-1 rounded-full mt-1 inline-block ${
                order.paymentStatus === 'PAID'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.paymentStatus === 'PARTIALLY_PAID'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {order.paymentStatus.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Status Transition Control */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Transition to:</span>
          <select
            disabled={transitioningStatus}
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="flex-1 sm:flex-initial p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-sky-500"
          >
            <option value="RECEIVED">RECEIVED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="QUALITY_CHECK">QUALITY CHECK</option>
            <option value="READY_FOR_COLLECTION">READY FOR COLLECTION</option>
            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Garments (Left 2 cols) & Financials/Customer (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Garments Tracking List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Tracked Garments</h2>
                <p className="text-xs text-slate-500">
                  Individual barcode tags & station locations
                </p>
              </div>
              <span className="text-xs font-bold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg">
                {order.garments?.length || 0} items
              </span>
            </div>

            <div className="space-y-3">
              {order.garments?.map((g: any) => (
                <div
                  key={g.id}
                  className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black bg-slate-900 text-sky-300 px-2.5 py-1 rounded-md tracking-wider">
                        {g.tagNumber}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{g.garmentType}</span>
                      {g.color && (
                        <span className="text-xs text-slate-500 font-medium">({g.color})</span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        g.status === 'COLLECTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : g.status === 'READY_FOR_COLLECTION'
                          ? 'bg-teal-100 text-teal-800'
                          : g.status === 'QUALITY_CONTROL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {g.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400">Current Bay: </span>
                      <span className="font-semibold text-slate-800">{g.currentLocation}</span>
                    </div>
                    {g.stainsOrDamage && (
                      <div className="text-rose-600">
                        <span className="font-semibold">Stains: </span>
                        {g.stainsOrDamage}
                      </div>
                    )}
                    {g.specialInstructions && (
                      <div className="text-slate-700 col-span-2 sm:col-span-1">
                        <span className="font-semibold">Care: </span>
                        {g.specialInstructions}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Ledger on this order */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Payment Transactions</h2>
                <p className="text-xs text-slate-500">Immutable ledger records for this ticket</p>
              </div>
            </div>

            {order.payments?.length > 0 ? (
              <div className="space-y-2.5">
                {order.payments.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <span>₦{p.amount.toLocaleString()}</span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                          {p.method}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Ref: {p.reference || 'N/A'} • {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No payments recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Right: Customer & Financials Breakdown */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Customer Details
            </h2>
            <div className="space-y-2 text-sm">
              <div className="font-bold text-slate-900 text-base">{order.customer?.name}</div>
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <span>Phone:</span>
                <span className="font-mono font-semibold">{order.customer?.phone}</span>
              </div>
              {order.customer?.address && (
                <div className="text-xs text-slate-600">
                  <span className="text-slate-400">Address:</span> {order.customer.address}
                </div>
              )}
              {order.customer?.specialCareInstructions && (
                <div className="text-xs p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                  <span className="font-bold">Preferences:</span>{' '}
                  {order.customer.specialCareInstructions}
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              Financial Breakdown
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal:</span>
                <span className="font-mono">₦{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount:</span>
                  <span className="font-mono">-₦{order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>Delivery Fee:</span>
                  <span className="font-mono">₦{order.deliveryFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>VAT / Tax (7.5%):</span>
                <span className="font-mono">₦{order.taxAmount.toLocaleString()}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-extrabold text-white">
                <span>Total Amount:</span>
                <span className="font-mono text-sky-400">₦{order.totalAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-xs text-emerald-400 pt-1">
                <span>Amount Paid:</span>
                <span className="font-mono font-bold">₦{order.paidAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm font-bold pt-1">
                <span className="text-slate-300">Balance Due:</span>
                <span
                  className={`font-mono ${
                    order.balanceAmount > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  ₦{order.balanceAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Record Order Payment</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add payment for Order #{order.orderNumber} (Balance: ₦{order.balanceAmount.toLocaleString()})
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Payment Amount (₦) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={order.balanceAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Payment Method *
                </label>
                <select
                  value={payMethod}
                  onChange={(e: any) => setPayMethod(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="POS">POS Terminal</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CARD">Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Transaction / Slip Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. POS-AUTH-98213"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment || payAmount <= 0}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white shadow-md shadow-sky-600/20"
                >
                  {submittingPayment ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
