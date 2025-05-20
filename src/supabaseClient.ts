import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xgguqgulwtjrazpcowub.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZ3VxZ3Vsd3RqcmF6cGNvd3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MTM4MjgsImV4cCI6MjA2Mjk4OTgyOH0.ltBsVipxyHV48uaBEtNzVfMzHK1E7r85aJkv_kOEBB0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
 