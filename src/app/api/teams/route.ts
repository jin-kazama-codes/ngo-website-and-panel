import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PRIMARY_SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'dev';
const CANDIDATE_TABLES = ['district_teams', 'teams', 'team_units', 'district_team_units'];
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
    (msg.includes('schema cache') && msg.includes('table')) ||
    (msg.includes('relation') && msg.includes('does not exist')) ||
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
          let query = client.from(table).select('*').order('created_at', { ascending: false });

          if (district && district !== 'All Districts') {
            query = query.ilike('district', `%${district}%`);
          }

          let { data, error } = await query;

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

    const errMessage = primaryError?.message || `Could not find table 'district_teams' or 'teams' in '${PRIMARY_SCHEMA}' schema.`;
    console.warn(`Supabase teams GET error in ${PRIMARY_SCHEMA}:`, errMessage);
    return NextResponse.json({
      success: false,
      error: errMessage,
      data: []
    }, { status: 200 });
  } catch (err: any) {
    console.error('API /api/teams GET error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error', data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      unitName,
      tehsilOrZone,
      district,
      formedDate,
      activeVolunteersCount,
      status,
      objectives,
      members,
    } = body;

    // Accept both PascalCase (HeadName) and camelCase (headName) from the frontend
    const headName: string = body.HeadName || body.headName || '';
    const headPhone: string = body.HeadPhone || body.headPhone || '';

    if (!unitName || !headName) {
      return NextResponse.json({
        success: false,
        error: 'Unit Name and Head Name are required'
      }, { status: 400 });
    }

    const baseRecord: Record<string, any> = {
      unit_name: unitName,
      tehsil_or_zone: tehsilOrZone || '',
      district: district || '',
      head_name: headName,
      head_phone: headPhone,
      formed_date: formedDate || '',
      active_volunteers_count: Number(activeVolunteersCount) || 15,
      status: status || 'pending',
      objectives: objectives || '',
      members: Array.isArray(members)
        ? members
        : typeof members === 'string'
          ? JSON.parse(members || '[]')
          : [],
    };

    let primaryError: any = null;

    for (const schema of SCHEMAS) {
      const client = getSupabaseClient(schema);

      for (const table of CANDIDATE_TABLES) {
        let recordToInsert = { ...baseRecord };

        for (let attempt = 0; attempt < 15; attempt++) {
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
            break;
          }

          const missingCol = extractMissingColumn(error);
          if (missingCol && missingCol in recordToInsert) {
            console.warn(`Column '${missingCol}' does not exist on table '${schema}.${table}', pruning...`);
            delete recordToInsert[missingCol];
            continue;
          }

          // Type mismatch check
          const syntaxMatch = error?.message?.match(/invalid input syntax for type [^:]+: "([^"]+)"/i);
          if (syntaxMatch && syntaxMatch[1]) {
            const badVal = syntaxMatch[1];
            const badKey = Object.keys(recordToInsert).find(
              (k) => String(recordToInsert[k]) === badVal
            );
            if (badKey) {
              console.warn(`Field '${badKey}' caused type error in '${schema}.${table}', pruning...`);
              delete recordToInsert[badKey];
              continue;
            }
          }

          break;
        }
      }
    }

    const errorMsg = primaryError?.message || `Could not find table 'district_teams' or 'teams' in '${PRIMARY_SCHEMA}' schema.`;
    console.error(`Supabase teams POST error in ${PRIMARY_SCHEMA}:`, errorMsg);
    return NextResponse.json({
      success: false,
      error: errorMsg
    }, { status: 400 });
  } catch (err: any) {
    console.error('API /api/teams POST error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to create team unit' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Team Unit ID is required' }, { status: 400 });
    }

    const basePayload: Record<string, any> = { ...updates };
    if (updates.unitName) basePayload.unit_name = updates.unitName;
    if (updates.unitType) basePayload.unit_type = updates.unitType;
    if (updates.tehsilOrZone) basePayload.tehsil_or_zone = updates.tehsilOrZone;
    if (updates.presidentName) basePayload.president_name = updates.presidentName;
    if (updates.presidentPhone) basePayload.president_phone = updates.presidentPhone;
    if (updates.secretaryName) basePayload.secretary_name = updates.secretaryName;
    if (updates.secretaryPhone) basePayload.secretary_phone = updates.secretaryPhone;
    if (updates.coordinatorName !== undefined) basePayload.coordinator_name = updates.coordinatorName;
    if (updates.coordinatorPhone !== undefined) basePayload.coordinator_phone = updates.coordinatorPhone;
    if (updates.formedDate) basePayload.formed_date = updates.formedDate;
    if (updates.activeVolunteersCount !== undefined) {
      basePayload.active_volunteers_count = Number(updates.activeVolunteersCount);
    }
    if (updates.members) {
      basePayload.members = Array.isArray(updates.members)
        ? updates.members
        : typeof updates.members === 'string'
          ? JSON.parse(updates.members)
          : [];
    }

    let primaryError: any = null;

    for (const schema of SCHEMAS) {
      const client = getSupabaseClient(schema);

      for (const table of CANDIDATE_TABLES) {
        let payload = { ...basePayload };

        for (let attempt = 0; attempt < 15; attempt++) {
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

          break;
        }
      }
    }

    return NextResponse.json({
      success: false,
      error: primaryError?.message || 'Failed to update team unit'
    }, { status: 400 });
  } catch (err: any) {
    console.error('API /api/teams PUT error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update team unit' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Team Unit ID is required' }, { status: 400 });
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
      error: primaryError?.message || 'Failed to delete team unit'
    }, { status: 400 });
  } catch (err: any) {
    console.error('API /api/teams DELETE error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to delete team unit' }, { status: 500 });
  }
}
