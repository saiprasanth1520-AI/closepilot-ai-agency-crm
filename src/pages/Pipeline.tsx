import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/app-store';
import { Deal, DealStage } from '../types';
import { STAGE_CONFIG } from '../lib/mock-data';
import { Calendar, DollarSign, User, Zap, ExternalLink, Plus } from 'lucide-react';
import { CreateDealModal } from '../components/CreateDealModal';

const STAGES: DealStage[] = ['discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

export const Pipeline: React.FC = () => {
  const { deals, moveDeal } = useAppStore();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [showCreateDeal, setShowCreateDeal] = React.useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const dealId = active.id as string;
    const overId = over.id as string;

    if (STAGES.includes(overId as DealStage)) {
      moveDeal(dealId, overId as DealStage);
      return;
    }

    const overDeal = deals.find((d) => d.id === overId);
    if (overDeal) {
      moveDeal(dealId, overDeal.stage);
    }
  };

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Pipeline</h1>
          <p className="text-textSecondary text-sm">Drag and drop deals between stages. Smart Actions trigger automatically.</p>
        </div>
        <button onClick={() => setShowCreateDeal(true)} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shrink-0">
          <Plus size={16} /> New Deal
        </button>
      </div>

      <CreateDealModal open={showCreateDeal} onClose={() => setShowCreateDeal(false)} />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage);
            const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
            const config = STAGE_CONFIG[stage];

            return (
              <StageColumn key={stage} stage={stage} deals={stageDeals} config={config} totalValue={totalValue} />
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal ? <DealCard deal={activeDeal} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </motion.div>
  );
};

const StageColumn: React.FC<{
  stage: DealStage;
  deals: Deal[];
  config: { label: string; color: string; bgColor: string };
  totalValue: number;
}> = ({ stage, deals, config, totalValue }) => {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 flex flex-col rounded-2xl border transition-colors ${
        isOver ? 'border-primary/50 bg-primary/5' : 'border-border bg-surface/20'
      }`}
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.bgColor.replace('/10', '')}`} />
            <h3 className={`text-sm font-semibold ${config.color}`}>{config.label}</h3>
          </div>
          <span className="text-xs text-textSecondary bg-surface px-2 py-0.5 rounded-full">{deals.length}</span>
        </div>
        <p className="text-xs text-textSecondary">${(totalValue / 1000).toFixed(0)}k total</p>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px]">
        <AnimatePresence>
          {deals.map((deal) => (
            <SortableDealCard key={deal.id} deal={deal} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SortableDealCard: React.FC<{ deal: Deal }> = ({ deal }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DealCard deal={deal} />
    </div>
  );
};

const DealCard: React.FC<{ deal: Deal; isOverlay?: boolean }> = ({ deal, isOverlay }) => {
  const navigate = useNavigate();
  const { setSelectedDealId } = useAppStore();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDealId(deal.id);
    navigate(`/deals/${deal.id}`);
  };

  return (
    <motion.div
      layout={!isOverlay}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-4 bg-surface/80 border border-border rounded-xl cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors group ${
        isOverlay ? 'shadow-2xl shadow-primary/20 rotate-2' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-semibold leading-tight">{deal.title}</h4>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {deal.probability >= 70 && (
            <div className="flex items-center gap-1 text-warning bg-warning/10 px-1.5 py-0.5 rounded text-[10px] font-medium">
              <Zap size={10} /> Hot
            </div>
          )}
          {!isOverlay && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleClick}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded transition-all text-textSecondary hover:text-primary"
              title="View deal details"
            >
              <ExternalLink size={12} />
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-textSecondary mb-3">{deal.company}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-textSecondary">
          <DollarSign size={12} />
          <span className="font-semibold text-text">${(deal.value / 1000).toFixed(0)}k</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-textSecondary">
          <Calendar size={12} />
          <span>{deal.expectedCloseDate.split('-').slice(1).join('/')}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
          <User size={10} className="text-white" />
        </div>
        <span className="text-xs text-textSecondary">{deal.contactName}</span>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] text-textSecondary mb-1">
          <span>Probability</span>
          <span>{deal.probability}%</span>
        </div>
        <div className="w-full h-1 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${deal.probability >= 70 ? 'bg-success' : deal.probability >= 40 ? 'bg-warning' : 'bg-error'}`}
            style={{ width: `${deal.probability}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
};
