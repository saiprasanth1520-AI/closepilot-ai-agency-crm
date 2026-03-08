export type DealStage = 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate: string;
  contactName: string;
  contactEmail: string;
  description: string;
  createdAt: string;
  tags: string[];
  accountId?: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified';
  score: number;
  lastActivity: string;
  createdAt: string;
  notes?: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  description: string;
  dealId?: string;
  leadId?: string;
  accountId?: string;
  timestamp: string;
}

export interface Campaign {
  id: string;
  name: string;
  client: string;
  budget: number;
  spent: number;
  status: 'active' | 'paused' | 'completed' | 'draft';
  channel: string;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  status: 'prospect' | 'active' | 'inactive' | 'churned';
  annualRevenue: number;
  employeeCount: number;
  contactCount: number;
  dealCount: number;
  totalDealValue: number;
  createdAt: string;
}

export interface SmartAction {
  id: string;
  dealId: string;
  dealTitle: string;
  actionType: string;
  fromStage: DealStage;
  toStage: DealStage;
  description: string;
  timestamp: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  dealId?: string;
  leadId?: string;
  accountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  dealId?: string;
  leadId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CrmEvent {
  id: string;
  type: 'login' | 'deal_stage_change' | 'contact_created' | 'deal_created' | 'note_added' | 'task_completed' | 'agent_action';
  description: string;
  metadata?: Record<string, string>;
  timestamp: string;
}

export type NavPage = 'dashboard' | 'leads' | 'pipeline' | 'analytics' | 'accounts' | 'deal-detail' | 'lead-detail';
