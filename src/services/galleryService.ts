import { supabase } from '../lib/supabase';

export interface GalleryPhoto {
  id: string;
  title: string;
  city: string;
  image: string;
  category: string;
  createdBy?: string;
  communityId?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

function mapRow(row: Record<string, unknown>): GalleryPhoto {
  return {
    id: row.id as string,
    title: row.title as string,
    city: row.city as string,
    image: row.image as string,
    category: row.category as string,
    createdBy: row.created_by as string | undefined,
    communityId: row.community_id as string | undefined,
    status: row.status as 'pending' | 'approved' | 'rejected' | undefined,
  };
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  try {
    const res = await fetch('/api/gallery');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return (json.data || []).map(mapRow);
  } catch (err) {
    console.error('getGalleryPhotos error:', err);
    return [];
  }
}

export async function createGalleryPhoto(photo: Omit<GalleryPhoto, 'id'>): Promise<GalleryPhoto> {
  const payload = { 
    ...photo, 
    created_by: photo.createdBy,
    community_id: photo.communityId,
    status: photo.status,
  };
  // Remove camelCase keys if supabase strictly expects snake_case for new fields
  delete (payload as any).createdBy;
  delete (payload as any).communityId;

  const res = await fetch('/api/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to add gallery photo');
  const json = await res.json();
  return mapRow(json.data);
}

export async function updateGalleryPhoto(id: string, updates: Partial<GalleryPhoto>): Promise<GalleryPhoto> {
  const payload = { 
    id, 
    ...updates,
    created_by: updates.createdBy,
    community_id: updates.communityId,
    status: updates.status,
  };
  delete (payload as any).createdBy;
  delete (payload as any).communityId;

  const res = await fetch('/api/gallery', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update gallery photo');
  const json = await res.json();
  return mapRow(json.data);
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  const res = await fetch(`/api/gallery?id=${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete gallery photo');
}
