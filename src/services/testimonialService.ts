import { supabase } from '../lib/supabase';
import { Testimonial } from '../types';

function mapRow(row: Record<string, unknown>): Testimonial {
  return {
    id: row.id as string,
    name: row.name as string,
    role: row.role as string,
    city: row.city as string,
    quote: row.quote as string,
    avatar: row.avatar as string,
    campaignTitle: row.campaign_title as string | undefined,
    amountReceivedINR: row.amount_received_inr as number | undefined,
    videoThumbnail: row.video_thumbnail as string | undefined,
  };
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}
