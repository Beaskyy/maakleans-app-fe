'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/api';
import {
  User,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  CreditCard,
  Truck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Tag,
} from 'lucide-react';

interface GarmentLine {
  garmentType: string;
  serviceId: string;
  color: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  weightKg?: number;
  stainsOrDamage: string;
  specialInstructions: string;
}

export default function CreateOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Customer
  const [customerId, setCustomerId] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Step 2 & 3: Garments & Services
  const [garments, setGarments] = useState<GarmentLine[]>([
    {
      garmentType: "Men's Business Shirt",
      serviceId: '',
      color: 'White',
      brand: '',
      quantity: 1,
      unitPrice: 1500,
      stainsOrDamage: '',
      specialInstructions: 'Crisp collar steam',
    },
  ]);

  // Step 4: Schedule & Logistics
  const defaultReadyDate = new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0];
  const [expectedDate, setExpectedDate] = useState(defaultReadyDate);
  const [isPriority, setIsPriority] = useState(false);
  const [hasDelivery, setHasDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(2000);
  const [notes, setNotes] = useState('');

  // Step 5: Pricing & Initial Payment
  const [discount, setDiscount] = useState(0);
  const [initialPaymentAmount, setInitialPaymentAmount] = useState(0);
  const [initialPaymentMethod, setInitialPaymentMethod] = useState<'CASH' | 'POS' | 'BANK_TRANSFER' | 'CARD'>('POS');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Customers
  const { data: custData } = useQuery({
    queryKey: ['customers-picker'],
    queryFn: async () => {
      const res = await fetchApi('/customers?limit=100');
      return res.data.customers || [];
    },
  });

  // Fetch Services Catalogue
  const { data: servicesData } = useQuery({
    queryKey: ['services-picker'],
    queryFn: async () => {
      const res = await fetchApi('/services?activeOnly=true');
      return res.data || [];
    },
  });

  const services = servicesData || [];
  const customers = custData || [];

  // Set default serviceId when services load
  React.useEffect(() => {
    if (services.length > 0 && !garments[0].serviceId) {
      setGarments((prev) =>
        prev.map((g) => ({
          ...g,
          serviceId: services[0].id,
          unitPrice: services[0].unitPrice,
        }))
      );
    }
  }, [services]);

  const addGarmentRow = () => {
    const firstSvc = services[0] || { id: '', unitPrice: 2000 };
    setGarments([
      ...garments,
      {
        garmentType: 'Suit / Traditional Wear',
        serviceId: firstSvc.id,
        color: 'Navy',
        brand: '',
        quantity: 1,
        unitPrice: firstSvc.unitPrice,
        stainsOrDamage: '',
        specialInstructions: '',
      },
    ]);
  };

  const removeGarmentRow = (idx: number) => {
    if (garments.length <= 1) return;
    setGarments(garments.filter((_, i) => i !== idx));
  };

  const updateGarment = (idx: number, field: keyof GarmentLine, value: any) => {
    setGarments((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };

      if (field === 'serviceId') {
        const found = services.find((s: any) => s.id === value);
        if (found) {
          copy[idx].unitPrice = found.unitPrice;
        }
      }
      return copy;
    });
  };

  // Calculations
  const expressMultiplier = isPriority ? 1.5 : 1.0;
  const rawSubtotal = garments.reduce((sum, g) => {
    const price = Math.round(g.unitPrice * expressMultiplier);
    return sum + price * (g.quantity || 1);
  }, 0);
  const activeDeliveryFee = hasDelivery ? deliveryFee : 0;
  const taxableSubtotal = Math.max(0, rawSubtotal - discount);
  const taxAmount = Math.round(taxableSubtotal * 0.075);
  const totalAmount = taxableSubtotal + activeDeliveryFee + taxAmount;
  const outstandingBalance = Math.max(0, totalAmount - initialPaymentAmount);

  // Submit Order
  const handleSubmitOrder = async () => {
    setSubmitting(true);
    setError(null);

    try {
      let finalCustId = customerId;

      // If creating new customer first
      if (isNewCustomer) {
        if (!newCustName || !newCustPhone) {
          throw new Error('Please enter customer name and phone number');
        }
        const custRes = await fetchApi('/customers', {
          method: 'POST',
          body: JSON.stringify({
            name: newCustName,
            phone: newCustPhone,
            address: newCustAddress,
          }),
        });
        finalCustId = custRes.data.id;
      }

      if (!finalCustId) {
        throw new Error('Please select or create a customer for this order');
      }

      const payload = {
        customerId: finalCustId,
        expectedCompletionDate: new Date(expectedDate).toISOString(),
        isPriority,
        notes,
        hasPickupDelivery: hasDelivery,
        logisticsType: hasDelivery ? 'DELIVERY' : undefined,
        deliveryAddress: hasDelivery ? deliveryAddress : undefined,
        deliveryFee: activeDeliveryFee,
        discountAmount: discount,
        taxRatePercent: 7.5,
        initialPaymentAmount: initialPaymentAmount > 0 ? initialPaymentAmount : 0,
        initialPaymentMethod: initialPaymentAmount > 0 ? initialPaymentMethod : undefined,
        garments: garments.map((g) => ({
          garmentType: g.garmentType,
          serviceId: g.serviceId,
          color: g.color || undefined,
          brand: g.brand || undefined,
          quantity: Number(g.quantity) || 1,
          unitPrice: g.unitPrice,
          stainsOrDamage: g.stainsOrDamage || undefined,
          specialInstructions: g.specialInstructions || undefined,
        })),
      };

      const res = await fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success && res.data) {
        router.push(`/orders/${res.data.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Order Intake Wizard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Register garments, assign services, and calculate authoritative billing
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-2 ring-sky-300'
                  : step > s
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {step > s ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : s}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Select or Create Customer */}
      {step === 1 && (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Step 1: Select Customer</h2>
              <p className="text-xs text-slate-500">Pick an existing client or register a new one</p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewCustomer(!isNewCustomer)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-sky-300 text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors"
            >
              {isNewCustomer ? 'Select Existing Client' : '+ New Customer'}
            </button>
          </div>

          {!isNewCustomer ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Existing Customer
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">-- Choose a customer --</option>
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) {c.balance > 0 ? `— Due: ₦${c.balance.toLocaleString()}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {customerId && (
                <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 text-xs space-y-1 text-slate-700">
                  <div className="font-bold text-sky-900">
                    Selected:{' '}
                    {customers.find((c: any) => c.id === customerId)?.name}
                  </div>
                  <div>Phone: {customers.find((c: any) => c.id === customerId)?.phone}</div>
                  <div>Address: {customers.find((c: any) => c.id === customerId)?.address || 'None'}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chief Adeleke Johnson"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number (WhatsApp) *
                </label>
                <input
                  type="text"
                  placeholder="+234 803 123 4567"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Delivery / Home Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14 Glover Road, Ikoyi, Lagos"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="button"
              disabled={!isNewCustomer && !customerId}
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white font-bold rounded-xl shadow-md shadow-sky-600/20"
            >
              <span>Next: Add Garments</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Garments & Service Selection */}
      {step === 2 && (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Step 2: Add Garments & Services</h2>
              <p className="text-xs text-slate-500">Each item receives a unique tracking barcode</p>
            </div>
            <button
              type="button"
              onClick={addGarmentRow}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-4">
            {garments.map((g, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700 uppercase">Item #{idx + 1}</span>
                  </div>
                  {garments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGarmentRow(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Garment Description *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Silk Shirt, 3P Suit, Agbada"
                      value={g.garmentType}
                      onChange={(e) => updateGarment(idx, 'garmentType', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Service *
                    </label>
                    <select
                      value={g.serviceId}
                      onChange={(e) => updateGarment(idx, 'serviceId', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    >
                      {services.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (₦{s.unitPrice.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Color / Pattern
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Navy Blue, White"
                      value={g.color}
                      onChange={(e) => updateGarment(idx, 'color', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={g.quantity}
                      onChange={(e) => updateGarment(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Pre-existing Stains / Damage Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Coffee stain on cuff, small tear in lining"
                      value={g.stainsOrDamage}
                      onChange={(e) => updateGarment(idx, 'stainsOrDamage', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Special Care Instructions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Starch stiff collars, gentle steam"
                      value={g.specialInstructions}
                      onChange={(e) => updateGarment(idx, 'specialInstructions', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md shadow-sky-600/20"
            >
              <span>Next: Logistics & Pricing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Logistics, Price Calculation & Deposit */}
      {step === 3 && (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Step 3: Schedule, Logistics & Review</h2>
            <p className="text-xs text-slate-500">Authoritative calculation and initial payment</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logistics & Delivery Options */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Ready Date *
                </label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              {/* Express Priority Toggle */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Express VIP Turnaround (+50%)
                  </div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    Fast-tracks garments through steam and ironing bays
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isPriority}
                  onChange={(e) => setIsPriority(e.target.checked)}
                  className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
                />
              </div>

              {/* Pickup & Delivery Option */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-sky-600" />
                      Home / Office Delivery
                    </div>
                    <div className="text-[11px] text-slate-500">Schedule dispatch to address</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasDelivery}
                    onChange={(e) => setHasDelivery(e.target.checked)}
                    className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
                  />
                </div>

                {hasDelivery && (
                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                    <input
                      type="text"
                      placeholder="Delivery destination address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Fee (₦):</span>
                      <input
                        type="number"
                        value={deliveryFee}
                        onChange={(e) => setDeliveryFee(parseInt(e.target.value) || 0)}
                        className="w-24 p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-right"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Internal Operational Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes for washing crew or front desk..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Authoritative Financial Breakdown Box */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 mb-4">
                  Invoice & Settlement Summary
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Garments ({garments.length} lines):</span>
                    <span className="font-mono">₦{rawSubtotal.toLocaleString()}</span>
                  </div>

                  {isPriority && (
                    <div className="flex justify-between text-amber-400">
                      <span>Express Multiplier:</span>
                      <span>+50% Active</span>
                    </div>
                  )}

                  {hasDelivery && (
                    <div className="flex justify-between text-slate-300">
                      <span>Delivery Fee:</span>
                      <span className="font-mono">₦{deliveryFee.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-300">
                    <span>VAT / Tax (7.5%):</span>
                    <span className="font-mono">₦{taxAmount.toLocaleString()}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-extrabold text-white">
                    <span>Total Amount:</span>
                    <span className="text-sky-400 font-mono">₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Initial Payment / Deposit Form */}
                <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                  <span className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Initial Deposit / Payment (Optional)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Deposit (₦)"
                      value={initialPaymentAmount || ''}
                      onChange={(e) => setInitialPaymentAmount(parseInt(e.target.value) || 0)}
                      className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-sky-500"
                    />

                    <select
                      value={initialPaymentMethod}
                      onChange={(e: any) => setInitialPaymentMethod(e.target.value)}
                      className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none"
                    >
                      <option value="POS">POS Terminal</option>
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CARD">Card</option>
                    </select>
                  </div>

                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-slate-400">Remaining Balance:</span>
                    <span className="font-bold text-rose-400 font-mono">
                      ₦{outstandingBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitOrder}
                  className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-black rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Transaction...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Order & Print Invoice</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
