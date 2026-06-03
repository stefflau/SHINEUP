import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://tcbagkreseztrjtqbfyd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjYmFna3Jlc2V6dHJqdHFiZnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NzQ3MzcsImV4cCI6MjA5NTI1MDczN30.kVbm-ch1Eq4T8SBb1BPruQXaEpH8sajb4Mfze1UAIbY"
);