'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi, downloadCsvReport } from '../lib/api';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Users,
  Download,
  Calendar,
  ArrowUpRight,
  Truck,
  Plus,
  RefreshCw,
  ArrowRight,
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
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: '#0284c7', // Sky
  PROCESSING: '#8b5cf6', // Violet
  QUALITY_CHECK: '#f59e0b', // Amber
  READY_FOR_COLLECTION: '#10b981', // Emerald
  OUT_FOR_DELIVERY: '#06b6d4', // Cyan
  COMPLETED: '#16a34a', // Green
  CANCELLED: '#ef4444', // Red
};

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['dashboard-overview', timeframe],
    queryFn: async () => {
      let query = '';
      if (timeframe === 'today') {
        const today = new Date().toISOString().split('T')[0];
        query = `?dateFrom=${today}T00:00:00Z&dateTo=${today}T23:59:59Z`;
      } else if (timeframe === 'week') {
        const lastWeek = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
        query = `?dateFrom=${lastWeek}`;
      } else if (timeframe === 'month') {
        const lastMonth = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
        query = `?dateFrom=${lastMonth}`;
      }
      const res = await fetchApi(`/reports/overview${query}`);
      return res.data;
    },
  });

  const summary = data?.summary || {
    ordersToday: 0,
    ordersProcessing: 0,
    ordersReady: 0,
    overdueOrders: 0,
    totalOrderValue: 0,
    paymentsCollected: 0,
    outstandingBalance: 0,
    totalCustomers: 0,
  };

  const ordersByStatus = data?.ordersByStatus || [];
  const revenueByService = data?.revenueByService || [];
  const recentOrders = data?.recentOrders || [];
  const upcomingDeliveries = data?.upcomingDeliveries || [];
  const recentPayments = data?.recentPayments || [];

  return (
    <div className="space-y-8">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time multi-tenant metrics derived directly from database records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Timeframe Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center text-xs font-semibold shadow-sm overflow-x-auto max-w-full">
            {(['today', 'week', 'month', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all capitalize whitespace-nowrap ${
                  timeframe === t
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'today' ? 'Today' : t === 'week' ? '7 Days' : t === 'month' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 sm:p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-sm transition-colors"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-sky-600' : ''}`} />
            </button>

            <button
              onClick={() => downloadCsvReport()}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <Link
              href="/orders/new"
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Intake Order</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Orders Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Intake
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl md:text-3xl font-extrabold text-slate-900">
            {summary.ordersToday}
          </div>
          <div className="text-xs text-slate-500 mt-1">Orders logged today</div>
        </div>

        {/* Processing Queue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              In Processing
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl md:text-3xl font-extrabold text-purple-600">
            {summary.ordersProcessing}
          </div>
          <div className="text-xs text-slate-500 mt-1">Washing, Drying & Ironing</div>
        </div>

        {/* Ready for Collection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ready on Racks
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl md:text-3xl font-extrabold text-emerald-600">
            {summary.ordersReady}
          </div>
          <div className="text-xs text-slate-500 mt-1">Awaiting client collection</div>
        </div>

        {/* Overdue Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overdue Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl md:text-3xl font-extrabold text-rose-600">
            {summary.overdueOrders}
          </div>
          <div className="text-xs text-slate-500 mt-1">Past promised ready date</div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Order Value */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 sm:p-6 rounded-2xl shadow-md border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Total Order Value
            </span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3 text-2xl md:text-3xl font-black text-white">
            ₦{summary.totalOrderValue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Booked orders & services revenue</div>
        </div>

        {/* Payments Collected */}
        <div className="bg-gradient-to-br from-emerald-900/90 to-emerald-800 text-white p-5 sm:p-6 rounded-2xl shadow-md border border-emerald-700/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Payments Collected
            </span>
            <CreditCard className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="mt-3 text-2xl md:text-3xl font-black text-white">
            ₦{summary.paymentsCollected.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-200 mt-1">Actual verified bank & cash deposits</div>
        </div>

        {/* Outstanding Receivables */}
        <div className="sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-amber-900/90 to-amber-800 text-white p-5 sm:p-6 rounded-2xl shadow-md border border-amber-700/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
              Outstanding Balances
            </span>
            <Users className="w-4 h-4 text-amber-300" />
          </div>
          <div className="mt-3 text-2xl md:text-3xl font-black text-white">
            ₦{summary.outstandingBalance.toLocaleString()}
          </div>
          <div className="text-xs text-amber-200 mt-1">Customer receivables due on collection</div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders by Status (Pie Distribution) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm min-w-0">
          <h2 className="text-base font-bold text-slate-900 mb-1">Orders by Processing Status</h2>
          <p className="text-xs text-slate-500 mb-4">Live workload breakdown</p>

          <div className="h-64 flex items-center justify-center">
            {ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {ordersByStatus.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} orders`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-slate-400">No order data</div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {ordersByStatus.map((item: any) => (
              <div key={item.status} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[item.status] || '#94a3b8' }}
                ></span>
                <span className="text-slate-600 truncate">{item.status}:</span>
                <span className="font-bold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Service Type (Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900">Revenue by Service Category</h2>
              <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg">
                Top Earners (₦)
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6">Historical itemized billing distribution</p>

            <div className="h-64">
              {revenueByService.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByService} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <XAxis
                      dataKey="service"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`₦${Number(val).toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-slate-400">
                  No service revenue recorded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Operational Queues: Recent Orders & Upcoming Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Customer Orders</h2>
              <p className="text-xs text-slate-500">Live order intake queue</p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[580px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Garments</th>
                  <th className="pb-3">Total (₦)</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-semibold text-sky-600">
                      <Link href={`/orders/${ord.id}`} className="hover:underline">
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-800 font-medium">{ord.customer?.name}</td>
                    <td className="py-3 text-slate-500">{ord._count?.garments || 0} items</td>
                    <td className="py-3 font-bold text-slate-900">
                      ₦{ord.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${STATUS_COLORS[ord.status] || '#64748b'}20`,
                          color: STATUS_COLORS[ord.status] || '#64748b',
                        }}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ord.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : ord.paymentStatus === 'PARTIALLY_PAID'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {ord.paymentStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Logistics & Deliveries */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Upcoming Deliveries</h2>
                <p className="text-xs text-slate-500">Pickups & drops scheduled</p>
              </div>
              <Link
                href="/logistics"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <span>Logistics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingDeliveries.length > 0 ? (
                upcomingDeliveries.map((del: any) => (
                  <div
                    key={del.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-sky-100 text-sky-700 shrink-0 mt-0.5">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {del.customer?.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {new Date(del.scheduledDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{del.address}</div>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Driver: {del.driver?.name || 'Unassigned'}</span>
                        <span className="font-semibold text-sky-600 uppercase text-[10px]">
                          {del.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-slate-400">
                  No upcoming delivery dispatches
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
