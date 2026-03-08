import { create } from 'zustand';
import { Deal, Lead, NavPage, DealStage, SmartAction, Account, Note, Task, CrmEvent } from '../types';
import { mockDeals, mockLeads, mockAccounts } from '../lib/mock-data';
import { getSmartAction, getAutoProbability } from '../lib/smart-actions';
import { useToastStore } from './toast-store';
import { updateDealStage, logSmartAction, isSupabaseConfigured } from '../lib/supabase';

interface AppState {
  currentPage: NavPage;
  setCurrentPage: (page: NavPage) => void;
  selectedDealId: string | null;
  setSelectedDealId: (id: string | null) => void;
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;

  // Entities
  deals: Deal[];
  leads: Lead[];
  accounts: Account[];
  notes: Note[];
  tasks: Task[];
  smartActions: SmartAction[];
  events: CrmEvent[];

  // CRUD - Contacts/Leads
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'lastActivity' | 'score'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;

  // CRUD - Deals
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'probability'>) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  moveDeal: (dealId: string, newStage: DealStage) => void;

  // CRUD - Notes
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // CRUD - Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Events
  logEvent: (type: CrmEvent['type'], description: string, metadata?: Record<string, string>) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

let nextId = 100;
const genId = () => String(++nextId);

export const useAppStore = create<AppState>((set, get) => ({
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),
  selectedDealId: null,
  setSelectedDealId: (id) => set({ selectedDealId: id }),
  selectedLeadId: null,
  setSelectedLeadId: (id) => set({ selectedLeadId: id }),

  deals: mockDeals,
  leads: mockLeads,
  accounts: mockAccounts,
  notes: [
    { id: '1', title: 'Nike budget discussion', content: 'Client confirmed $250k budget for summer campaign. Need to finalize media mix by next week.', dealId: '1', createdAt: '2025-03-05T10:00:00Z', updatedAt: '2025-03-05T10:00:00Z' },
    { id: '2', title: 'Spotify brand guidelines received', content: 'Marcus sent over their updated brand guidelines. Key colors: green (#1DB954), black, white. No gradients.', dealId: '2', createdAt: '2025-03-04T14:00:00Z', updatedAt: '2025-03-04T14:00:00Z' },
    { id: '3', title: 'Glossier influencer shortlist', content: 'Compiled a list of 15 micro-influencers in the skincare niche. Average engagement rate: 4.2%. Budget per post: $2k-5k.', dealId: '7', createdAt: '2025-03-03T09:00:00Z', updatedAt: '2025-03-03T09:00:00Z' },
  ],
  tasks: [
    { id: '1', title: 'Send Nike proposal revision', description: 'Incorporate feedback from last meeting. Focus on digital-first approach.', status: 'in_progress', priority: 'high', dueDate: '2025-03-10', dealId: '1', createdAt: '2025-03-05T10:00:00Z' },
    { id: '2', title: 'Schedule Spotify pitch', description: 'Set up a 1-hour presentation with their marketing team.', status: 'pending', priority: 'high', dueDate: '2025-03-12', dealId: '2', createdAt: '2025-03-04T14:00:00Z' },
    { id: '3', title: 'Follow up with Stripe lead', description: 'Send case studies and schedule a discovery call.', status: 'pending', priority: 'medium', dueDate: '2025-03-08', leadId: '1', createdAt: '2025-03-05T09:00:00Z' },
    { id: '4', title: 'Review Glossier creative brief', description: 'Final review before sending to influencers.', status: 'completed', priority: 'medium', dueDate: '2025-03-06', dealId: '7', createdAt: '2025-03-03T09:00:00Z', completedAt: '2025-03-06T11:00:00Z' },
  ],
  smartActions: [],
  events: [
    { id: '1', type: 'login', description: 'User logged in', timestamp: new Date().toISOString() },
  ],

  // CRUD - Leads
  addLead: (leadData) => {
    const lead: Lead = {
      ...leadData,
      id: genId(),
      createdAt: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
      score: Math.floor(Math.random() * 40) + 50,
    };
    set((s) => ({ leads: [lead, ...s.leads] }));
    get().logEvent('contact_created', `New contact created: ${lead.name} at ${lead.company}`);
    useToastStore.getState().addToast({ type: 'success', title: 'Contact Created', message: `${lead.name} added successfully.` });
  },

  updateLead: (id, updates) => {
    set((s) => ({
      leads: s.leads.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
    useToastStore.getState().addToast({ type: 'success', title: 'Contact Updated' });
  },

  deleteLead: (id) => {
    set((s) => ({ leads: s.leads.filter((l) => l.id !== id) }));
  },

  // CRUD - Deals
  addDeal: (dealData) => {
    const deal: Deal = {
      ...dealData,
      id: genId(),
      createdAt: new Date().toISOString().split('T')[0],
      probability: getAutoProbability(dealData.stage),
    };
    set((s) => ({ deals: [deal, ...s.deals] }));
    get().logEvent('deal_created', `New deal created: ${deal.title} ($${(deal.value / 1000).toFixed(0)}k)`);
    useToastStore.getState().addToast({ type: 'success', title: 'Deal Created', message: `${deal.title} added to pipeline.` });
  },

  updateDeal: (id, updates) => {
    set((s) => ({
      deals: s.deals.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
    useToastStore.getState().addToast({ type: 'success', title: 'Deal Updated' });
  },

  moveDeal: (dealId, newStage) => {
    const state = get();
    const deal = state.deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === newStage) return;

    const fromStage = deal.stage;
    const newProbability = getAutoProbability(newStage);

    state.logEvent('deal_stage_change', `Deal "${deal.title}" moved from ${fromStage} to ${newStage}`, {
      dealId, fromStage, toStage: newStage, value: String(deal.value),
    });

    const action = getSmartAction(deal, newStage);
    if (action) {
      const smartAction: SmartAction = {
        id: genId(),
        dealId: deal.id,
        dealTitle: deal.title,
        actionType: action.actionType,
        fromStage,
        toStage: newStage,
        description: action.message,
        timestamp: new Date().toISOString(),
      };

      useToastStore.getState().addToast({
        type: 'action',
        title: action.title,
        message: action.message,
        duration: 6000,
      });

      if (isSupabaseConfigured()) {
        updateDealStage(dealId, newStage, newProbability);
        logSmartAction(dealId, action.actionType, fromStage, newStage, action.message);
      }

      set((s) => ({
        deals: s.deals.map((d) =>
          d.id === dealId ? { ...d, stage: newStage, probability: newProbability } : d
        ),
        smartActions: [smartAction, ...s.smartActions],
      }));
    } else {
      if (isSupabaseConfigured()) {
        updateDealStage(dealId, newStage, newProbability);
      }

      set((s) => ({
        deals: s.deals.map((d) =>
          d.id === dealId ? { ...d, stage: newStage, probability: newProbability } : d
        ),
      }));
    }
  },

  // CRUD - Notes
  addNote: (noteData) => {
    const note: Note = {
      ...noteData,
      id: genId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ notes: [note, ...s.notes] }));
    get().logEvent('note_added', `Note added: "${note.title}"`);
    useToastStore.getState().addToast({ type: 'success', title: 'Note Added', message: note.title });
  },

  updateNote: (id, updates) => {
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)),
    }));
  },

  deleteNote: (id) => {
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
  },

  // CRUD - Tasks
  addTask: (taskData) => {
    const task: Task = {
      ...taskData,
      id: genId(),
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ tasks: [task, ...s.tasks] }));
    useToastStore.getState().addToast({ type: 'success', title: 'Task Created', message: task.title });
  },

  updateTask: (id, updates) => {
    const task = get().tasks.find((t) => t.id === id);
    const finalUpdates = { ...updates };
    if (updates.status === 'completed' && task?.status !== 'completed') {
      finalUpdates.completedAt = new Date().toISOString();
      get().logEvent('task_completed', `Task completed: "${task?.title}"`);
    }
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...finalUpdates } : t)),
    }));
  },

  deleteTask: (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  // Events
  logEvent: (type, description, metadata) => {
    const event: CrmEvent = {
      id: genId(),
      type,
      description,
      metadata,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({ events: [event, ...s.events] }));
  },

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
