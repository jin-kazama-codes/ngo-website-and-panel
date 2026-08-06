import { supabase } from '../lib/supabase';

export async function submitContactMessage(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert({
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    status: 'new',
  });
  if (error) throw error;
}

export async function subscribeNewsletter(email: string): Promise<void> {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email }, { onConflict: 'email' });
  if (error) throw error;
}
