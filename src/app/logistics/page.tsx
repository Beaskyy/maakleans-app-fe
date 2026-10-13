'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../lib/api';
import Link from 'next/link';
import {
  Truck,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  Search,
} from 'lucide-react';

export default function LogisticsPage() {
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PICKUP' | 'DELIVERY'>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New logistics form
  const [customerId, setCustomerId] = useState('');
  const [logisticsType, setLogisticsType] = useState<'PICKUP' | 'DELIVERY'>('DELIVERY');
  const [address, setAddress] = useState('');
  const [fee, setFee] = useState(2500);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [driverId, setDriverId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ['logistics-list', typeFilter, statusFilter],
    queryFn: async () => {
      let query = '';
      if (typeFilter !== 'ALL') query += `?type=${typeFilter}`;
      if (statusFilter !== 'ALL') query += `${query ? '&' : '?'}status=${statusFilter}`;
      const res = await fetchApi(`/logistics${query}`);
      return res.data || [];
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers-picker'],
    queryFn: async () => {
      const res = await fetchApi('/customers?limit=100');
      return res.data?.customers || [];
    },
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ['staff-list'],
    queryFn: async () => {
      const res = await fetchApi('/staff');
      return res.data || [];
    },
  });

  const drivers = staffList.filter((s: any) => s.role?.name === 'DRIVER' || s.role?.name === 'MANAGER');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !address) return;
    setSubmitting(true);

    try {
      await fetchApi('/logistics', {
        method: 'POST',
        body: JSON.stringify({
          customerId,
          type: logisticsType,
          scheduledDate: new Date(scheduledDate).toISOString(),
          address,
          fee,
          driverId: driverId || undefined,
          notes,
        }),
      });

      setCreateModalOpen(false);
      setAddress('');
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['logistics-list'] });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule dispatch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await fetchApi(`/logistics/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      queryClient.invalidateQueries({ queryKey: ['logistics-list'] });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pickups & Deliveries (Logistics)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dispatch fleet management, scheduled home deliveries, and intake collections
          </p>
        </div>

        <button
          onClick={() => {
            if (customers.length > 0) {
              setCustomerId(customers[0].id);
              setAddress(customers[0].address || '');
            }
            if (drivers.length > 0) setDriverId(drivers[0].user?.id);
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Dispatch</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-4 sm:gap-6 overflow-x-auto">
        {(['ALL', 'DELIVERY', 'PICKUP'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              typeFilter === t
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t === 'ALL' ? 'All Dispatches' : t === 'DELIVERY' ? 'Deliveries (Drop-off)' : 'Pickups (Intake)'}
          </button>
        ))}
      </div>

      {/* Logistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length > 0 ? (
          items.map((item: any) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    item.type === 'DELIVERY'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {item.type}
                </span>

                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    item.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'IN_TRANSIT'
                      ? 'bg-amber-100 text-amber-800'
                      : item.status === 'FAILED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{item.customer?.name}</h3>
                <div className="text-xs text-slate-500">{item.customer?.phone}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-start gap-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{item.address}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                  <span className="text-slate-400">Scheduled:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(item.scheduledDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Driver:</span>
                  <span className="font-bold text-sky-700">
                    {item.driver?.name || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Status Update Quick Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                {item.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'IN_TRANSIT')}
                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Dispatch / In Transit
                  </button>
                )}
                {item.status === 'IN_TRANSIT' && (
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'COMPLETED')}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Confirm Delivery
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-sm text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            {isLoading ? 'Loading dispatches...' : 'No pickups or deliveries scheduled.'}
          </div>
        )}
      </div>

      {/* Schedule Dispatch Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Schedule Pickup or Delivery</h3>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Customer *
                </label>
                <select
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    const found = customers.find((c: any) => c.id === e.target.value);
                    if (found && found.address) setAddress(found.address);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Logistics Type *
                  </label>
                  <select
                    value={logisticsType}
                    onChange={(e: any) => setLogisticsType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="DELIVERY">Delivery Drop-off</option>
                    <option value="PICKUP">Pickup Intake</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Destination Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Plot 14 Admiralty Way, Lekki, Lagos"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Assigned Driver
                  </label>
                  <select
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="">Unassigned</option>
                    {drivers.map((d: any) => (
                      <option key={d.user?.id} value={d.user?.id}>
                        {d.user?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Delivery Fee (₦)
                  </label>
                  <input
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(parseInt(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20"
                >
                  {submitting ? 'Scheduling...' : 'Save Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
