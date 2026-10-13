'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../lib/api';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  MapPin,
  Tag,
  Search,
  Filter,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';

export default function ProcessingQcPage() {
  const [activeTab, setActiveTab] = useState<'QC' | 'WASHING' | 'IRONING'>('QC');
  const [selectedGarment, setSelectedGarment] = useState<any | null>(null);
  const [qcNotes, setQcNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['qc-garments', activeTab],
    queryFn: async () => {
      const status =
        activeTab === 'QC'
          ? 'QUALITY_CONTROL'
          : activeTab === 'WASHING'
          ? 'WASHING'
          : 'IRONING';
      const res = await fetchApi(`/garments?status=${status}&limit=50`);
      return res.data?.garments || [];
    },
  });

  const garments = data || [];

  const handleQcDecision = async (decision: 'PASS' | 'REWASH' | 'DAMAGED') => {
    if (!selectedGarment) return;
    setSubmitting(true);

    try {
      let targetStatus = 'READY_FOR_COLLECTION';
      let targetLocation = 'Ready Rack A-01';

      if (decision === 'REWASH') {
        targetStatus = 'WASHING';
        targetLocation = 'Rewash Station (Stain Retreatment)';
      } else if (decision === 'DAMAGED') {
        targetStatus = 'DAMAGED';
        targetLocation = 'Claims & Customer Care Bay';
      }

      await fetchApi(`/garments/${selectedGarment.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: targetStatus,
          location: targetLocation,
          notes: qcNotes ? `QC [${decision}]: ${qcNotes}` : `QC ${decision} confirmed.`,
        }),
      });

      setSelectedGarment(null);
      setQcNotes('');
      queryClient.invalidateQueries({ queryKey: ['qc-garments'] });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Processing & Quality Control (QC)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Perform strict inspection on garments before customer handover and rack bagging
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        {[
          { key: 'QC', label: 'QC Inspection Bay' },
          { key: 'WASHING', label: 'Washing Station' },
          { key: 'IRONING', label: 'Steam Ironing Bay' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === t.key
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Queue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {garments.length > 0 ? (
          garments.map((g: any) => (
            <div
              key={g.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black bg-slate-900 text-sky-300 px-2.5 py-1 rounded-md">
                  {g.tagNumber}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Order #{g.order?.orderNumber}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{g.garmentType}</h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Client: <span className="font-semibold text-slate-800">{g.customer?.name}</span>
                </div>
              </div>

              <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Station: {g.currentLocation}</span>
                </div>
                {g.stainsOrDamage && (
                  <div className="text-rose-600 font-medium">⚠️ Intake note: {g.stainsOrDamage}</div>
                )}
                {g.specialInstructions && (
                  <div className="text-amber-700 font-medium">✨ Care: {g.specialInstructions}</div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedGarment(g);
                  setQcNotes('');
                }}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-sm shadow-sky-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Inspect Item</span>
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-sm text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            {isLoading
              ? 'Loading station queue...'
              : `No garments currently queued in ${activeTab} bay.`}
          </div>
        )}
      </div>

      {/* QC Inspection Modal */}
      {selectedGarment && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Quality Inspection Checklist</h3>
                <p className="text-xs text-slate-500">
                  Verify finish, crease, cleanliness, and scent
                </p>
              </div>
              <span className="font-mono text-xs font-black bg-slate-900 text-sky-300 px-2.5 py-1 rounded-md">
                {selectedGarment.tagNumber}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedGarment.garmentType}</div>
              <div>Customer: {selectedGarment.customer?.name}</div>
              {selectedGarment.stainsOrDamage && (
                <div className="text-rose-600 font-medium">
                  Reported stains: {selectedGarment.stainsOrDamage}
                </div>
              )}
            </div>

            {/* Checklist Items */}
            <div className="space-y-2 text-xs text-slate-700">
              {[
                'Collar, cuffs, and hem free of residue and soap marks',
                'No lingering stains or discoloration under natural light',
                'Steam pressed crisp without shine marks or burn glaze',
                'Buttons intact, zippers functional, fabric undamaged',
              ].map((item, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                QC Inspector Remarks
              </label>
              <textarea
                rows={2}
                placeholder="Passed inspection, ready for packaging..."
                value={qcNotes}
                onChange={(e) => setQcNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            {/* Decision Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQcDecision('PASS')}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Pass & Rack</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQcDecision('REWASH')}
                className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Rewash</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQcDecision('DAMAGED')}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Flag Damage</span>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedGarment(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
