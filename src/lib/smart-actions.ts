import { DealStage, Deal } from '../types';

export interface SmartActionResult {
  title: string;
  message: string;
  actionType: string;
}

const STAGE_ACTIONS: Record<string, (deal: Deal) => SmartActionResult> = {
  proposal: (deal) => ({
    title: 'Proposal Draft Generated',
    message: `Auto-generated proposal template for "${deal.title}" ($${(deal.value / 1000).toFixed(0)}k). Review and customize before sending to ${deal.contactName}.`,
    actionType: 'auto_proposal',
  }),
  negotiation: (deal) => ({
    title: 'Contract Template Ready',
    message: `Contract template prepared for "${deal.title}". Legal review checklist activated. Slack notification sent to the finance team.`,
    actionType: 'auto_contract',
  }),
  closed_won: (deal) => ({
    title: 'Deal Won! Onboarding Triggered',
    message: `Congratulations! "${deal.title}" closed at $${(deal.value / 1000).toFixed(0)}k. Auto-created onboarding tasks, welcome email queued to ${deal.contactName}, and campaign setup initiated.`,
    actionType: 'auto_onboard',
  }),
  closed_lost: (deal) => ({
    title: 'Loss Analysis Initiated',
    message: `"${deal.title}" marked as lost. Feedback survey sent to ${deal.contactName}. Deal archived and added to re-engagement pipeline for 90 days.`,
    actionType: 'auto_loss_review',
  }),
  discovery: (deal) => ({
    title: 'Discovery Checklist Created',
    message: `Moved "${deal.title}" back to Discovery. Research tasks created: competitor analysis, budget qualification, and stakeholder mapping.`,
    actionType: 'auto_discovery',
  }),
};

export function getSmartAction(deal: Deal, toStage: DealStage): SmartActionResult | null {
  const actionFn = STAGE_ACTIONS[toStage];
  if (!actionFn) return null;
  return actionFn(deal);
}

export function getAutoProbability(stage: DealStage): number {
  const map: Record<DealStage, number> = {
    discovery: 15,
    proposal: 40,
    negotiation: 70,
    closed_won: 100,
    closed_lost: 0,
  };
  return map[stage];
}
