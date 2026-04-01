import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Mock Config Variables (Replace with actual secrets in production)
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') || 'mock_sid';
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') || 'mock_token';
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER') || 'whatsapp:+14155238886'; 

// Utility to dispatch WhatsApp messages via Twilio REST API
async function sendWhatsAppMessage(to: string, message: string) {
  // If secrets aren't set, intercept and log the action rather than failing
  if (TWILIO_ACCOUNT_SID === 'mock_sid') {
    console.log(`\n[DRY RUN] Would send to ${to}:`, message);
    return;
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const body = new URLSearchParams();
  body.append('To', `whatsapp:${to}`);
  body.append('From', TWILIO_PHONE_NUMBER);
  body.append('Body', message);

  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  
  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  return response.json();
}

console.log('Bookio WhatsApp Dispatch Service initialized.');

serve(async (req) => {
  try {
    // 1. Verify JSON payload structure from native pg_net webhook
    const payload = await req.json();
    if (!payload.record || payload.type !== 'INSERT') {
      return new Response('Ignored: Not a valid booking insertion', { status: 200 });
    }

    const booking = payload.record;

    // 2. Initialize Supabase Admin Client using Edge Function runtime secrets
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. Fetch relational mapping: Studio Entity & Creator Entity
    const { data: studio } = await supabaseClient
      .from('studios')
      .select('name, location, owner_id')
      .eq('id', booking.studio_id)
      .single();

    if (!studio) {
      throw new Error(`Studio mapping not exactly matched for booking ${booking.id}`);
    }

    const { data: creator } = await supabaseClient
      .from('users')
      .select('name, phone')
      .eq('id', booking.creator_id)
      .single();

    // In a massive production build, you'd fetch the Studio Owner's WhatsApp config.
    // For Phase 4, we simulate pushing logic to the two specific distinct actors.

    const creatorName = creator?.name || 'Guest Creator';
    const creatorPhone = creator?.phone || '+919876543210';
    const studioPhone = '+919800000000'; // Mock Studio Phone

    // 4. Construct Message Payload A (Creator Confirmation)
    const msgToCreator = `Booking confirmed for ${studio.name}! 🎙️
    
Time slots reserved: ${booking.slot_ids.length}
Total amount paid: ₹${booking.advance_paid}

Here is the location map for your session:
https://maps.google.com/?q=${encodeURIComponent(studio.location)}`;


    // 5. Construct Message Payload B (Supply Notification)
    const msgToStudio = `New booking via your Link! 🔔
    
${creatorName} just paid an advance of ₹${booking.advance_paid} to secure ${booking.slot_ids.length} slot(s).
Please prepare the studio standard setup procedure.
View details in your Dashboard.`;

    // 6. Asynchronously execute REST network requests without blocking
    await Promise.all([
      sendWhatsAppMessage(creatorPhone, msgToCreator),
      sendWhatsAppMessage(studioPhone, msgToStudio)
    ]);

    return new Response(JSON.stringify({ 
      success: true, 
      logs: `Dispatched booking ID ${booking.id} events` 
    }), { 
      headers: { 'Content-Type': 'application/json' },
      status: 200 
    });
    
  } catch (error) {
    console.error('Webhook processing failure:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});
