import { getSupabase } from './_supabase.js';

export default async function handler(req, res) {
  try {
    const { data, error } = await getSupabase().from('payment_methods').select('*');
    if (error) throw error;
    return res.status(200).json({ ok: true, methods: data || [] });
  } catch (err) {
    console.error('Payment methods fetch error:', err.message);
    return res.status(200).json({ ok: true, methods: [] });
  }
}
