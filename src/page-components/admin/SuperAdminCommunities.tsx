'use client';

import React, { useState, useEffect } from 'react';
import { Community } from '../../types';
import { getCommunities, createCommunity, updateCommunity, deleteCommunity } from '../../services/communityService';
import { PlusCircle, Edit2, Trash2, X, Building2, CheckCircle2 } from 'lucide-react';

export const SuperAdminCommunities: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Community>>({
    name: '', city: '', state: '', adminName: '', adminRoleTitle: '',
    avatar: '', totalMembers: 0, activeCampaigns: 0, totalRaisedINR: 0,
    healthScore: 100, verifiedStatus: 'Verified', description: '',
    establishedYear: new Date().getFullYear(), coverImage: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCommunities();
      setCommunities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '', city: '', state: '', adminName: '', adminRoleTitle: '',
      avatar: '', totalMembers: 0, activeCampaigns: 0, totalRaisedINR: 0,
      healthScore: 100, verifiedStatus: 'Verified', description: '',
      establishedYear: new Date().getFullYear(), coverImage: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comm: Community) => {
    setEditingId(comm.id);
    setFormData(comm);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this community?')) {
      try {
        await deleteCommunity(id);
        fetchData();
      } catch (err: any) {
        console.error(err);
        alert(err.message || 'Failed to delete community');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCommunity(editingId, formData);
      } else {
        await createCommunity(formData as Omit<Community, 'id'>);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save community');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            Manage Communities
          </h2>
          <p className="text-xs text-slate-400">Add, edit, or remove communities from the platform.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" /> Add Community
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((c) => (
            <div key={c.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img src={c.avatar || 'https://via.placeholder.com/150'} alt={c.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
                  <div>
                    <h4 className="font-bold text-sm text-white line-clamp-1" title={c.name}>{c.name}</h4>
                    <p className="text-xs text-slate-400">{c.city}, {c.state}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <p><strong className="text-slate-300">Admin:</strong> {c.adminName} ({c.adminRoleTitle})</p>
                  <p><strong className="text-slate-300">Members:</strong> {c.totalMembers.toLocaleString()}</p>
                  <p><strong className="text-slate-300">Raised:</strong> ₹{c.totalRaisedINR.toLocaleString()}</p>
                  <p><strong className="text-slate-300">Status:</strong> 
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      c.verifiedStatus === 'Verified' ? 'bg-emerald-900/50 text-emerald-400' :
                      c.verifiedStatus === 'Pending' ? 'bg-amber-900/50 text-amber-400' : 'bg-rose-900/50 text-rose-400'
                    }`}>
                      {c.verifiedStatus}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="flex-1 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="font-black text-white text-lg">
                {editingId ? 'Edit Community' : 'Add New Community'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="community-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic Details */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-400 mb-3 border-b border-slate-800 pb-1">Basic Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Community Name</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Established Year</label>
                      <input required type="number" name="establishedYear" value={formData.establishedYear} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">City</label>
                      <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">State</label>
                      <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Admin Details */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-400 mb-3 border-b border-slate-800 pb-1">Admin Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Admin Name</label>
                      <input required type="text" name="adminName" value={formData.adminName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Admin Role Title</label>
                      <input required type="text" name="adminRoleTitle" value={formData.adminRoleTitle} onChange={handleChange} placeholder="e.g. Community Administrator" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-400 mb-3 border-b border-slate-800 pb-1">Metrics & Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Total Members</label>
                      <input type="number" name="totalMembers" value={formData.totalMembers} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Active Campaigns</label>
                      <input type="number" name="activeCampaigns" value={formData.activeCampaigns} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Total Raised (INR)</label>
                      <input type="number" name="totalRaisedINR" value={formData.totalRaisedINR} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Health Score (0-100)</label>
                      <input type="number" name="healthScore" min="0" max="100" value={formData.healthScore} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Verified Status</label>
                      <select name="verifiedStatus" value={formData.verifiedStatus} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none">
                        <option value="Verified">Verified</option>
                        <option value="Pending">Pending</option>
                        <option value="Flagged">Flagged</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Media & Description */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-400 mb-3 border-b border-slate-800 pb-1">Media & Description</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Avatar Image URL</label>
                      <input type="text" name="avatar" value={formData.avatar} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Cover Image URL</label>
                      <input type="text" name="coverImage" value={formData.coverImage} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Description</label>
                      <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none resize-none"></textarea>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-300 font-bold text-sm hover:bg-slate-800 transition-all">
                Cancel
              </button>
              <button type="submit" form="community-form" className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20">
                <CheckCircle2 className="w-4 h-4" /> Save Community
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
