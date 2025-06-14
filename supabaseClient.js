import { createClient } from '@supabase/supabase-js';

// Remplacez par votre URL Supabase et votre clé publique anonymisée
const supabaseUrl = 'https://tihviztkvienratffbgd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaHZpenRrdmllbnJhdGZmYmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2ODkzNDEsImV4cCI6MjA2NTI2NTM0MX0.J60ENK2jmRgXPIl4783c-uPP-21WvrcCpt_0fPyVTlU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
