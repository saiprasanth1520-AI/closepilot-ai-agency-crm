import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Calendar, User, Tag, Mail, Phone, FileText, Clock, Zap } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/app-store';
import { mockActivities, STAGE_CONFIG } from '../lib/mock-data';
import { AssetManager } from '../components/AssetManager';
import { NoteTaskPanel } from '../components/NoteTaskPanel';
import { AgentPanel } from '../components/AgentPanel';
import { format, parseISO } from 'date-fns';

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

export const DealDetail: React.FC = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deals, smartActions } = useAppStore();
  const deal = deals.find((d) => d.id === dealId);

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-textSecondary">Deal not found</p>
      </div>
    );
  }

  const stageConfig = STAGE_CONFIG[deal.stage];
  const dealActivities = mockActivities.filter((a) => a.dealId === deal.id);
  const dealSmartActions = smartActions.filter((a) => a.dealId === deal.id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/pipeline')}
        className="flex items-center gap-2 text-textSecondary hover:text-text transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Back to Pipeline
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{deal.title}</h1>
          <p className="text-textSecondary">{deal.company}</p>
        </div>
        <div className="text-right">
          <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${stageConfig.bgColor} ${stageConfig.color}`}>
            {stageConfig.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-textSecondary text-sm leading-relaxed">{deal.description}</p>
          </div>

          {/* Activity Timeline */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-6">Activity Timeline</h3>
            {dealActivities.length === 0 && dealSmartActions.length === 0 ? (
              <p className="text-textSecondary text-sm">No activities recorded yet.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-6">
                  {/* Smart Actions */}
                  {dealSmartActions.map((action) => (
                    <div key={`sa-${action.id}`} className="flex gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0 z-10 border-2 border-background">
                        <Zap size={14} className="text-warning" />
                      </div>
                      <div className="glass-panel p-4 flex-1 border-warning/20">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded">Smart Action</span>
                          <span className="text-xs text-textSecondary">
                            {format(parseISO(action.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{action.actionType.replace('auto_', '').replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}</p>
                        <p className="text-xs text-textSecondary mt-1">{action.description}</p>
                      </div>
                    </div>
                  ))}
                  {/* Regular Activities */}
                  {dealActivities.map((activity) => (
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

          {/* Notes & Tasks */}
          <NoteTaskPanel dealId={deal.id} />

          {/* AI Agent */}
          <AgentPanel dealId={deal.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Deal Stats */}
          <div className="glass-panel p-6 space-y-5">
            <h3 className="text-lg font-semibold">Deal Info</h3>
            <InfoRow icon={<DollarSign size={16} />} label="Value" value={`$${deal.value.toLocaleString()}`} />
            <InfoRow icon={<Calendar size={16} />} label="Expected Close" value={deal.expectedCloseDate} />
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-textSecondary">Probability</span>
                <span className="font-semibold">{deal.probability}%</span>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${deal.probability >= 70 ? 'bg-success' : deal.probability >= 40 ? 'bg-warning' : 'bg-error'}`}
                  style={{ width: `${deal.probability}%` }}
                />
              </div>
            </div>
            <InfoRow icon={<Clock size={16} />} label="Created" value={deal.createdAt} />
          </div>

          {/* Contact Card */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-lg font-semibold">Primary Contact</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">{deal.contactName}</p>
                <p className="text-xs text-textSecondary">{deal.company}</p>
              </div>
            </div>
            <div className="space-y-2">
              <a href={`mailto:${deal.contactEmail}`} className="flex items-center gap-2 text-sm text-textSecondary hover:text-primary transition-colors">
                <Mail size={14} /> {deal.contactEmail}
              </a>
            </div>
          </div>

          {/* Tags */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {deal.tags.map((tag) => (
                <span key={tag} className="text-xs bg-surface px-3 py-1.5 rounded-full text-textSecondary border border-border">
                  <Tag size={10} className="inline mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Creative Assets */}
          <AssetManager dealId={deal.id} dealTitle={deal.title} />
        </div>
      </div>
    </motion.div>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-textSecondary text-sm">
      {icon}
      {label}
    </div>
    <span className="text-sm font-medium">{value}</span>
  </div>
);
