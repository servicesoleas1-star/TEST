import { getSupabase } from './_supabase.js';

export default async function handler(req, res) {
  try {
    const { data, error } = await getSupabase().from('country_config').select('*');
    if (error) throw error;
    return res.status(200).json({ ok: true, countries: data || [] });
  } catch (err) {
    console.error('Countries fetch error:', err.message);
    return res.status(200).json({ ok: true, countries: [] });
  }
}
