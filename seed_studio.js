const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding Live Studio Data...');

  // 1. Get or create a super_admin / studio_owner to own the studio
  let ownerId = null;
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
  if (profiles && profiles.length > 0) {
    ownerId = profiles[0].id;
  } else {
    console.log('No profiles exist yet. Please create an account in the app first so you have an Owner ID.');
    return;
  }

  // 2. Insert Studio
  const { data: studio, error: sErr } = await supabase.from('studios').insert({
    owner_id: ownerId,
    name: 'Neon Horizon Podcast Studio',
    location: 'Koramangala, Bangalore',
    description: 'A premium recording space for high-end audio and video podcasts.',
    base_price_per_hour: 800,
    photos: ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670&auto=format&fit=crop'],
    facilities: ['Wi-Fi', 'AC', '4x Shure SM7B', 'RGB Lighting'],
    is_active: true,
    is_verified: true
  }).select().single();

  if (sErr) {
    console.log('Error inserting studio:', sErr.message);
    return;
  }

  console.log('Successfully created Studio:', studio.id);

  // 3. Generate 7 days of inventory
  const slots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00'];
  let inserts = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

    slots.forEach((slot, sIdx) => {
      // Create a fake flash deal roughly 20% of the time
      const isFlash = Math.random() < 0.2;
      const currentPrice = isFlash ? 600 : 800;

      inserts.push({
        studio_id: studio.id,
        date: dateStr,
        time_slot: slot,
        start_time: new Date(`${dateStr}T${slot.split('-')[0]}:00Z`).toISOString(),
        status: 'available',
        base_price: 800,
        current_price: currentPrice,
        is_flash_deal: isFlash,
        is_price_locked: false
      });
    });
  }

  const { error: iErr } = await supabase.from('inventory').insert(inserts);
  if (iErr) {
     console.log('Error inserting inventory:', iErr.message);
  } else {
     console.log('Successfully injected 35 live inventory slots!');
  }
}

seed();
