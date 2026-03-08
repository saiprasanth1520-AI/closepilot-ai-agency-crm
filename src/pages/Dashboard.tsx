import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Target, ArrowUpRight, Phone, Mail, Calendar, FileText, Wallet, Activity, CheckSquare, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAppStore } from '../stores/app-store';
import { mockActivities, mockCampaigns, STAGE_CONFIG } from '../lib/mock-data';
import { format, parseISO } from 'date-fns';

const revenueData = [
  { name: 'Jan', value: 65000 },
  { name: 'Feb', value: 85000 },
  { name: 'Mar', value: 120000 },
  { name: 'Apr', value: 95000 },
  { name: 'May', value: 140000 },
  { name: 'Jun', value: 110000 },
  { name: 'Jul', value: 155000 },
];

const pipelineData = [
  { name: 'Discovery', value: 820000, fill: '#38bdf8' },
  { name: 'Proposal', value: 265000, fill: '#f59e0b' },
  { name: 'Negotiation', value: 345000, fill: '#f472b6' },
  { name: 'Closed', value: 370000, fill: '#10b981' },
];

const activityIcons: Record<string, React.ReactNode> = {
  call: <Phone size={14} />,
  email: <Mail size={14} />,
  meeting: <Calendar size={14} />,
  note: <FileText size={14} />,
};

const eventTypeColors: Record<string, string> = {
  login: 'bg-secondary/10 text-secondary',
  deal_stage_change: 'bg-accent/10 text-accent',
  contact_created: 'bg-success/10 text-success',
  deal_created: 'bg-primary/10 text-primary',
  note_added: 'bg-warning/10 text-warning',
  task_completed: 'bg-success/10 text-success',
  agent_action: 'bg-primary/10 text-primary',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const Dashboard: React.FC = () => {
  const { deals, leads, tasks, events } = useAppStore();

  const totalPipeline = deals.reduce((sum, d) => sum + d.value, 0);
  const activeDeals = deals.filter((d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost');
  const wonDeals = deals.filter((d) => d.stage === 'closed_won');
  const conversionRate = deals.length > 0 ? ((wonDeals.length / deals.length) * 100).toFixed(1) : '0';
  const activeSpend = mockCampaigns
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + c.spent, 0);
  const newContacts = leads.filter((l) => l.status === 'new').length;
  const tasksDue = tasks.filter((t) => t.status !== 'completed').length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8">
      <motion.header variants={item}>
        <h1 className="text-3xl font-bold mb-2">Welcome back, Alex</h1>
        <p className="text-textSecondary">Here's what's happening with your agency today.</p>
      </motion.header>

      {/* KPI Cards - 4+ widgets */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Pipeline" value={`$${(totalPipeline / 1000000).toFixed(1)}M`} change="+12.5%" icon={<DollarSign className="text-primary" />} />
        <StatCard title="New Contacts" value={String(newContacts)} change={`+${newContacts}`} icon={<Users className="text-secondary" />} />
        <StatCard title="Win Rate" value={`${conversionRate}%`} change="+2.1%" icon={<Target className="text-accent" />} />
        <StatCard title="Tasks Due" value={String(tasksDue)} change={tasksDue > 3 ? `${tasksDue} pending` : 'On track'} icon={<CheckSquare className="text-warning" />} />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Spend" value={`$${(activeSpend / 1000).toFixed(0)}k`} change="+15.3%" icon={<Wallet className="text-warning" />} />
        <StatCard title="Active Deals" value={String(activeDeals.length)} change="+4" icon={<TrendingUp className="text-success" />} />
        <StatCard title="Active Campaigns" value={String(mockCampaigns.filter((c) => c.status === 'active').length)} change="+1" icon={<Activity className="text-accent" />} />
        <StatCard title="Conversion Rate" value={`${conversionRate}%`} change="+2.1%" icon={<Target className="text-primary" />} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Revenue Forecast</h3>
            <span className="text-xs text-textSecondary bg-surface px-3 py-1 rounded-full">Last 7 months</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9E7FFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9E7FFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2F2F2F" vertical={false} />
                <XAxis dataKey="name" stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#262626', border: '1px solid #2F2F2F', borderRadius: '8px' }}
                  itemStyle={{ color: '#FFFFFF' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="value" stroke="#9E7FFF" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <ArrowUpRight size={16} className="text-textSecondary" />
          </div>
          <div className="space-y-5">
            {mockActivities.slice(0, 6).map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0 text-primary">
                  {activityIcons[activity.type]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-textSecondary">
                    {format(parseISO(activity.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-6">Pipeline Breakdown</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2F2F2F" vertical={false} />
                <XAxis dataKey="name" stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#262626', border: '1px solid #2F2F2F', borderRadius: '8px' }}
                  itemStyle={{ color: '#FFFFFF' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Behavior Tracking - Event Log */}
        <motion.div variants={item} className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Event Log</h3>
            <span className="text-xs text-textSecondary bg-surface px-2 py-1 rounded-full">{events.length} events</span>
          </div>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {events.slice(0, 15).map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${eventTypeColors[event.type] || 'bg-surface text-textSecondary'}`}>
                  <Activity size={10} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{event.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${eventTypeColors[event.type] || 'bg-surface text-textSecondary'}`}>
                      {event.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-textSecondary">
                      {format(parseISO(event.timestamp), 'h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && <p className="text-sm text-textSecondary text-center py-4">No events tracked yet.</p>}
          </div>
        </motion.div>

        {/* Top Deals */}
        <motion.div variants={item} className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-6">Top Deals</h3>
          <div className="space-y-4">
            {deals
              .filter((d) => d.stage !== 'closed_lost')
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)
              .map((deal) => {
                const stageConfig = STAGE_CONFIG[deal.stage];
                return (
                  <div key={deal.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{deal.title}</p>
                      <p className="text-xs text-textSecondary">{deal.company}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${stageConfig.bgColor} ${stageConfig.color}`}>
                        {stageConfig.label}
                      </span>
                      <span className="text-sm font-semibold whitespace-nowrap">${(deal.value / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const StatCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode }> = ({ title, value, change, icon }) => (
  <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400 }} className="glass-panel p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-surface rounded-lg">{icon}</div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${change.startsWith('+') || change.startsWith('-') ? (change.startsWith('+') ? 'bg-success/10 text-success' : 'bg-error/10 text-error') : 'bg-surface text-textSecondary'}`}>
        {change}
      </span>
    </div>
    <p className="text-textSecondary text-sm font-medium">{title}</p>
    <h4 className="text-2xl font-bold mt-1">{value}</h4>
  </motion.div>
);
