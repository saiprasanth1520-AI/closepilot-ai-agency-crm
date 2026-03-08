import React, { useState } from 'react';
import { Modal, FormField, inputClass, selectClass, btnPrimary, btnSecondary } from './ui/Modal';
import { useAppStore } from '../stores/app-store';

interface Props {
  open: boolean;
  onClose: () => void;
  editId?: string;
}

export const CreateContactModal: React.FC<Props> = ({ open, onClose, editId }) => {
  const { leads, addLead, updateLead } = useAppStore();
  const existing = editId ? leads.find((l) => l.id === editId) : null;

  const [name, setName] = useState(existing?.name || '');
  const [company, setCompany] = useState(existing?.company || '');
  const [email, setEmail] = useState(existing?.email || '');
  const [phone, setPhone] = useState(existing?.phone || '');
  const [source, setSource] = useState(existing?.source || 'Website');
  const [status, setStatus] = useState(existing?.status || 'new');

  React.useEffect(() => {
    if (existing) {
      setName(existing.name);
      setCompany(existing.company);
      setEmail(existing.email);
      setPhone(existing.phone);
      setSource(existing.source);
      setStatus(existing.status);
    } else {
      setName(''); setCompany(''); setEmail(''); setPhone(''); setSource('Website'); setStatus('new');
    }
  }, [existing, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateLead(editId, { name, company, email, phone, source, status });
    } else {
      addLead({ name, company, email, phone, source, status });
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editId ? 'Edit Contact' : 'Create Contact'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full Name">
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="John Doe" />
        </FormField>
        <FormField label="Company">
          <input value={company} onChange={(e) => setCompany(e.target.value)} required className={inputClass} placeholder="Acme Inc." />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="john@acme.com" />
          </FormField>
          <FormField label="Phone">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+1-555-0100" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Source">
            <select value={source} onChange={(e) => setSource(e.target.value)} className={selectClass}>
              <option>Website</option><option>Referral</option><option>LinkedIn</option><option>Conference</option><option>Cold Outreach</option>
            </select>
          </FormField>
          <FormField label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={selectClass}>
              <option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="unqualified">Unqualified</option>
            </select>
          </FormField>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={btnSecondary}>Cancel</button>
          <button type="submit" className={btnPrimary}>{editId ? 'Save Changes' : 'Create Contact'}</button>
        </div>
      </form>
    </Modal>
  );
};
