import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PRIMARY_SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'dev';
const CANDIDATE_TABLES = ['meeting', 'meetings'];
const SCHEMAS = PRIMARY_SCHEMA === 'public' ? ['public'] : [PRIMARY_SCHEMA, 'public'];

function getSupabaseClient(schema: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tyiecstaywsocmqsabhg.supabase.co';
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema },
  });
}

function isTableNotFoundError(error: any): boolean {
  if (!error) return false;
  const msg = error.message || '';
  return (
    msg.includes('schema cache') && msg.includes('table') ||
    msg.includes('relation') && msg.includes('does not exist') ||
    error.code === 'PGRST106' ||
    error.code === '42P01'
  );
}

function extractMissingColumn(error: any): string | null {
  if (!error) return null;
  const msg = error.message || '';
  const match =
    msg.match(/Could not find the ['"]?([a-zA-Z0-9_]+)['"]? column/i) ||
    msg.match(/column ['"]?([a-zA-Z0-9_]+)['"]? of relation/i) ||
    msg.match(/column "([a-zA-Z0-9_]+)" does not exist/i);
  return match ? match[1] : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');

    let primaryError: any = null;

    for (const schema of SCHEMAS) {
      const client = getSupabaseClient(schema);

      for (const table of CANDIDATE_TABLES) {
        try {
          let query = client.from(table).select('*').order('date', { ascending: false });

          if (district && district !== 'All Districts') {
            query = query.ilike('district', `%${district}%`);
          }

          let { data, error } = await query;

          // If error was due to 'district' column missing or ordering, try basic select
          if (error && (extractMissingColumn(error) || error.message?.includes('order'))) {
            const fallbackRes = await client.from(table).select('*');
            if (!fallbackRes.error) {
              return NextResponse.json({ success: true, data: fallbackRes.data || [], table: `${schema}.${table}` });
            }
          }

          if (!error) {
            return NextResponse.json({ success: true, data: data || [], table: `${schema}.${table}` });
          }

          if (schema === PRIMARY_SCHEMA && !primaryError) {
            primaryError = error;
          }
        } catch (tableErr: any) {
          if (schema === PRIMARY_SCHEMA && !primaryError) {
            primaryError = tableErr;
          }
        }
      }
    }

    const errMessage = primaryError?.message || `Could not find table 'meeting' in '${PRIMARY_SCHEMA}' schema. Please grant permissions and reload schema.`;
    console.warn(`Supabase meetings GET error in ${PRIMARY_SCHEMA}:`, errMessage);
    return NextResponse.json({
      success: false,
      error: errMessage,
      data: []
    }, { status: 200 });
  } catch (err: any) {
    console.error('API /api/meetings GET error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error', data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      agenda,
      date,
      time,
      venue,
      chairperson,
      recordedBy,
      attendeesCount,
      status,
      district,
      minutes,
      resolutions,
    } = body;

    if (!title || !date) {
      return NextResponse.json({ success: false, error: 'Title and Date are required' }, { status: 400 });
    }

    const baseRecord: Record<string, any> = {
      title,
      date,
      venue: venue || '',
      agenda: agenda || '',
      time: time || '11:00 AM - 01:00 PM',
      chairperson: chairperson || 'District President',
      recorded_by: recordedBy || 'District Secretary',
      attendees_count: Number(attendeesCount) || 10,
      status: status || 'upcoming',
      district: district || '',
      minutes: minutes || '',
      resolutions: Array.isArray(resolutions)
        ? resolutions
        : typeof resolutions === 'string'
        ? resolutions.split('\n').map((s: string) => s.trim()).filter(Boolean)
        : [],
    };

    let primaryError: any = null;

    for (const schema of SCHEMAS) {
      const client = getSupabaseClient(schema);

      for (const table of CANDIDATE_TABLES) {
        let recordToInsert = { ...baseRecord };

        // Try inserting, pruning columns if the table schema doesn't have all columns
        for (let attempt = 0; attempt < 12; attempt++) {
          const { data, error } = await client
            .from(table)
            .insert(recordToInsert)
            .select()
            .single();

          if (!error && data) {
            return NextResponse.json({
              success: true,
              data,
              table: `${schema}.${table}`
            });
          }

          if (schema === PRIMARY_SCHEMA && !primaryError) {
            primaryError = error;
          }

          if (isTableNotFoundError(error)) {
            break; // Table doesn't exist, try next table
          }

          const missingCol = extractMissingColumn(error);
          if (missingCol && missingCol in recordToInsert) {
            console.warn(`Column '${missingCol}' does not exist on table '${schema}.${table}', pruning...`);
            delete recordToInsert[missingCol];
            continue; // retry insert without the missing column
          }

          // Check for type mismatch errors like:
          // invalid input syntax for type date: "11:00 AM - 01:00 PM"
          const syntaxMatch = error?.message?.match(/invalid input syntax for type [^:]+: "([^"]+)"/i);
          if (syntaxMatch && syntaxMatch[1]) {
            const badVal = syntaxMatch[1];
            const badKey = Object.keys(recordToInsert).find(
              (k) => String(recordToInsert[k]) === badVal
            );
            if (badKey) {
              console.warn(`Field '${badKey}' with value '${badVal}' caused type error in '${schema}.${table}', pruning...`);
              delete recordToInsert[badKey];
              continue; // retry insert without the mismatched field
            }
          }

          // If time specifically caused a date/time type error, prune time
          if (error?.message?.toLowerCase().includes('type date') && 'time' in recordToInsert) {
            console.warn(`Pruning 'time' due to date type constraint on table '${schema}.${table}'...`);
            delete recordToInsert.time;
            continue;
          }

          break; // other error
        }
      }
    }

    const errorMsg = primaryError?.message || `Could not find table 'meeting' in '${PRIMARY_SCHEMA}' schema.`;
    console.error(`Supabase meetings POST error in ${PRIMARY_SCHEMA}:`, errorMsg);
    return NextResponse.json({
      success: false,
      error: errorMsg
    }, { status: 400 });
  } catch (err: any) {
    console.error('API /api/meetings POST error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to create meeting' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Meeting ID is required' }, { status: 400 });
    }

    const basePayload: Record<string, any> = { ...updates };
    if (updates.recordedBy) {
      basePayload.recorded_by = updates.recordedBy;
    }
    if (updates.attendeesCount !== undefined) {
      basePayload.attendees_count = Number(updates.attendeesCount);
    }
    if (updates.resolutions && typeof updates.resolutions === 'string') {
      basePayload.resolutions = updates.resolutions.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }

    let primaryError: any = null;

    for (const schema of SCHEMAS) {
      const client = getSupabaseClient(schema);

      for (const table of CANDIDATE_TABLES) {
        let payload = { ...basePayload };

        for (let attempt = 0; attempt < 12; attempt++) {
          const { data, error } = await client
            .from(table)
            .update(payload)
            .eq('id', id)
            .select()
            .single();

          if (!error && data) {
            return NextResponse.json({ success: true, data });
          }

          if (schema === PRIMARY_SCHEMA && !primaryError) {
            primaryError = error;
          }

          if (isTableNotFoundError(error)) {
            break;
          }

          const missingCol = extractMissingColumn(error);
          if (missingCol && missingCol in payload) {
            delete payload[missingCol];
            continue;
          }

          const syntaxMatch = error?.message?.match(/invalid input syntax for type [^:]+: "([^"]+)"/i);
          if (syntaxMatch && syntaxMatch[1]) {
            const badVal = syntaxMatch[1];
            const badKey = Object.keys(payload).find((k) => String(payload[k]) === badVal);
            if (badKey) {
              delete payload[badKey];
              continue;
            }
          }

          if (error?.message?.toLowerCase().includes('type date') && 'time' in payload) {
            delete payload.time;
            continue;
          }

          break;
        }
      }
    }

    return NextResponse.json({
      success: false,
      error: primaryError?.message || 'Failed to update meeting'
    }, { status: 400 });
  } catch (err: any) {
    console.error('API /api/meetings PUT error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update meeting' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Meeting ID is required' }, { status: 400 });
    }

    let primaryError: any = null;

    for (const schema of SCHEMAS) {
      const client = getSupabaseClient(schema);

      for (const table of CANDIDATE_TABLES) {
        const { error } = await client.from(table).delete().eq('id', id);

        if (!error) {
          return NextResponse.json({ success: true });
        }

        if (schema === PRIMARY_SCHEMA && !primaryError) {
          primaryError = error;
        }

        if (isTableNotFoundError(error)) {
          continue;
        }
      }
    }

    return NextResponse.json({
      success: false,
      error: primaryError?.message || 'Failed to delete meeting'
    }, { status: 400 });
  } catch (err: any) {
    console.error('API /api/meetings DELETE error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to delete meeting' }, { status: 500 });
  }
}
