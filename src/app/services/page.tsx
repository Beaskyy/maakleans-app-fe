'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../lib/api';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Zap,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function ServicesPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // New Service Form
  const [name, setName] = useState('');
  const [serviceCode, setServiceCode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [pricingModel, setPricingModel] = useState<'PER_ITEM' | 'PER_KG' | 'BUNDLE' | 'FIXED'>('PER_ITEM');
  const [unitPrice, setUnitPrice] = useState<number>(2000);
  const [turnaroundHours, setTurnaroundHours] = useState<number>(24);
  const [expressAvailable, setExpressAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const queryClient = useQueryClient();

  // Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-list'],
    queryFn: async () => {
      const res = await fetchApi('/services/categories');
      return res.data || [];
    },
  });

  // Services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services-list', selectedCategory],
    queryFn: async () => {
      let query = `?activeOnly=false`;
      if (selectedCategory !== 'ALL') query += `&categoryId=${selectedCategory}`;
      const res = await fetchApi(`/services${query}`);
      return res.data || [];
    },
  });

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !serviceCode || !categoryId) return;
    setSubmitting(true);

    try {
      await fetchApi('/services', {
        method: 'POST',
        body: JSON.stringify({
          name,
          serviceCode,
          categoryId,
          pricingModel,
          unitPrice,
          turnaroundHours,
          expressAvailable,
          expressPriceMultiplier: 1.5,
        }),
      });

      setCreateModalOpen(false);
      setName('');
      setServiceCode('');
      setUnitPrice(2000);
      queryClient.invalidateQueries({ queryKey: ['services-list'] });
    } catch (err: any) {
      alert(err.message || 'Failed to create service');
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
            Services & Pricing Catalogue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure dry cleaning, steam pressing, and wash rate models with express multipliers
          </p>
        </div>

        <button
          onClick={() => {
            if (categories.length > 0) setCategoryId(categories[0].id);
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Categories ({services.length})
        </button>
        {categories.map((c: any) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === c.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.length > 0 ? (
          services.map((svc: any) => (
            <div
              key={svc.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {svc.serviceCode}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                  {svc.pricingModel.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{svc.name}</h3>
                <div className="text-xs text-slate-400 mt-0.5">{svc.category?.name}</div>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                <div className="text-xl font-black text-slate-900">
                  ₦{svc.unitPrice.toLocaleString()}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    {svc.pricingModel === 'PER_KG' ? '/ kg' : '/ item'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{svc.turnaroundHours}h</span>
                </div>
              </div>

              {svc.expressAvailable && (
                <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg flex items-center gap-1.5 font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Express Available (+50% Rate)</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-sm text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            {isLoading ? 'Loading services...' : 'No services found in this category.'}
          </div>
        )}
      </div>

      {/* Create Service Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Service to Catalogue</h3>

            <form onSubmit={handleCreateService} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kaftan Wash & Steam Press"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Service Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TRAD-KAFTAN"
                    value={serviceCode}
                    onChange={(e) => setServiceCode(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Unit Price (₦) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Pricing Model
                  </label>
                  <select
                    value={pricingModel}
                    onChange={(e: any) => setPricingModel(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="PER_ITEM">Per Item</option>
                    <option value="PER_KG">Per KG</option>
                    <option value="BUNDLE">Bundle / Set</option>
                    <option value="FIXED">Fixed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Turnaround (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={turnaroundHours}
                    onChange={(e) => setTurnaroundHours(parseInt(e.target.value) || 24)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="expressCheck"
                    checked={expressAvailable}
                    onChange={(e) => setExpressAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <label htmlFor="expressCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Express Option (+50%)
                  </label>
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
                  {submitting ? 'Saving...' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
