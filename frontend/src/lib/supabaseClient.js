import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://umnwbatyodajxmhpgtbo.supabase.co";
const supabaseAPIKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbndiYXR5b2RhanhtaHBndGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Mzc5MTAsImV4cCI6MjA2NDExMzkxMH0.Xb21nJmOQVJ9OZNl3udrmxOZBMstq9iMrx5szbnJk-g";
export const supabase = createClient(supabaseUrl, supabaseAPIKey);
