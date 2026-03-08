import React, { useState } from 'react';
import { Modal, FormField, inputClass, selectClass, btnPrimary, btnSecondary } from './ui/Modal';
import { useAppStore } from '../stores/app-store';
import { DealStage } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  editId?: string;
}

export const CreateDealModal: React.FC<Props> = ({ open, onClose, editId }) => {
  const { deals, leads, addDeal, updateDeal } = useAppStore();
  const existing = editId ? deals.find((d) => d.id === editId) : null;

  const [title, setTitle] = useState(existing?.title || '');
  const [company, setCompany] = useState(existing?.company || '');
  const [value, setValue] = useState(existing ? String(existing.value) : '');
  const [stage, setStage] = useState<DealStage>(existing?.stage || 'discovery');
  const [expectedCloseDate, setExpectedCloseDate] = useState(existing?.expectedCloseDate || '');
  const [contactName, setContactName] = useState(existing?.contactName || '');
  const [contactEmail, setContactEmail] = useState(existing?.contactEmail || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [tagsStr, setTagsStr] = useState(existing?.tags.join(', ') || '');

  React.useEffect(() => {
    if (existing) {
      setTitle(existing.title); setCompany(existing.company); setValue(String(existing.value));
      setStage(existing.stage); setExpectedCloseDate(existing.expectedCloseDate);
      setContactName(existing.contactName); setContactEmail(existing.contactEmail);
      setDescription(existing.description); setTagsStr(existing.tags.join(', '));
    } else {
      setTitle(''); setCompany(''); setValue(''); setStage('discovery');
      setExpectedCloseDate(''); setContactName(''); setContactEmail('');
      setDescription(''); setTagsStr('');
    }
  }, [existing, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
    const data = {
      title, company, value: Number(value), stage, expectedCloseDate,
      contactName, contactEmail, description, tags,
    };
    if (editId) {
      updateDeal(editId, data);
    } else {
      addDeal(data);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editId ? 'Edit Deal' : 'Create Deal'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Deal Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} placeholder="Summer Campaign 2025" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Company">
            <input value={company} onChange={(e) => setCompany(e.target.value)} required className={inputClass} placeholder="Nike Inc." />
          </FormField>
          <FormField label="Value ($)">
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} required className={inputClass} placeholder="100000" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Stage">
            <select value={stage} onChange={(e) => setStage(e.target.value as DealStage)} className={selectClass}>
              <option value="discovery">Discovery</option><option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option><option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </select>
          </FormField>
          <FormField label="Expected Close">
            <input type="date" value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)} required className={inputClass} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Contact Name">
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} required className={inputClass} placeholder="Sarah Chen" />
          </FormField>
          <FormField label="Contact Email">
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required className={inputClass} placeholder="sarah@nike.com" />
          </FormField>
        </div>
        <FormField label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} placeholder="Deal details..." />
        </FormField>
        <FormField label="Tags (comma separated)">
          <input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} className={inputClass} placeholder="enterprise, digital, q2" />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={btnSecondary}>Cancel</button>
          <button type="submit" className={btnPrimary}>{editId ? 'Save Changes' : 'Create Deal'}</button>
        </div>
      </form>
    </Modal>
  );
};
