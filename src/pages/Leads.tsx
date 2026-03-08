import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowUpDown, Mail, Phone, MoreHorizontal, ExternalLink, Plus, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/app-store';
import { Lead } from '../types';
import { CreateContactModal } from '../components/CreateContactModal';

const statusColors: Record<string, string> = {
  new: 'bg-secondary/10 text-secondary',
  contacted: 'bg-warning/10 text-warning',
  qualified: 'bg-success/10 text-success',
  unqualified: 'bg-error/10 text-error',
};

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-error';
};

export const Leads: React.FC = () => {
  const { leads, searchQuery } = useAppStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'lastActivity'>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let result = [...leads];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((l) => l.status === statusFilter);
    }
    result.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'score') return (a.score - b.score) * dir;
      if (sortBy === 'name') return a.name.localeCompare(b.name) * dir;
      return a.lastActivity.localeCompare(b.lastActivity) * dir;
    });
    return result;
  }, [leads, searchQuery, statusFilter, sortBy, sortDir]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Leads</h1>
          <p className="text-textSecondary text-sm">{filtered.length} leads found</p>
        </div>
        <button onClick={() => { setEditId(undefined); setShowCreateModal(true); }} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2">
          <Plus size={16} /> Add Contact
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Filter size={16} className="text-textSecondary" />
          {['all', 'new', 'contacted', 'qualified', 'unqualified'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors text-sm ${
                statusFilter === s ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-surface'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-textSecondary text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">
                <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-text">
                  Lead <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="px-6 py-4 font-medium">Source</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">
                <button onClick={() => toggleSort('score')} className="flex items-center gap-1 hover:text-text">
                  Score <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="px-6 py-4 font-medium">
                <button onClick={() => toggleSort('lastActivity')} className="flex items-center gap-1 hover:text-text">
                  Last Activity <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="px-6 py-4 font-medium w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead, i) => (
              <LeadRow key={lead.id} lead={lead} index={i} />
            ))}
          </tbody>
        </table>
      </div>

      <CreateContactModal open={showCreateModal} onClose={() => { setShowCreateModal(false); setEditId(undefined); }} editId={editId} />
    </motion.div>
  );
};

const LeadRow: React.FC<{ lead: Lead; index: number }> = ({ lead, index }) => {
  const navigate = useNavigate();
  const { setSelectedLeadId } = useAppStore();

  const handleViewDetail = () => {
    setSelectedLeadId(lead.id);
    navigate(`/lead/${lead.id}`);
  };

  return (
  <motion.tr
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03 }}
    className="border-b border-border/50 hover:bg-surface/30 transition-colors cursor-pointer"
    onClick={handleViewDetail}
  >
    <td className="px-6 py-4">
      <div>
        <p className="text-sm font-medium">{lead.name}</p>
        <p className="text-xs text-textSecondary">{lead.company}</p>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className="text-sm text-textSecondary">{lead.source}</span>
    </td>
    <td className="px-6 py-4">
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[lead.status]}`}>
        {lead.status}
      </span>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${lead.score >= 80 ? 'bg-success' : lead.score >= 60 ? 'bg-warning' : 'bg-error'}`} style={{ width: `${lead.score}%` }} />
        </div>
        <span className={`text-sm font-semibold ${scoreColor(lead.score)}`}>{lead.score}</span>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className="text-sm text-textSecondary">{lead.lastActivity}</span>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button className="p-1.5 hover:bg-surface rounded-lg transition-colors text-textSecondary hover:text-text">
          <Mail size={14} />
        </button>
        <button className="p-1.5 hover:bg-surface rounded-lg transition-colors text-textSecondary hover:text-text">
          <Phone size={14} />
        </button>
        <button onClick={handleViewDetail} className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-textSecondary hover:text-primary" title="View details">
          <ExternalLink size={14} />
        </button>
      </div>
    </td>
  </motion.tr>
  );
};
