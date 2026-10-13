'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi, downloadInvoicePdf } from '../../lib/api';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  Filter,
  Plus,
  FileText,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowUpDown,
  Download,
} from 'lucide-react';

const STATUS_OPTIONS = [
  'ALL',
  'RECEIVED',
  'PROCESSING',
  'QUALITY_CHECK',
  'READY_FOR_COLLECTION',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
  'CANCELLED',
];

const PAYMENT_OPTIONS = ['ALL', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED'];

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [paymentStatus, setPaymentStatus] = useState('ALL');
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['orders-list', search, status, paymentStatus, page],
    queryFn: async () => {
      let query = `?page=${page}&limit=15`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (status !== 'ALL') query += `&status=${status}`;
      if (paymentStatus !== 'ALL') query += `&paymentStatus=${paymentStatus}`;
      const res = await fetchApi(`/orders${query}`);
      return res.data;
    },
  });

  const orders = data?.orders || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Orders Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and process client dry cleaning & laundry tickets
          </p>
        </div>

        <Link
          href="/orders/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Order</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="w-full md:flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer name, phone number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Status:</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Filter */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Payment:</span>
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {PAYMENT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Intake Date</th>
                <th className="py-3.5 px-4">Ready Date</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Balance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length > 0 ? (
                orders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-sky-600">
                      <Link href={`/orders/${ord.id}`} className="hover:underline flex items-center gap-1.5">
                        <span>{ord.orderNumber}</span>
                        {ord.isPriority && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">
                            EXP
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{ord.customer?.name}</div>
                      <div className="text-xs text-slate-400">{ord.customer?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(ord.receivedDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {new Date(ord.expectedCompletionDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                      {ord._count?.garments || 0} garments
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₦{ord.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-bold ${
                          ord.balanceAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        ₦{ord.balanceAmount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          ord.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'READY_FOR_COLLECTION'
                            ? 'bg-teal-100 text-teal-800'
                            : ord.status === 'QUALITY_CHECK'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'PROCESSING'
                            ? 'bg-purple-100 text-purple-800'
                            : ord.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => downloadInvoicePdf(ord.id, ord.orderNumber)}
                          title="Download Invoice PDF"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/orders/${ord.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="View Order Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                    {isLoading ? 'Loading orders from database...' : 'No orders found matching filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page <span className="font-bold text-slate-800">{pagination.page}</span> of{' '}
              <span className="font-bold text-slate-800">{pagination.totalPages}</span> (
              {pagination.total} orders total)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
