import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { mockCampaigns } from '../lib/mock-data';
import { TrendingUp, Eye, MousePointer, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const channelData = [
  { name: 'Social Media', value: 35 },
  { name: 'Google Ads', value: 28 },
  { name: 'TV', value: 20 },
  { name: 'LinkedIn', value: 17 },
];

const COLORS = ['#9E7FFF', '#38bdf8', '#f472b6', '#10b981'];

const weeklyPerformance = [
  { week: 'W1', impressions: 520000, clicks: 15600, conversions: 468 },
  { week: 'W2', impressions: 680000, clicks: 20400, conversions: 612 },
  { week: 'W3', impressions: 750000, clicks: 22500, conversions: 675 },
  { week: 'W4', impressions: 890000, clicks: 26700, conversions: 801 },
  { week: 'W5', impressions: 820000, clicks: 24600, conversions: 738 },
  { week: 'W6', impressions: 950000, clicks: 28500, conversions: 855 },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const Analytics: React.FC = () => {
  const activeCampaigns = mockCampaigns.filter((c) => c.status === 'active');
  const totalImpressions = mockCampaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = mockCampaigns.reduce((s, c) => s + c.clicks, 0);
  const totalConversions = mockCampaigns.reduce((s, c) => s + c.conversions, 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0';

  const spendData = mockCampaigns
    .filter((c) => c.status !== 'draft')
    .map((c) => ({
      name: c.name.split(' ').slice(0, 2).join(' '),
      budget: c.budget / 1000,
      spent: c.spent / 1000,
    }));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8">
      <motion.header variants={item}>
        <h1 className="text-3xl font-bold mb-1">Analytics</h1>
        <p className="text-textSecondary text-sm">Campaign performance and spend tracking across all channels.</p>
      </motion.header>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={<Eye className="text-primary" />} label="Total Impressions" value={`${(totalImpressions / 1000000).toFixed(1)}M`} change="+18.2%" up />
        <MetricCard icon={<MousePointer className="text-secondary" />} label="Total Clicks" value={`${(totalClicks / 1000).toFixed(0)}k`} change="+12.4%" up />
        <MetricCard icon={<Target className="text-accent" />} label="Conversions" value={totalConversions.toLocaleString()} change="+9.1%" up />
        <MetricCard icon={<TrendingUp className="text-success" />} label="Avg. CTR" value={`${avgCTR}%`} change="-0.3%" up={false} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2 glass-panel p-6">
          <h3 className="text-lg font-semibold mb-6">Weekly Performance Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2F2F2F" vertical={false} />
                <XAxis dataKey="week" stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#262626', border: '1px solid #2F2F2F', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="clicks" stroke="#9E7FFF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-6">Channel Mix</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {channelData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#262626', border: '1px solid #2F2F2F', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {channelData.map((ch, i) => (
              <div key={ch.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-textSecondary">{ch.name}</span>
                </div>
                <span className="font-medium">{ch.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-6">Budget vs. Spend</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2F2F2F" vertical={false} />
              <XAxis dataKey="name" stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}k`} />
              <Tooltip contentStyle={{ backgroundColor: '#262626', border: '1px solid #2F2F2F', borderRadius: '8px' }} formatter={(v: number) => [`$${v}k`, '']} />
              <Legend />
              <Bar dataKey="budget" fill="#9E7FFF" radius={[6, 6, 0, 0]} barSize={30} />
              <Bar dataKey="spent" fill="#38bdf8" radius={[6, 6, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Campaign Table */}
      <motion.div variants={item} className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Active Campaigns</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-textSecondary text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Campaign</th>
              <th className="px-6 py-4 font-medium">Channel</th>
              <th className="px-6 py-4 font-medium">Budget</th>
              <th className="px-6 py-4 font-medium">Spent</th>
              <th className="px-6 py-4 font-medium">CTR</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockCampaigns.map((campaign) => {
              const ctr = campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : '0.00';
              const spendPct = campaign.budget > 0 ? Math.round((campaign.spent / campaign.budget) * 100) : 0;
              return (
                <tr key={campaign.id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">{campaign.name}</p>
                      <p className="text-xs text-textSecondary">{campaign.client}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-textSecondary">{campaign.channel}</td>
                  <td className="px-6 py-4 text-sm font-medium">${(campaign.budget / 1000).toFixed(0)}k</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${spendPct > 80 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${spendPct}%` }} />
                      </div>
                      <span className="text-sm text-textSecondary">{spendPct}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{ctr}%</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                      campaign.status === 'active' ? 'bg-success/10 text-success' :
                      campaign.status === 'completed' ? 'bg-secondary/10 text-secondary' :
                      campaign.status === 'paused' ? 'bg-warning/10 text-warning' :
                      'bg-surface text-textSecondary'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
};

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: string; change: string; up: boolean }> = ({
  icon, label, value, change, up,
}) => (
  <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400 }} className="glass-panel p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-surface rounded-lg">{icon}</div>
      <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full ${up ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
        {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {change}
      </span>
    </div>
    <p className="text-textSecondary text-sm font-medium">{label}</p>
    <h4 className="text-2xl font-bold mt-1">{value}</h4>
  </motion.div>
);
