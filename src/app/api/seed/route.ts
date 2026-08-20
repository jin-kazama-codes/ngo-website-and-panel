import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    // 1. Create 5 Communities
    const communities = [];
    const cities = ['Bareilly', 'Delhi', 'Lucknow', 'Mumbai', 'Hyderabad'];
    for (let i = 0; i < 5; i++) {
      const { data: comm, error } = await supabaseAdmin.from('communities').insert({
        id: `comm_${Date.now()}_${i}`,
        name: `${cities[i]} Welfare Chapter`,
        city: cities[i],
        state: 'State',
        admin_name: `${cities[i]} Admin`,
        admin_role_title: 'Community Administrator',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        total_members: 20,
        active_campaigns: 2,
        total_raised_inr: 500000,
        health_score: 95,
        verified_status: 'Verified',
        description: `Official chapter for ${cities[i]} providing local emergency aid.`,
        established_year: 2021,
        cover_image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800'
      }).select().single();
      
      if (error) {
        console.error('Community Error:', error);
        continue;
      }
      communities.push(comm);
    }

    // 2. Create 100 members (20 per community) including admin
    for (const comm of communities) {
      const users = [];
      // Admin
      users.push({
        id: `usr_${Date.now()}_${comm.id}_admin`,
        name: comm.admin_name,
        email: `admin_${comm.city.toLowerCase()}@example.com`,
        phone: `999000${Math.floor(1000 + Math.random() * 9000)}`,
        role: 'community_admin',
        community_id: comm.id,
        community_name: comm.name,
        membership_id: `MEM-${comm.id.slice(0,4)}-ADM`,
        is_verified: true,
        city: comm.city,
        state: comm.state,
        password: 'hashed_password'
      });
      
      // 19 Members
      for (let i = 0; i < 19; i++) {
        users.push({
          id: `usr_${Date.now()}_${comm.id}_${i}`,
          name: `Member ${i} ${comm.city}`,
          email: `member${i}_${comm.city.toLowerCase()}@example.com`,
          phone: `888000${Math.floor(1000 + Math.random() * 9000)}`,
          role: 'member',
          community_id: comm.id,
          community_name: comm.name,
          membership_id: `MEM-${comm.id.slice(0,4)}-${i}`,
          is_verified: true,
          city: comm.city,
          state: comm.state,
          password: 'hashed_password'
        });
      }
      const { error: uErr } = await supabaseAdmin.from('users').insert(users);
      if (uErr) console.error('User Error:', uErr);
    }

    // 3. Create 10 Campaigns
    const categories = ['Medical', 'Education', 'Food', 'Marriage', 'Janazah', 'Zakat'];
    for (let i = 0; i < 10; i++) {
      const comm = communities[i % communities.length];
      const isZakat = i % 2 === 0;
      const isUrgent = i % 3 === 0;
      const cat = categories[i % categories.length];
      
      const { error: cErr } = await supabaseAdmin.from('campaigns').insert({
        id: `camp_${Date.now()}_${i}`,
        title: `Urgent ${cat} Support for Family in ${comm.city}`,
        category: cat,
        community_id: comm.id,
        community_name: comm.name,
        city: comm.city,
        beneficiary_name: `Beneficiary ${i}`,
        beneficiary_relation: 'Self',
        goal_inr: 100000 + (i * 10000),
        raised_inr: 20000 + (i * 5000),
        donors_count: 10 + i,
        days_left: 15 + i,
        is_verified: true,
        is_zakat_eligible: isZakat,
        is_urgent: isUrgent,
        main_image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800',
        story: 'This is a detailed story about the cause. They need immediate help. We request everyone to come forward and support this cause.',
        status: 'active'
      });
      if (cErr) console.error('Camp Error:', cErr);
    }

    // 4. Gallery
    for (let i = 0; i < 5; i++) {
      const comm = communities[i % communities.length];
      const { error: gErr } = await supabaseAdmin.from('gallery_photos').insert({
        title: `Food Drive in ${comm.city}`,
        city: comm.city,
        category: 'Food',
        image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
        community_id: comm.id,
        status: 'approved'
      });
      if (gErr) console.error('Gallery Error:', gErr);
    }

    // 5. Stories (community_stories)
    for (let i = 0; i < 5; i++) {
      const comm = communities[i % communities.length];
      const { error: sErr } = await supabaseAdmin.from('community_stories').insert({
        id: `story_${Date.now()}_${i}`,
        title: `How ${comm.name} saved a life`,
        category: 'Medical',
        location: comm.city,
        date: new Date().toISOString(),
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
        summary: 'A wonderful story of community support.',
        impact_metric: '1 Life Saved'
      });
      if (sErr) console.error('Story Error:', sErr);
    }

    // 6. Testimonials
    for (let i = 0; i < 5; i++) {
      const comm = communities[i % communities.length];
      const { error: tErr } = await supabaseAdmin.from('testimonials').insert({
        id: `test_${Date.now()}_${i}`,
        name: `Donor ${i} from ${comm.city}`,
        role: 'Verified Donor',
        city: comm.city,
        quote: 'This platform has made it so easy to see the direct impact of our contributions. Highly recommended and trustworthy!',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150',
        community_id: comm.id,
        status: 'approved'
      });
      if (tErr) console.error('Testimonial Error:', tErr);
    }

    return NextResponse.json({ success: true, message: 'Seed data created successfully!' });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
