'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../lib/api';
import Link from 'next/link';
import {
  Tag,
  Search,
  Filter,
  ArrowRight,
  MoveRight,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Loader2,
  ExternalLink,
} from 'lucide-react';

const STAGE_ORDER = [
  'RECEIVED',
  'INSPECTION',
  'AWAITING_PROCESSING',
  'WASHING',
  'DRY_CLEANING',
  'DRYING',
  'IRONING',
  'QUALITY_CONTROL',
  'READY_FOR_COLLECTION',
  'OUT_AT_PARTNER',
  'COLLECTED',
  'DAMAGED',
];

export default function GarmentTrackingPage() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [selectedGarment, setSelectedGarment] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const queryClient = useQueryClient();

  // Garments Query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['garments-list', search, stageFilter],
    queryFn: async () => {
      let query = `?limit=50`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (stageFilter !== 'ALL') query += `&status=${stageFilter}`;
      const res = await fetchApi(`/garments${query}`);
      return res.data;
    },
  });

  // Stage counts Query
  const { data: stageCounts } = useQuery({
    queryKey: ['garments-stages'],
    queryFn: async () => {
      const res = await fetchApi('/garments/stages');
      return res.data || {};
    },
  });

  const garments = data?.garments || [];

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGarment || !newStatus) return;

    setUpdating(true);
    try {
      await fetchApi(`/garments/${selectedGarment.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          location: newLocation || selectedGarment.currentLocation,
          notes: statusNotes || undefined,
        }),
      });

      setSelectedGarment(null);
      queryClient.invalidateQueries({ queryKey: ['garments-list'] });
      queryClient.invalidateQueries({ queryKey: ['garments-stages'] });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to update garment stage');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Garment Tracking & Processing Line
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Individual tag-level lifecycle tracking across factory stations
          </p>
        </div>

        <Link
          href="/external-batches"
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <span>External Partner Batches</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stage Distribution Pipeline Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {[
          { key: 'RECEIVED', label: 'Received' },
          { key: 'INSPECTION', label: 'Inspection' },
          { key: 'WASHING', label: 'Washing Bay' },
          { key: 'DRYING', label: 'Drying' },
          { key: 'IRONING', label: 'Steam Press' },
          { key: 'READY_FOR_COLLECTION', label: 'Ready Racks' },
        ].map((st) => (
          <button
            key={st.key}
            onClick={() => setStageFilter(stageFilter === st.key ? 'ALL' : st.key)}
            className={`p-3 rounded-xl border text-left transition-all ${
              stageFilter === st.key
                ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20'
                : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div
              className={`text-[11px] font-bold uppercase tracking-wider ${
                stageFilter === st.key ? 'text-sky-100' : 'text-slate-400'
              }`}
            >
              {st.label}
            </div>
            <div className="text-xl font-black mt-1">
              {stageCounts ? stageCounts[st.key] || 0 : 0}
            </div>
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Scan / Search garment tag (e.g. TAG-1001), description, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase">Stage:</span>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Stages</option>
            {STAGE_ORDER.map((st) => (
              <option key={st} value={st}>
                {st.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Garments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Garment Tag #</th>
                <th className="py-3.5 px-4">Item Description</th>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Current Bay / Rack</th>
                <th className="py-3.5 px-4">Current Stage</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {garments.length > 0 ? (
                garments.map((g: any) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-black bg-slate-900 text-sky-300 px-2.5 py-1 rounded-md tracking-wider">
                        {g.tagNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{g.garmentType}</div>
                      {g.color && <div className="text-xs text-slate-400">Color: {g.color}</div>}
                      {g.stainsOrDamage && (
                        <div className="text-[11px] text-rose-600 font-medium mt-0.5">
                          ⚠️ {g.stainsOrDamage}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-sky-600">
                      <Link href={`/orders/${g.order?.id}`} className="hover:underline">
                        {g.order?.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-800">
                      {g.customer?.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{g.currentLocation}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                          g.status === 'COLLECTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : g.status === 'READY_FOR_COLLECTION'
                            ? 'bg-teal-100 text-teal-800'
                            : g.status === 'QUALITY_CONTROL'
                            ? 'bg-amber-100 text-amber-800'
                            : g.status === 'OUT_AT_PARTNER'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {g.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedGarment(g);
                          setNewStatus(g.status);
                          setNewLocation(g.currentLocation);
                          setStatusNotes('');
                        }}
                        className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <MoveRight className="w-3.5 h-3.5" />
                        <span>Move Stage</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    {isLoading ? 'Loading garments...' : 'No garments found matching query.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Move Stage Modal */}
      {selectedGarment && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Update Garment Stage</h3>
            <p className="text-xs text-slate-500 mb-4">
              Moving tag{' '}
              <span className="font-mono font-bold text-sky-600">{selectedGarment.tagNumber}</span> (
              {selectedGarment.garmentType})
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Destination Processing Stage *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  {STAGE_ORDER.map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Physical Storage Location / Bay
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rack B-14, Washing Tumbler 3, QC Table 1"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Inspection / Transition Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Passed pre-wash inspection, stain treated"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedGarment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white shadow-md shadow-sky-600/20"
                >
                  {updating ? 'Updating...' : 'Save Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
