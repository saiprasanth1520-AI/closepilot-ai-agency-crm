import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseAnonKey !== '';
};

// ============================================
// AUTH HELPERS
// ============================================
export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ============================================
// DATA LAYER — falls back to mock when Supabase is not configured
// ============================================
export async function fetchDeals() {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('deals')
    .select('*, accounts(name), contacts(first_name, last_name, email)')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchDeals error:', error); return null; }
  return data;
}

export async function updateDealStage(dealId: string, stage: string, probability: number) {
  if (!isSupabaseConfigured()) return null;
  const updates: Record<string, unknown> = { stage, probability };
  if (stage === 'closed_won' || stage === 'closed_lost') {
    updates.closed_at = new Date().toISOString();
  }
  const { data, error } = await supabase
    .from('deals')
    .update(updates)
    .eq('id', dealId)
    .select()
    .single();
  if (error) console.error('updateDealStage error:', error);
  return data;
}

export async function fetchLeads() {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('contacts')
    .select('*, accounts(name)')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchLeads error:', error); return null; }
  return data;
}

export async function fetchAccounts() {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchAccounts error:', error); return null; }
  return data;
}

export async function fetchActivities(entityId?: string, entityType?: 'deal' | 'contact' | 'account') {
  if (!isSupabaseConfigured()) return null;
  let query = supabase.from('activities').select('*').order('created_at', { ascending: false });
  if (entityId && entityType) {
    const col = entityType === 'deal' ? 'deal_id' : entityType === 'contact' ? 'contact_id' : 'account_id';
    query = query.eq(col, entityId);
  }
  const { data, error } = await query;
  if (error) { console.error('fetchActivities error:', error); return null; }
  return data;
}

export async function fetchCampaigns() {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, accounts(name)')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchCampaigns error:', error); return null; }
  return data;
}

export async function logSmartAction(dealId: string, actionType: string, fromStage: string, toStage: string, description: string) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('smart_actions_log')
    .insert({ deal_id: dealId, action_type: actionType, from_stage: fromStage, to_stage: toStage, description })
    .select()
    .single();
  if (error) console.error('logSmartAction error:', error);
  return data;
}

// ============================================
// STORAGE — Creative Assets
// ============================================
const ASSETS_BUCKET = 'creative-assets';

export async function uploadAsset(file: File, dealId: string) {
  if (!isSupabaseConfigured()) return null;
  const filePath = `${dealId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from(ASSETS_BUCKET)
    .upload(filePath, file, { cacheControl: '3600', upsert: false });
  if (error) { console.error('uploadAsset error:', error); return null; }
  return data;
}

export async function listAssets(dealId: string) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.storage
    .from(ASSETS_BUCKET)
    .list(dealId, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
  if (error) { console.error('listAssets error:', error); return null; }
  return data;
}

export function getAssetUrl(path: string) {
  const { data } = supabase.storage.from(ASSETS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteAsset(path: string) {
  if (!isSupabaseConfigured()) return null;
  const { error } = await supabase.storage.from(ASSETS_BUCKET).remove([path]);
  if (error) console.error('deleteAsset error:', error);
  return !error;
}
