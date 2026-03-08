import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, Globe, Calendar, Clock, FileText, Briefcase } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/app-store';
import { mockActivities } from '../lib/mock-data';
import { format, parseISO } from 'date-fns';

const statusColors: Record<string, string> = {
  new: 'bg-secondary/10 text-secondary',
  contacted: 'bg-warning/10 text-warning',
  qualified: 'bg-success/10 text-success',
  unqualified: 'bg-error/10 text-error',
};

const activityIcons: Record<string, React.ReactNode> = {
  call: <Phone size={14} />,
  email: <Mail size={14} />,
  meeting: <Calendar size={14} />,
  note: <FileText size={14} />,
};

const activityColors: Record<string, string> = {
  call: 'bg-success/10 text-success',
  email: 'bg-primary/10 text-primary',
  meeting: 'bg-secondary/10 text-secondary',
  note: 'bg-warning/10 text-warning',
};

export const LeadDetail: React.FC = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { leads } = useAppStore();
  const lead = leads.find((l) => l.id === leadId);

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-textSecondary">Lead not found</p>
      </div>
    );
  }

  const leadActivities = mockActivities.filter((a) => a.leadId === lead.id);
  const scoreColor = lead.score >= 80 ? 'text-success' : lead.score >= 60 ? 'text-warning' : 'text-error';
  const scoreBarColor = lead.score >= 80 ? 'bg-success' : lead.score >= 60 ? 'bg-warning' : 'bg-error';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/leads')}
        className="flex items-center gap-2 text-textSecondary hover:text-text transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Back to Leads
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-xl font-bold">
            {lead.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{lead.name}</h1>
            <p className="text-textSecondary">{lead.company}</p>
          </div>
        </div>
        <span className={`text-sm font-medium px-3 py-1.5 rounded-full capitalize ${statusColors[lead.status]}`}>
          {lead.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Score */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-4">Lead Score</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#2F2F2F" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={lead.score >= 80 ? '#10b981' : lead.score >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${lead.score * 2.51} 251`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${scoreColor}`}>{lead.score}</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <ScoreBar label="Engagement" value={Math.min(100, lead.score + 5)} />
                <ScoreBar label="Fit" value={Math.min(100, lead.score - 3)} />
                <ScoreBar label="Intent" value={Math.min(100, lead.score + 10)} />
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-6">Activity Timeline</h3>
            {leadActivities.length === 0 ? (
              <p className="text-textSecondary text-sm">No activities recorded yet.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-6">
                  {leadActivities.map((activity) => (
                    <div key={activity.id} className="flex gap-4 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-background ${activityColors[activity.type]}`}>
                        {activityIcons[activity.type]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <span className="text-xs text-textSecondary capitalize bg-surface px-2 py-0.5 rounded">{activity.type}</span>
                        </div>
                        <p className="text-xs text-textSecondary">{activity.description}</p>
                        <p className="text-xs text-textSecondary mt-1">
                          <Clock size={10} className="inline mr-1" />
                          {format(parseISO(activity.timestamp), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-sm text-textSecondary hover:text-primary transition-colors">
              <Mail size={16} /> {lead.email}
            </a>
            <a href={`tel:${lead.phone}`} className="flex items-center gap-3 text-sm text-textSecondary hover:text-primary transition-colors">
              <Phone size={16} /> {lead.phone}
            </a>
            <div className="flex items-center gap-3 text-sm text-textSecondary">
              <Briefcase size={16} /> {lead.company}
            </div>
            <div className="flex items-center gap-3 text-sm text-textSecondary">
              <Globe size={16} /> {lead.source}
            </div>
          </div>

          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-lg font-semibold">Details</h3>
            <DetailRow label="Status" value={lead.status} />
            <DetailRow label="Source" value={lead.source} />
            <DetailRow label="Last Activity" value={lead.lastActivity} />
            <DetailRow label="Created" value={lead.createdAt} />
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Mail size={14} /> Send Email
              </button>
              <button className="w-full px-4 py-2.5 bg-surface hover:bg-surface/80 border border-border text-text rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Phone size={14} /> Log Call
              </button>
              <button className="w-full px-4 py-2.5 bg-surface hover:bg-surface/80 border border-border text-text rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Calendar size={14} /> Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div>
    <div className="flex items-center justify-between text-xs mb-1">
      <span className="text-textSecondary">{label}</span>
      <span className="font-medium">{value}%</span>
    </div>
    <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${value >= 80 ? 'bg-success' : value >= 60 ? 'bg-warning' : 'bg-error'}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-textSecondary">{label}</span>
    <span className="font-medium capitalize">{value}</span>
  </div>
);
