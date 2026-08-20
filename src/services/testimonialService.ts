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
    createdBy: row.created_by as string | undefined,
    communityId: row.community_id as string | undefined,
    status: row.status as 'pending' | 'approved' | 'rejected' | undefined,
  };
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await fetch('/api/testimonials');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return (json.data || []).map(mapRow);
  } catch (err) {
    console.error('getTestimonials error:', err);
    return [];
  }
}

function mapToDb(testimonial: Partial<Testimonial>): Record<string, any> {
  const mapped: Record<string, any> = {
    id: testimonial.id,
    name: testimonial.name,
    role: testimonial.role,
    city: testimonial.city,
    quote: testimonial.quote,
    avatar: testimonial.avatar,
    campaign_title: testimonial.campaignTitle,
    created_by: testimonial.createdBy,
    community_id: testimonial.communityId,
    status: testimonial.status,
  };
  Object.keys(mapped).forEach(key => mapped[key] === undefined && delete mapped[key]);
  return mapped;
}

export async function createTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial> {
  const payload = mapToDb({ ...testimonial, id: `test_${Date.now()}` });
  const res = await fetch('/api/testimonials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to add testimonial');
  const json = await res.json();
  return mapRow(json.data);
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial> {
  const payload = mapToDb({ id, ...updates });
  const res = await fetch('/api/testimonials', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update testimonial');
  const json = await res.json();
  return mapRow(json.data);
}

export async function deleteTestimonial(id: string): Promise<void> {
  const res = await fetch(`/api/testimonials?id=${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete testimonial');
}
