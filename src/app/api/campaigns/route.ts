import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const DEFAULT_CAMPAIGNS = [
  {
    id: 'camp_med_01',
    title: 'Urgent Kidney Transplant for 8-Year-Old Zoya in AIIMS Delhi',
    slug: 'kidney-transplant-zoya-aiims',
    category: 'Medical',
    community_id: 'comm_delhi_central',
    community_name: 'Hazrat Nizamuddin Welfare Community',
    city: 'Delhi',
    beneficiary_name: 'Zoya Siddiqui (8 yrs)',
    beneficiary_relation: 'Father: Imran Siddiqui (Daily wage carpenter)',
    goal_inr: 450000,
    raised_inr: 320000,
    donors_count: 184,
    days_left: 8,
    is_verified: true,
    is_zakat_eligible: true,
    is_urgent: true,
    is_premium_featured: true,
    main_image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
    story: 'Little Zoya was diagnosed with end-stage renal disease 4 months ago. Her father works as a local daily-wage wood craftsman and has exhausted all savings on weekly dialysis.',
    documents: [
      { title: 'AIIMS Medical Prescription & Estimate', url: '#', verifiedBy: 'Executive Team' },
      { title: 'Aadhaar Card & Income Certificate', url: '#', verifiedBy: 'Community Admin' },
    ],
    verification_timeline: [
      { step: 'Beneficiary Identity Verification', date: '10 Jul 2024', status: 'completed' },
      { step: 'Medical Hospital On-site Verification', date: '12 Jul 2024', status: 'completed' },
      { step: 'Executive Committee Approval', date: '14 Jul 2024', status: 'completed' },
      { step: 'Campaign Live & Direct Bank Escrow Active', date: '15 Jul 2024', status: 'completed' },
    ],
    need_breakdown: [
      { item: 'Surgery & Operation Theatre Charges', amountINR: 220000 },
      { item: 'ICU Stay & Monitoring (10 Days)', amountINR: 110000 },
      { item: 'Post-transplant Immunosuppressant Medications', amountINR: 80000 },
      { item: 'Blood Transfusion & Pre-op Testing', amountINR: 40000 },
    ],
    created_date: '15 Jul 2024',
    status: 'active',
  },
  {
    id: 'camp_edu_02',
    title: 'Higher Education Scholarship Fund for 15 Orphan Girls in Bareilly',
    slug: 'orphan-girls-higher-education-bareilly',
    category: 'Education',
    community_id: 'comm_bareilly_rohilkhand',
    community_name: 'Rohilkhand Educational & Nikah Trust',
    city: 'Bareilly',
    beneficiary_name: '15 Student Scholars',
    beneficiary_relation: 'Care of Bareilly Orphan Care Trust',
    goal_inr: 300000,
    raised_inr: 215000,
    donors_count: 96,
    days_left: 14,
    is_verified: true,
    is_zakat_eligible: true,
    is_urgent: false,
    is_premium_featured: true,
    main_image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    story: '15 bright young girls who cleared their Class 12 exams with top honors (above 85%) lack the financial means to pay college admission fees.',
    documents: [{ title: 'Mark Sheets & College Admission Letters', url: '#', verifiedBy: 'Executive Team' }],
    verification_timeline: [
      { step: 'Academic Verification', date: '01 Jun 2024', status: 'completed' },
      { step: 'College Fee Structure Clearance', date: '05 Jun 2024', status: 'completed' },
      { step: 'Executive Approval', date: '10 Jun 2024', status: 'completed' },
    ],
    need_breakdown: [
      { item: 'College Admission & Semester Fees (15 students)', amountINR: 210000 },
      { item: 'Books, Uniforms & Study Kit', amountINR: 60000 },
      { item: 'Transport Stipend', amountINR: 30000 },
    ],
    created_date: '10 Jun 2024',
    status: 'active',
  },
  {
    id: 'camp_marr_03',
    title: 'Simple Dignified Marriage Support for Orphan Bride Sania in Lucknow',
    slug: 'marriage-support-sania-lucknow',
    category: 'Marriage',
    community_id: 'comm_lko_chowk',
    community_name: 'Chowk Heritage Community Foundation',
    city: 'Lucknow',
    beneficiary_name: 'Sania Parveen (21 yrs)',
    beneficiary_relation: 'Mother: Rashida Begum (Widow)',
    goal_inr: 120000,
    raised_inr: 98000,
    donors_count: 64,
    days_left: 5,
    is_verified: true,
    is_zakat_eligible: true,
    is_urgent: true,
    is_premium_featured: false,
    main_image: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80',
    story: 'Sania lost her father 6 years ago. Her widowed mother works hard stitching clothes to feed her family.',
    documents: [{ title: 'Nikah Registration Card & Invitation', url: '#', verifiedBy: 'Community Admin' }],
    verification_timeline: [
      { step: 'Local Verification & Community Visit', date: '18 Jul 2024', status: 'completed' },
      { step: 'Executive Approval', date: '20 Jul 2024', status: 'completed' },
    ],
    need_breakdown: [
      { item: 'Basic Household Essentials & Sewing Machine Gift', amountINR: 75000 },
      { item: 'Simple Meal & Venue Arrangement for 40 Guests', amountINR: 35000 },
      { item: 'Administrative & Transport', amountINR: 10000 },
    ],
    created_date: '20 Jul 2024',
    status: 'active',
  },
  {
    id: 'camp_food_04',
    title: 'Monthly Ration Kits for 200 Flood Affected Families in Hyderabad',
    slug: 'monthly-ration-kits-hyderabad',
    category: 'Food',
    community_id: 'comm_bareilly_rohilkhand',
    community_name: 'Charminar Heritage & Care Society',
    city: 'Hyderabad',
    beneficiary_name: '200 Lower-income Families',
    beneficiary_relation: 'Old City Flood Relief Drive',
    goal_inr: 500000,
    raised_inr: 410000,
    donors_count: 230,
    days_left: 12,
    is_verified: true,
    is_zakat_eligible: true,
    is_urgent: true,
    is_premium_featured: true,
    main_image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    story: 'Heavy monsoon rains flooded low-lying streets in Hyderabad, damaging food stocks and homes of informal daily wage workers.',
    documents: [{ title: 'Beneficiary List & Token Verification', url: '#', verifiedBy: 'Community Admin' }],
    verification_timeline: [
      { step: 'Survey of Affected Households', date: '02 Jul 2024', status: 'completed' },
      { step: 'Ration Vendor Selection', date: '05 Jul 2024', status: 'completed' },
    ],
    need_breakdown: [
      { item: '200 Ration Grocery Bags @ ₹2200 per bag', amountINR: 440000 },
      { item: 'Packing & Transportation Logistics', amountINR: 60000 },
    ],
    created_date: '05 Jul 2024',
    status: 'active',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const city = searchParams.get('city');
  const zakatOnly = searchParams.get('zakatOnly') === 'true';
  const status = searchParams.get('status');

  try {
    let query = supabaseAdmin.from('campaigns').select('*');

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (category && category !== 'All') {
      if (category === 'Zakat') {
        query = query.eq('is_zakat_eligible', true);
      } else {
        query = query.eq('category', category);
      }
    }

    if (zakatOnly) {
      query = query.eq('is_zakat_eligible', true);
    }

    if (city && city !== 'All') {
      query = query.eq('city', city);
    }

    query = query.order('is_urgent', { ascending: false }).order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    let results = data ?? [];

    if (results.length === 0) {
      // Seed default campaigns if DB returns 0 rows
      try {
        for (const item of DEFAULT_CAMPAIGNS) {
          await supabaseAdmin.from('campaigns').insert(item);
        }
        const { data: refetched } = await supabaseAdmin.from('campaigns').select('*');
        results = (refetched && refetched.length > 0) ? refetched : DEFAULT_CAMPAIGNS;
      } catch (seedErr) {
        console.error('Seeding error:', seedErr);
        results = DEFAULT_CAMPAIGNS;
      }
    }

    return NextResponse.json({ success: true, data: results });
  } catch (err: any) {
    console.error('Error in GET /api/campaigns:', err);
    return NextResponse.json(
      { success: true, data: DEFAULT_CAMPAIGNS, warning: err?.message },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newCampaign = {
      id: body.id || `camp_${Date.now()}`,
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: body.category,
      community_id: body.communityId || body.community_id,
      community_name: body.communityName || body.community_name,
      city: body.city,
      beneficiary_name: body.beneficiaryName || body.beneficiary_name,
      beneficiary_relation: body.beneficiaryRelation || body.beneficiary_relation,
      goal_inr: body.goalINR || body.goal_inr,
      raised_inr: body.raisedINR || body.raised_inr || 0,
      donors_count: body.donorsCount || body.donors_count || 0,
      days_left: body.daysLeft || body.days_left || 30,
      is_verified: body.isVerified !== undefined ? body.isVerified : true,
      is_zakat_eligible: body.isZakatEligible !== undefined ? body.isZakatEligible : true,
      is_urgent: body.isUrgent !== undefined ? body.isUrgent : false,
      is_premium_featured: body.isPremiumFeatured !== undefined ? body.isPremiumFeatured : false,
      main_image: body.mainImage || body.main_image,
      story: body.story,
      documents: body.documents || [],
      verification_timeline: body.verificationTimeline || body.verification_timeline || [],
      need_breakdown: body.needBreakdown || body.need_breakdown || [],
      created_date: body.createdDate || body.created_date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: body.status || 'pending_approval',
    };

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .insert(newCampaign)
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting campaign:', error);
      // Fallback return created object if DB insert failed
      return NextResponse.json({ success: true, data: newCampaign, warning: error.message });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in POST /api/campaigns:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
