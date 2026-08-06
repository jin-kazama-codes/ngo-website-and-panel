import { supabase } from '../lib/supabase';

export interface GalleryPhoto {
  id: string;
  title: string;
  city: string;
  image: string;
  category: string;
}

function mapRow(row: Record<string, unknown>): GalleryPhoto {
  return {
    id: row.id as string,
    title: row.title as string,
    city: row.city as string,
    image: row.image as string,
    category: row.category as string,
  };
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}
