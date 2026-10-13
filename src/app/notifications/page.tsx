'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../lib/api';
import {
  MessageSquare,
  Send,
  Phone,
  CheckCircle2,
  ExternalLink,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function NotificationsPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [messageType, setMessageType] = useState('READY_FOR_COLLECTION');
  const [customText, setCustomText] = useState('');
  const [generatedWaUrl, setGeneratedWaUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications-history'],
    queryFn: async () => {
      const res = await fetchApi('/notifications');
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

  const selectedCust = customers.find((c: any) => c.id === selectedCustomerId);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;
    setSending(true);

    try {
      const messageBody =
        customText ||
        (messageType === 'READY_FOR_COLLECTION'
          ? `Hello ${selectedCust?.name}, your garments at MaakLeans are fresh, steam-pressed and READY FOR COLLECTION! Collection hours: 8am - 7pm.`
          : messageType === 'BALANCE_REMINDER'
          ? `Hello ${selectedCust?.name}, friendly reminder regarding your outstanding balance of ₦${selectedCust?.balance.toLocaleString()} at MaakLeans.`
          : `Hello ${selectedCust?.name}, your dry cleaning order has commenced processing at MaakLeans.`);

      const res = await fetchApi('/notifications/send', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomerId,
          channel: 'WHATSAPP',
          eventType: messageType,
          message: messageBody,
        }),
      });

      setGeneratedWaUrl(res.data?.whatsappUrl || null);
      queryClient.invalidateQueries({ queryKey: ['notifications-history'] });
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          WhatsApp & Client Communications
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Automated customer notification dispatch with direct click-to-WhatsApp fallbacks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Message Generator Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Send WhatsApp Message</h2>

          <form onSubmit={handleGenerate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Recipient Customer *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  setGeneratedWaUrl(null);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="">-- Choose recipient --</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Event Template
              </label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="READY_FOR_COLLECTION">Ready for Collection Alert</option>
                <option value="PROCESSING">Processing Commenced Update</option>
                <option value="BALANCE_REMINDER">Outstanding Balance Reminder</option>
                <option value="DELIVERY_SCHEDULED">Delivery Scheduled Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Custom Message (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Leave blank to use official system template..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={sending || !selectedCustomerId}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Generating...' : 'Log & Generate WhatsApp Link'}</span>
            </button>
          </form>

          {generatedWaUrl && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Notification Prepared!
              </div>
              <a
                href={generatedWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <span>Open in WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Right: Notification History Log */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Dispatched Notification Log</h2>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {notifications.length > 0 ? (
              notifications.map((n: any) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{n.customer?.name || 'Customer'}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono">
                        {n.channel}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">{n.content}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Event: {n.eventType}</span>
                    <span className="text-emerald-600 font-semibold">{n.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">
                No notification history logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
