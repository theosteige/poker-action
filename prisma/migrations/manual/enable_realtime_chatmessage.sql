-- Enable Realtime for ChatMessage table
-- Run this in the Supabase SQL Editor to enable real-time subscriptions

-- Add the ChatMessage table to the supabase_realtime publication
-- This allows Supabase Realtime to broadcast INSERT/UPDATE/DELETE events
alter publication supabase_realtime add table "ChatMessage";

-- Note: In Supabase, you can also enable this via the Dashboard:
-- 1. Go to Database > Replication
-- 2. Find the ChatMessage table
-- 3. Toggle "Realtime" to enable
