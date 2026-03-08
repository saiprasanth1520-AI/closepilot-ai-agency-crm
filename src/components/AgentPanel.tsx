import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Loader2, Zap, FileText, Mail } from 'lucide-react';
import { useAppStore } from '../stores/app-store';
import { Deal } from '../types';
import { STAGE_CONFIG } from '../lib/mock-data';

interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  action?: string;
}

// The Lead Follow-up Agent: analyzes deal context, drafts follow-up messages, and writes notes back to CRM
export const AgentPanel: React.FC<{ dealId?: string }> = ({ dealId }) => {
  const { deals, notes, tasks, addNote, addTask, logEvent } = useAppStore();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [open, setOpen] = useState(false);

  const deal = dealId ? deals.find((d) => d.id === dealId) : null;

  const addMessage = (role: 'user' | 'agent', content: string, action?: string) => {
    setMessages((prev) => [...prev, {
      id: String(Date.now()),
      role,
      content,
      timestamp: new Date().toISOString(),
      action,
    }]);
  };

  const runAgent = async (userPrompt: string) => {
    addMessage('user', userPrompt);
    setThinking(true);
    setInput('');

    // Simulate agent thinking delay
    await new Promise((r) => setTimeout(r, 1500));

    const context = deal ? buildDealContext(deal) : buildGeneralContext();
    const response = generateAgentResponse(userPrompt, context, deal);

    // Execute agent actions (multi-step: analyze → generate → write back to CRM)
    if (response.actions) {
      for (const action of response.actions) {
        await new Promise((r) => setTimeout(r, 800));
        if (action.type === 'add_note') {
          addNote({ title: action.title!, content: action.content!, dealId });
          addMessage('agent', `Added note: "${action.title}"`, 'note_created');
        } else if (action.type === 'add_task') {
          addTask({
            title: action.title!,
            description: action.content!,
            status: 'pending',
            priority: 'high',
            dueDate: action.dueDate!,
            dealId,
          });
          addMessage('agent', `Created task: "${action.title}" (due ${action.dueDate})`, 'task_created');
        }
      }
    }

    logEvent('agent_action', `Agent executed: ${userPrompt.slice(0, 60)}`, { dealId: dealId || 'general' });
    addMessage('agent', response.message);
    setThinking(false);
  };

  const quickActions = deal ? [
    { label: 'Draft follow-up email', prompt: `Draft a follow-up email for the ${deal.title} deal with ${deal.contactName}` },
    { label: 'Analyze deal health', prompt: `Analyze the health and next steps for the ${deal.title} deal` },
    { label: 'Generate meeting notes', prompt: `Generate a meeting intake summary for ${deal.title} and create follow-up tasks` },
  ] : [
    { label: 'Summarize pipeline', prompt: 'Give me a summary of the current pipeline and recommended actions' },
    { label: 'Find at-risk deals', prompt: 'Which deals are at risk and need immediate attention?' },
    { label: 'Weekly report', prompt: 'Generate a weekly activity report with key metrics' },
  ];

  return (
    <div className="glass-panel overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center justify-between hover:bg-surface/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot size={18} className="text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">Lead Follow-up Agent</p>
            <p className="text-xs text-textSecondary">AI-powered multi-step CRM actions</p>
          </div>
        </div>
        <Zap size={16} className={`transition-transform ${open ? 'text-primary rotate-12' : 'text-textSecondary'}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              {/* Quick Actions */}
              <div className="p-4 flex flex-wrap gap-2">
                {quickActions.map((qa) => (
                  <button
                    key={qa.label}
                    onClick={() => runAgent(qa.prompt)}
                    disabled={thinking}
                    className="text-xs px-3 py-1.5 bg-background border border-border rounded-full text-textSecondary hover:text-primary hover:border-primary/50 transition-colors disabled:opacity-50"
                  >
                    {qa.label}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <div className="max-h-[300px] overflow-y-auto px-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary/10 text-text'
                        : msg.action
                        ? 'bg-success/10 border border-success/20 text-text'
                        : 'bg-background border border-border text-text'
                    }`}>
                      {msg.action && (
                        <div className="flex items-center gap-1 text-[10px] text-success font-medium mb-1">
                          {msg.action === 'note_created' ? <FileText size={10} /> : <Mail size={10} />}
                          Action executed
                        </div>
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className="flex items-center gap-2 text-textSecondary text-sm py-2">
                    <Loader2 size={14} className="animate-spin" />
                    Agent is thinking...
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <form
                  onSubmit={(e) => { e.preventDefault(); if (input.trim()) runAgent(input.trim()); }}
                  className="flex gap-2"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask the agent anything..."
                    disabled={thinking}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={thinking || !input.trim()}
                    className="p-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Context builders
function buildDealContext(deal: Deal) {
  const stage = STAGE_CONFIG[deal.stage];
  return {
    title: deal.title,
    company: deal.company,
    value: deal.value,
    stage: stage.label,
    probability: deal.probability,
    contact: deal.contactName,
    contactEmail: deal.contactEmail,
    closeDate: deal.expectedCloseDate,
    description: deal.description,
  };
}

function buildGeneralContext() {
  return { type: 'general' };
}

interface AgentAction {
  type: 'add_note' | 'add_task';
  title?: string;
  content?: string;
  dueDate?: string;
}

interface AgentResponse {
  message: string;
  actions?: AgentAction[];
}

function generateAgentResponse(prompt: string, context: any, deal: Deal | null | undefined): AgentResponse {
  const lower = prompt.toLowerCase();

  if (lower.includes('follow-up') || lower.includes('email')) {
    const name = deal?.contactName || 'the client';
    const company = deal?.company || 'the company';
    const dealTitle = deal?.title || 'the opportunity';
    const value = deal ? `$${(deal.value / 1000).toFixed(0)}k` : '';

    const emailDraft = `Subject: Next Steps - ${dealTitle}\n\nHi ${name.split(' ')[0]},\n\nThank you for our recent conversation about ${dealTitle}. I wanted to follow up on the key points we discussed:\n\n1. Budget alignment at ${value}\n2. Timeline for creative deliverables\n3. KPI targets for the campaign\n\nI've attached our revised proposal incorporating your feedback. Could we schedule a 30-minute call this week to finalize the details?\n\nLooking forward to moving this forward together.\n\nBest regards,\nAlex`;

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 3);

    return {
      message: `I've analyzed the ${dealTitle} deal and drafted a follow-up email. I've also:\n\n1. Saved the email draft as a note on this deal\n2. Created a follow-up task due in 3 days\n\nHere's the draft:\n\n${emailDraft}`,
      actions: [
        { type: 'add_note', title: `Follow-up email draft - ${company}`, content: emailDraft },
        { type: 'add_task', title: `Send follow-up to ${name}`, content: `Follow up on ${dealTitle} discussion. Email draft saved in notes.`, dueDate: nextWeek.toISOString().split('T')[0] },
      ],
    };
  }

  if (lower.includes('health') || lower.includes('analyze')) {
    const stage = deal ? STAGE_CONFIG[deal.stage].label : 'Unknown';
    const prob = deal?.probability || 0;
    const health = prob >= 70 ? 'Strong' : prob >= 40 ? 'Moderate' : 'At Risk';
    const recs = prob >= 70
      ? 'Push for contract signing. Schedule a final review meeting.'
      : prob >= 40
      ? 'Needs attention. Send updated proposal and address objections.'
      : 'Critical. Schedule an urgent check-in and consider offering incentives.';

    return {
      message: `**Deal Health Analysis: ${deal?.title || 'Unknown'}**\n\n- Stage: ${stage}\n- Probability: ${prob}%\n- Health: ${health}\n- Value: $${deal ? (deal.value / 1000).toFixed(0) : 0}k\n\n**Recommendation:** ${recs}\n\nI've created an action item to follow up on this analysis.`,
      actions: [
        {
          type: 'add_task',
          title: `${health} health check: ${deal?.title || 'Deal'}`,
          content: recs,
          dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        },
      ],
    };
  }

  if (lower.includes('meeting') || lower.includes('intake')) {
    const nextWeek = new Date(Date.now() + 5 * 86400000);

    return {
      message: `**Meeting Intake Summary - ${deal?.title || 'General'}**\n\nI've parsed the meeting context and generated:\n\n1. A summary note with key decisions and action items\n2. Follow-up tasks for each action item\n\nKey takeaways:\n- Budget confirmed at $${deal ? (deal.value / 1000).toFixed(0) : '??'}k\n- Creative direction approved\n- Next milestone: Deliver first round of concepts`,
      actions: [
        {
          type: 'add_note',
          title: `Meeting summary - ${deal?.company || 'Client'}`,
          content: `Meeting with ${deal?.contactName || 'client'} on ${new Date().toLocaleDateString()}.\n\nKey decisions:\n1. Budget approved\n2. Creative direction: bold, modern, digital-first\n3. Timeline: 4 weeks for first concepts\n\nAction items:\n- Prepare concept deck\n- Send updated timeline\n- Schedule weekly check-ins`,
        },
        {
          type: 'add_task',
          title: `Prepare concept deck for ${deal?.company || 'client'}`,
          content: 'First round of creative concepts based on meeting discussion.',
          dueDate: nextWeek.toISOString().split('T')[0],
        },
      ],
    };
  }

  if (lower.includes('pipeline') || lower.includes('summary')) {
    return {
      message: `**Pipeline Summary**\n\nI've analyzed your current pipeline:\n\n- **Discovery:** 2 deals ($820k)\n- **Proposal:** 2 deals ($265k)\n- **Negotiation:** 2 deals ($345k)\n- **Closed Won:** 2 deals ($370k)\n\n**Total Pipeline:** $1.8M\n**Win Rate:** 25%\n\n**Top Priority:** Focus on the Nike Summer Campaign ($250k, Negotiation) — high probability of closing this month.\n\n**At Risk:** Tesla Cybertruck Launch has low probability (15%). Consider a re-engagement strategy.`,
    };
  }

  if (lower.includes('risk') || lower.includes('attention')) {
    return {
      message: `**At-Risk Deals:**\n\n1. **Tesla Cybertruck Launch** — $500k, Discovery stage, 15% probability\n   - Stalled for 2 weeks, no recent activity\n   - Recommendation: Schedule urgent discovery call\n\n2. **Airbnb Local Experiences** — $320k, Discovery stage, 25% probability\n   - Large opportunity but early stage\n   - Recommendation: Send case studies, push for proposal meeting\n\nI've created follow-up tasks for both.`,
      actions: [
        { type: 'add_task', title: 'Urgent: Re-engage Tesla Cybertruck deal', content: 'Schedule discovery call with James Wright. Deal at risk of going cold.', dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
        { type: 'add_task', title: 'Push Airbnb to proposal stage', content: 'Send case studies to Emily Rodriguez and request a proposal meeting.', dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0] },
      ],
    };
  }

  if (lower.includes('report') || lower.includes('weekly')) {
    return {
      message: `**Weekly Activity Report**\n\nPeriod: ${new Date(Date.now() - 7 * 86400000).toLocaleDateString()} — ${new Date().toLocaleDateString()}\n\n**Key Metrics:**\n- Pipeline Value: $1.8M (+12.5%)\n- Active Deals: 6\n- Conversion Rate: 25%\n- Active Ad Spend: $144k\n\n**This Week:**\n- 2 deals moved forward in pipeline\n- 3 new activities logged\n- 1 deal closed (Peloton Holiday Push)\n\n**Next Week Priorities:**\n- Close Nike Summer Campaign\n- Push Spotify to negotiation\n- Re-engage Tesla opportunity`,
    };
  }

  return {
    message: `I've analyzed your request. Based on the current CRM data, here's what I can help with:\n\n- **Draft follow-up emails** for any deal\n- **Analyze deal health** and recommend next steps\n- **Generate meeting summaries** and create tasks\n- **Summarize your pipeline** with actionable insights\n\nTry one of the quick actions above or ask me something specific!`,
  };
}
