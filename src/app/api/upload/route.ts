import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'campaigns';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error } = await supabaseAdmin.storage
      .from('IMAGES')
      .upload(filename, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage upload error:', error.message);
      // Fallback: create base64 data URL if storage bucket fails/not created
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type || 'image/jpeg'};base64,${base64}`;
      return NextResponse.json({ success: true, url: dataUrl, warning: error.message });
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from('IMAGES').getPublicUrl(filename);
    return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
  } catch (err: any) {
    console.error('Error in POST /api/upload:', err);
    return NextResponse.json({ success: false, error: err?.message || 'File upload failed' }, { status: 500 });
  }
}
