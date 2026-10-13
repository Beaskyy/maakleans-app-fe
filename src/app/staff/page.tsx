'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../lib/api';
import {
  UserCog,
  Plus,
  ShieldCheck,
  Mail,
  Phone,
  CheckCircle2,
  Lock,
  User,
} from 'lucide-react';

export default function StaffPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'OWNER' | 'MANAGER' | 'COUNTER_STAFF' | 'PROCESSING_STAFF' | 'DRIVER'>('COUNTER_STAFF');
  const [submitting, setSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['staff-list'],
    queryFn: async () => {
      const res = await fetchApi('/staff');
      return res.data || [];
    },
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setSubmitting(true);

    try {
      await fetchApi('/staff', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          password,
          role,
        }),
      });

      setCreateModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      queryClient.invalidateQueries({ queryKey: ['staff-list'] });
    } catch (err: any) {
      alert(err.message || 'Failed to add staff member');
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
            Staff & Role-Based Permissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enforce operational boundaries across front counter, washing bays, and delivery fleet
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffList.map((m: any) => (
          <div
            key={m.membershipId}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
                {m.role?.name?.replace(/_/g, ' ')}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">{m.user?.name}</h3>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{m.user?.email}</span>
              </div>
              {m.user?.phone && (
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{m.user?.phone}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Authorized Permissions ({m.role?.permissions?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1">
                {m.role?.permissions?.slice(0, 4).map((p: string) => (
                  <span
                    key={p}
                    className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono"
                  >
                    {p}
                  </span>
                ))}
                {(m.role?.permissions?.length || 0) > 4 && (
                  <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded">
                    +{m.role.permissions.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Permission Matrix Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">System Permission Security Matrix</h2>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-2">Role</th>
                <th className="pb-2">Orders</th>
                <th className="pb-2">Garments & QC</th>
                <th className="pb-2">Payments & Refunds</th>
                <th className="pb-2">Staff & Roles</th>
                <th className="pb-2">Reports & Exports</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2.5 font-bold text-slate-900">OWNER</td>
                <td className="py-2.5 text-emerald-600 font-bold">Full Access</td>
                <td className="py-2.5 text-emerald-600 font-bold">Full Access</td>
                <td className="py-2.5 text-emerald-600 font-bold">Full Access</td>
                <td className="py-2.5 text-emerald-600 font-bold">Full Access</td>
                <td className="py-2.5 text-emerald-600 font-bold">Full Access</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900">MANAGER</td>
                <td className="py-2.5 text-emerald-600 font-bold">Full Access</td>
                <td className="py-2.5 text-emerald-600 font-bold">Full Access</td>
                <td className="py-2.5 text-emerald-600 font-bold">Full Access</td>
                <td className="py-2.5 text-emerald-600 font-bold">Full Access</td>
                <td className="py-2.5 text-emerald-600 font-bold">Full Access</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900">COUNTER_STAFF</td>
                <td className="py-2.5 text-emerald-600 font-bold">Create / Edit</td>
                <td className="py-2.5 text-emerald-600 font-bold">Intake Tagging</td>
                <td className="py-2.5 text-emerald-600 font-bold">Record Payments</td>
                <td className="py-2.5 text-slate-300">Disabled</td>
                <td className="py-2.5 text-slate-300">Disabled</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900">PROCESSING_STAFF</td>
                <td className="py-2.5 text-slate-600">Read Only</td>
                <td className="py-2.5 text-emerald-600 font-bold">Move & QC</td>
                <td className="py-2.5 text-slate-300">Disabled</td>
                <td className="py-2.5 text-slate-300">Disabled</td>
                <td className="py-2.5 text-slate-300">Disabled</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900">DRIVER</td>
                <td className="py-2.5 text-slate-600">Read Only</td>
                <td className="py-2.5 text-slate-600">Location Move</td>
                <td className="py-2.5 text-slate-300">Disabled</td>
                <td className="py-2.5 text-slate-300">Disabled</td>
                <td className="py-2.5 text-slate-300">Disabled</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Staff Account</h3>

            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Staff Member Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tunde Alabi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="tunde@maakleans.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+234 802 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  System Role *
                </label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="COUNTER_STAFF">Counter Staff (Intake & Billing)</option>
                  <option value="PROCESSING_STAFF">Processing Staff (Wash, Iron & QC)</option>
                  <option value="DRIVER">Driver (Pickups & Deliveries)</option>
                  <option value="MANAGER">Manager (Operations & Reports)</option>
                  <option value="OWNER">Owner (Full Administrator)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                />
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
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
