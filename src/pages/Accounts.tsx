import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building2, Globe, Users, DollarSign, Filter, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { useAppStore } from '../stores/app-store';
import { Account } from '../types';

const statusColors: Record<string, string> = {
  prospect: 'bg-secondary/10 text-secondary',
  active: 'bg-success/10 text-success',
  inactive: 'bg-warning/10 text-warning',
  churned: 'bg-error/10 text-error',
};

export const Accounts: React.FC = () => {
  const { accounts, searchQuery } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'totalDealValue' | 'createdAt'>('totalDealValue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let result = [...accounts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) => a.name.toLowerCase().includes(q) || a.industry.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }
    result.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortBy === 'totalDealValue') return (a.totalDealValue - b.totalDealValue) * dir;
      return a.createdAt.localeCompare(b.createdAt) * dir;
    });
    return result;
  }, [accounts, searchQuery, statusFilter, sortBy, sortDir]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  const totalValue = accounts.reduce((s, a) => s + a.totalDealValue, 0);
  const activeCount = accounts.filter((a) => a.status === 'active').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Accounts</h1>
          <p className="text-textSecondary text-sm">
            {accounts.length} accounts &middot; {activeCount} active &middot; ${(totalValue / 1000).toFixed(0)}k total pipeline
          </p>
        </div>
        <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium text-sm transition-colors">
          + Add Account
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard icon={<Building2 className="text-primary" size={20} />} label="Total Accounts" value={String(accounts.length)} />
        <SummaryCard icon={<Users className="text-secondary" size={20} />} label="Active Clients" value={String(activeCount)} />
        <SummaryCard icon={<DollarSign className="text-success" size={20} />} label="Total Pipeline" value={`$${(totalValue / 1000).toFixed(0)}k`} />
        <SummaryCard icon={<Globe className="text-accent" size={20} />} label="Industries" value={String(new Set(accounts.map((a) => a.industry)).size)} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter size={16} className="text-textSecondary" />
        {['all', 'active', 'prospect', 'inactive', 'churned'].map((s) => (
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

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-textSecondary text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">
                <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-text">
                  Account <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="px-6 py-4 font-medium">Industry</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Deals</th>
              <th className="px-6 py-4 font-medium">
                <button onClick={() => toggleSort('totalDealValue')} className="flex items-center gap-1 hover:text-text">
                  Pipeline Value <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="px-6 py-4 font-medium">Website</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((account, i) => (
              <AccountRow key={account.id} account={account} index={i} />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const AccountRow: React.FC<{ account: Account; index: number }> = ({ account, index }) => (
  <motion.tr
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03 }}
    className="border-b border-border/50 hover:bg-surface/30 transition-colors"
  >
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary/20 to-accent/20 border border-border flex items-center justify-center">
          <Building2 size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{account.name}</p>
          <p className="text-xs text-textSecondary">{account.employeeCount.toLocaleString()} employees</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 text-sm text-textSecondary">{account.industry}</td>
    <td className="px-6 py-4">
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[account.status]}`}>
        {account.status}
      </span>
    </td>
    <td className="px-6 py-4 text-sm font-medium">{account.dealCount}</td>
    <td className="px-6 py-4 text-sm font-semibold">${(account.totalDealValue / 1000).toFixed(0)}k</td>
    <td className="px-6 py-4">
      <span className="text-sm text-textSecondary">{account.website}</span>
    </td>
    <td className="px-6 py-4">
      <button className="p-1.5 hover:bg-surface rounded-lg transition-colors text-textSecondary hover:text-text">
        <MoreHorizontal size={14} />
      </button>
    </td>
  </motion.tr>
);

const SummaryCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="glass-panel p-4 flex items-center gap-4">
    <div className="p-2 bg-surface rounded-lg">{icon}</div>
    <div>
      <p className="text-xs text-textSecondary">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  </div>
);
