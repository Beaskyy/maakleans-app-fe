'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../lib/api';
import {
  Layers,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Building,
  Clock,
  ArrowRight,
  ShieldCheck,
  Tag,
} from 'lucide-react';

export default function ExternalBatchesPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [reconcileModalBatch, setReconcileModalBatch] = useState<any | null>(null);

  // Create Batch fields
  const [partnerId, setPartnerId] = useState('');
  const [selectedGarmentIds, setSelectedGarmentIds] = useState<string[]>([]);
  const [expectedReturnDate, setExpectedReturnDate] = useState(
    new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [batchNotes, setBatchNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reconcile fields
  const [returnedIds, setReturnedIds] = useState<string[]>([]);
  const [damagedIds, setDamagedIds] = useState<string[]>([]);
  const [missingIds, setMissingIds] = useState<string[]>([]);
  const [reconcileNotes, setReconcileNotes] = useState('');

  const queryClient = useQueryClient();

  // Batches
  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['external-batches'],
    queryFn: async () => {
      const res = await fetchApi('/garments/external/batches');
      return res.data || [];
    },
  });

  // Partners
  const { data: partners = [] } = useQuery({
    queryKey: ['external-partners'],
    queryFn: async () => {
      const res = await fetchApi('/garments/external/partners');
      return res.data || [];
    },
  });

  // Available garments for dispatch
  const { data: availableGarments = [] } = useQuery({
    queryKey: ['available-dispatch-garments'],
    queryFn: async () => {
      const res = await fetchApi('/garments?limit=100');
      const all = res.data?.garments || [];
      return all.filter((g: any) => g.status !== 'COLLECTED' && g.status !== 'OUT_AT_PARTNER');
    },
  });

  // Submit new batch dispatch
  const handleDispatchBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId || selectedGarmentIds.length === 0) {
      alert('Please select a partner and at least one garment');
      return;
    }
    setSubmitting(true);
    try {
      await fetchApi('/garments/external/batches', {
        method: 'POST',
        body: JSON.stringify({
          partnerId,
          garmentIds: selectedGarmentIds,
          expectedReturnDate: new Date(expectedReturnDate).toISOString(),
          notes: batchNotes,
        }),
      });
      setCreateModalOpen(false);
      setSelectedGarmentIds([]);
      setBatchNotes('');
      queryClient.invalidateQueries({ queryKey: ['external-batches'] });
    } catch (err: any) {
      alert(err.message || 'Dispatch failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reconciliation
  const handleReconcileBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcileModalBatch) return;

    setSubmitting(true);
    try {
      await fetchApi('/garments/external/batches/reconcile', {
        method: 'POST',
        body: JSON.stringify({
          batchId: reconcileModalBatch.id,
          returnedGarmentIds: returnedIds,
          damagedGarmentIds: damagedIds,
          missingGarmentIds: missingIds,
          notes: reconcileNotes,
        }),
      });
      setReconcileModalBatch(null);
      queryClient.invalidateQueries({ queryKey: ['external-batches'] });
    } catch (err: any) {
      alert(err.message || 'Reconciliation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            External Partner Processing
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dispatch garments to industrial partners and reconcile returns with defect checks
          </p>
        </div>

        <button
          onClick={() => {
            if (partners.length > 0) setPartnerId(partners[0].id);
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New Batch</span>
        </button>
      </div>

      {/* Batches Grid */}
      <div className="space-y-4">
        {batches.length > 0 ? (
          batches.map((b: any) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-sm font-black text-slate-900">{b.batchNumber}</span>
                    <span className="text-xs text-slate-500 ml-2">
                      Partner:{' '}
                      <span className="font-semibold text-slate-800">{b.partner?.name}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                      b.status === 'RECONCILED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'DISCREPANCY'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {b.status.replace(/_/g, ' ')}
                  </span>

                  {b.status === 'OUT_AT_PARTNER' && (
                    <button
                      onClick={() => {
                        setReconcileModalBatch(b);
                        const allIds = b.items?.map((it: any) => it.garmentId) || [];
                        setReturnedIds(allIds);
                        setDamagedIds([]);
                        setMissingIds([]);
                        setReconcileNotes('');
                      }}
                      className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-sky-600/20"
                    >
                      Reconcile Return
                    </button>
                  )}
                </div>
              </div>

              {/* Items in Batch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {b.items?.map((it: any) => (
                  <div
                    key={it.id}
                    className="p-3 rounded-xl border border-slate-200/70 bg-slate-50/60 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">
                        {it.garment?.tagNumber}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{it.status}</span>
                    </div>
                    <div className="font-medium text-slate-700 truncate">
                      {it.garment?.garmentType}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Client: {it.garment?.customer?.name}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <div>
                  Dispatched {new Date(b.sentDate).toLocaleDateString()} • Expected Return:{' '}
                  <span className="font-semibold text-slate-700">
                    {new Date(b.expectedReturnDate).toLocaleDateString()}
                  </span>
                </div>
                {b.notes && <div className="italic text-slate-600">{b.notes}</div>}
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center text-sm text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            {isLoading ? 'Loading batches...' : 'No external partner batches dispatched yet.'}
          </div>
        )}
      </div>

      {/* Dispatch Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Dispatch Batch to External Partner</h3>

            <form onSubmit={handleDispatchBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  External Partner Processor *
                </label>
                <select
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  {partners.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Expected Return Date *
                </label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Garments to Dispatch ({selectedGarmentIds.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50">
                  {availableGarments.map((g: any) => {
                    const isChecked = selectedGarmentIds.includes(g.id);
                    return (
                      <label
                        key={g.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-100 text-xs cursor-pointer hover:bg-sky-50/50"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGarmentIds([...selectedGarmentIds, g.id]);
                            } else {
                              setSelectedGarmentIds(selectedGarmentIds.filter((id) => id !== g.id));
                            }
                          }}
                          className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                        />
                        <span className="font-mono font-bold text-slate-900">{g.tagNumber}</span>
                        <span className="text-slate-700 font-medium">{g.garmentType}</span>
                        <span className="text-slate-400 ml-auto">{g.customer?.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Special steam pleating instructions"
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || selectedGarmentIds.length === 0}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white shadow-md shadow-sky-600/20"
                >
                  {submitting ? 'Dispatching...' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reconcile Modal */}
      {reconcileModalBatch && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Reconcile Return: {reconcileModalBatch.batchNumber}
            </h3>
            <p className="text-xs text-slate-500">
              Verify all items received back from {reconcileModalBatch.partner?.name}
            </p>

            <form onSubmit={handleReconcileBatch} className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {reconcileModalBatch.items?.map((it: any) => {
                  const gId = it.garmentId;
                  const isReturned = returnedIds.includes(gId);
                  const isDamaged = damagedIds.includes(gId);
                  const isMissing = missingIds.includes(gId);

                  return (
                    <div
                      key={it.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono font-bold text-slate-900">
                          {it.garment?.tagNumber}
                        </div>
                        <div className="text-slate-600">{it.garment?.garmentType}</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setReturnedIds([...returnedIds.filter((id) => id !== gId), gId]);
                            setDamagedIds(damagedIds.filter((id) => id !== gId));
                            setMissingIds(missingIds.filter((id) => id !== gId));
                          }}
                          className={`px-2 py-1 rounded text-[11px] font-bold ${
                            isReturned
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-600'
                          }`}
                        >
                          OK
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDamagedIds([...damagedIds.filter((id) => id !== gId), gId]);
                            setReturnedIds(returnedIds.filter((id) => id !== gId));
                            setMissingIds(missingIds.filter((id) => id !== gId));
                          }}
                          className={`px-2 py-1 rounded text-[11px] font-bold ${
                            isDamaged
                              ? 'bg-rose-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-600'
                          }`}
                        >
                          Damaged
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMissingIds([...missingIds.filter((id) => id !== gId), gId]);
                            setReturnedIds(returnedIds.filter((id) => id !== gId));
                            setDamagedIds(damagedIds.filter((id) => id !== gId));
                          }}
                          className={`px-2 py-1 rounded text-[11px] font-bold ${
                            isMissing
                              ? 'bg-purple-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-600'
                          }`}
                        >
                          Missing
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reconciliation Notes
                </label>
                <input
                  type="text"
                  placeholder="Notes regarding discrepancy or return delivery condition"
                  value={reconcileNotes}
                  onChange={(e) => setReconcileNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReconcileModalBatch(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20"
                >
                  {submitting ? 'Saving...' : 'Complete Reconciliation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
