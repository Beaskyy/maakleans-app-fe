'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi, downloadCsvReport } from '../../lib/api';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<'30days' | '90days' | 'year'>('30days');

  const { data, isLoading } = useQuery({
    queryKey: ['reports-overview-full', dateRange],
    queryFn: async () => {
      const res = await fetchApi('/reports/overview');
      return res.data;
    },
  });

  const summary = data?.summary || {
    totalOrderValue: 0,
    paymentsCollected: 0,
    outstandingBalance: 0,
    ordersToday: 0,
    ordersProcessing: 0,
    ordersReady: 0,
    overdueOrders: 0,
    totalCustomers: 0,
  };

  const revenueByService = data?.revenueByService || [];
  const ordersByStatus = data?.ordersByStatus || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Executive Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Reconciliation between booked order values and actual cash & bank settlements
          </p>
        </div>

        <button
          onClick={() => downloadCsvReport()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Full Orders CSV</span>
        </button>
      </div>

      {/* Financial Comparison Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Invoiced Value
          </span>
          <div className="text-3xl font-black text-slate-900">
            ₦{summary.totalOrderValue.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">Gross revenue generated across all tickets</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Realized Collections
          </span>
          <div className="text-3xl font-black text-emerald-600">
            ₦{summary.paymentsCollected.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">Verified deposits cleared in ledger</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Outstanding Receivables
          </span>
          <div className="text-3xl font-black text-rose-600">
            ₦{summary.outstandingBalance.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">Uncollected customer balances</p>
        </div>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">Service Revenue Performance</h2>
          <p className="text-xs text-slate-500 mb-6">Top earning laundry & dry cleaning service lines</p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByService} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis
                  dataKey="service"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip formatter={(val: any) => [`₦${Number(val).toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">Workload Distribution by Status</h2>
          <p className="text-xs text-slate-500 mb-6">Active volume pipeline</p>

          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersByStatus} layout="vertical" margin={{ left: 30, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis
                  dataKey="status"
                  type="category"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => val.replace(/_/g, ' ')}
                  width={110}
                />
                <Tooltip formatter={(val: any) => [`${val} orders`, 'Count']} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
