import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, Image, FileText, Trash2, Download, X, FolderOpen } from 'lucide-react';
import { uploadAsset, listAssets, getAssetUrl, deleteAsset, isSupabaseConfigured } from '../lib/supabase';
import { useToastStore } from '../stores/toast-store';

interface Asset {
  name: string;
  id: string;
  created_at: string;
  metadata: { size: number; mimetype: string };
}

interface AssetManagerProps {
  dealId: string;
  dealTitle: string;
}

const DEMO_ASSETS: Asset[] = [
  { name: 'campaign-brief-v2.pdf', id: 'demo-1', created_at: '2025-03-05T10:00:00Z', metadata: { size: 245000, mimetype: 'application/pdf' } },
  { name: 'hero-banner-1200x628.png', id: 'demo-2', created_at: '2025-03-04T14:30:00Z', metadata: { size: 1820000, mimetype: 'image/png' } },
  { name: 'social-copy-deck.docx', id: 'demo-3', created_at: '2025-03-03T09:15:00Z', metadata: { size: 89000, mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } },
  { name: 'ad-variations-tiktok.mp4', id: 'demo-4', created_at: '2025-03-02T16:00:00Z', metadata: { size: 15400000, mimetype: 'video/mp4' } },
  { name: 'brand-guidelines.pdf', id: 'demo-5', created_at: '2025-03-01T11:00:00Z', metadata: { size: 4200000, mimetype: 'application/pdf' } },
];

const fileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '')) return <Image size={18} className="text-accent" />;
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return <FileText size={18} className="text-warning" />;
  return <File size={18} className="text-secondary" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export const AssetManager: React.FC<AssetManagerProps> = ({ dealId, dealTitle }) => {
  const [assets, setAssets] = useState<Asset[]>(DEMO_ASSETS);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToastStore();
  const configured = isSupabaseConfigured();

  const loadAssets = useCallback(async () => {
    if (!configured) return;
    const data = await listAssets(dealId);
    if (data) setAssets(data as unknown as Asset[]);
  }, [dealId, configured]);

  React.useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      if (configured) {
        const result = await uploadAsset(file, dealId);
        if (result) {
          addToast({ type: 'success', title: 'Asset Uploaded', message: `${file.name} uploaded successfully.` });
        } else {
          addToast({ type: 'error', title: 'Upload Failed', message: `Failed to upload ${file.name}.` });
        }
      } else {
        // Demo mode — add to local state
        const newAsset: Asset = {
          name: file.name,
          id: `demo-${Date.now()}`,
          created_at: new Date().toISOString(),
          metadata: { size: file.size, mimetype: file.type },
        };
        setAssets((prev) => [newAsset, ...prev]);
        addToast({ type: 'success', title: 'Asset Added (Demo)', message: `${file.name} added to creative assets.` });
      }
    }
    setUploading(false);
    if (configured) loadAssets();
  };

  const handleDelete = async (asset: Asset) => {
    if (configured) {
      const success = await deleteAsset(`${dealId}/${asset.name}`);
      if (success) {
        addToast({ type: 'info', title: 'Asset Deleted', message: `${asset.name} removed.` });
        loadAssets();
      }
    } else {
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
      addToast({ type: 'info', title: 'Asset Removed (Demo)', message: `${asset.name} removed.` });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderOpen size={18} className="text-primary" />
          <h3 className="text-lg font-semibold">Creative Assets</h3>
        </div>
        <span className="text-xs text-textSecondary bg-surface px-2 py-1 rounded-full">{assets.length} files</span>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-4 ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-surface/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-textSecondary">Uploading...</span>
          </div>
        ) : (
          <>
            <Upload size={24} className="mx-auto mb-2 text-textSecondary" />
            <p className="text-sm text-textSecondary">
              Drop files here or <span className="text-primary font-medium">browse</span>
            </p>
            <p className="text-xs text-textSecondary mt-1">PDFs, images, videos, documents</p>
          </>
        )}
      </div>

      {/* Asset List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        <AnimatePresence>
          {assets.map((asset) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-surface/50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {fileIcon(asset.name)}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{asset.name}</p>
                  <p className="text-xs text-textSecondary">{formatFileSize(asset.metadata?.size || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {configured && (
                  <button
                    onClick={() => window.open(getAssetUrl(`${dealId}/${asset.name}`), '_blank')}
                    className="p-1.5 hover:bg-surface rounded-lg text-textSecondary hover:text-text transition-colors"
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(asset)}
                  className="p-1.5 hover:bg-error/10 rounded-lg text-textSecondary hover:text-error transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
