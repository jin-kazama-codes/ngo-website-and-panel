import { supabase } from '../lib/supabase';

export interface Announcement {
  id: string;
  sentBy: string;
  city: string;
  message: string;
  sentAt: string;
  channel?: string;
}

function mapRow(row: Record<string, any>): Announcement {
  return {
    id: row.id,
    sentBy: row.sent_by,
    city: row.city,
    message: row.message,
    sentAt: row.sent_at,
    channel: row.channel || 'all',
  };
}
export async function getAnnouncementsByCommunity(communityIdOrCity: string): Promise<Announcement[]> {
  return getAnnouncementsBycity(communityIdOrCity);
}

export async function getAnnouncementsBycity(city: string): Promise<Announcement[]> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('city', city)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Supabase Error fetching announcements:', error.message, error.details, error.hint);
      return [];
    }

    return (data || []).map(mapRow);
  } catch (err) {
    console.error('getAnnouncements exception:', err);
    return [];
  }
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Supabase Error fetching all announcements:', error.message);
      return [];
    }
    return (data || []).map(mapRow);
  } catch (err) {
    console.error('getAllAnnouncements exception:', err);
    return [];
  }
}

export async function createAnnouncement(payload: Omit<Announcement, 'id'>): Promise<Announcement> {
  const { data, error } = await supabase
    .from('announcements')
    .insert([
      {
        sent_by: payload.sentBy,
        city: payload.city,
        message: payload.message,
        sent_at: payload.sentAt,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Supabase Error creating announcement:', error.message, error.details, error.hint);
    throw new Error(error.message);
  }

  return mapRow(data);
}
