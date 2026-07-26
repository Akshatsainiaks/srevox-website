-- ========================================================
-- SREVOX DOCS & WEBSITE DYNAMIC DATABASE SCHEMA FOR SUPABASE
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/igjmgrdtrveoigepkuau/sql/new
-- ========================================================

-- 1. Create docs_categories Table
CREATE TABLE IF NOT EXISTS public.docs_categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'BookOpen',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create docs_articles Table
CREATE TABLE IF NOT EXISTS public.docs_articles (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES public.docs_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_markdown TEXT DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create site_settings Table (for logo, title, theme, announcements)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.docs_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docs_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Read Permissions for Public / Anonymous Users
CREATE POLICY "Allow public read access on docs_categories" ON public.docs_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on docs_articles" ON public.docs_articles FOR SELECT USING (true);
CREATE POLICY "Allow public read access on site_settings" ON public.site_settings FOR SELECT USING (true);

-- Write Permissions for Authenticated Admin Users
CREATE POLICY "Allow admin write access on docs_categories" ON public.docs_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write access on docs_articles" ON public.docs_articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write access on site_settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

-- ========================================================
-- INITIAL SEED DATA POPULATION
-- ========================================================

-- Insert Documentation Categories
INSERT INTO public.docs_categories (id, title, icon, sort_order) VALUES
  ('intro', 'Introduction', 'BookOpen', 1),
  ('clusters', 'Clusters', 'Server', 2),
  ('channels', 'Alert Channels', 'Bell', 3),
  ('rules', 'Alert Rules', 'Shield', 4),
  ('ai', 'AI Diagnosis', 'Zap', 5),
  ('api', 'API Reference', 'Code', 6),
  ('k8s', 'Testing & K8s', 'Terminal', 7)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, icon = EXCLUDED.icon, sort_order = EXCLUDED.sort_order;

-- Insert Documentation Articles
INSERT INTO public.docs_articles (id, category_id, title, sort_order) VALUES
  -- Introduction
  ('what', 'intro', 'What is Srevox?', 1),
  ('how', 'intro', 'How it works', 2),
  ('arch', 'intro', 'Architecture', 3),
  ('qs', 'intro', 'Quick start (5 min)', 4),
  ('docker-compose', 'intro', 'Docker Compose file', 5),
  
  -- Clusters
  ('connect', 'clusters', 'Connect a cluster', 1),
  ('agent', 'clusters', 'Agent installation', 2),
  ('agent-yaml', 'clusters', 'srevox-agent.yaml manifest', 3),
  ('kubeconfig', 'clusters', 'Kubeconfig method', 4),
  ('rbac', 'clusters', 'RBAC permissions', 5),

  -- Alert Channels
  ('email', 'channels', 'Email / Gmail', 1),
  ('teams', 'channels', 'Microsoft Teams', 2),
  ('whatsapp', 'channels', 'WhatsApp', 3),
  ('webhook', 'channels', 'Webhook / Slack', 4),

  -- Alert Rules
  ('rule-create', 'rules', 'Creating rules', 1),
  ('noise', 'rules', 'Noise control', 2),
  ('reasons', 'rules', 'Crash reasons', 3),

  -- AI Diagnosis
  ('ai-overview', 'ai', 'Overview', 1),
  ('ai-providers', 'ai', 'AI providers', 2),
  ('ai-local', 'ai', 'Local / offline', 3),

  -- API Reference
  ('api-auth', 'api', 'Authentication', 1),
  ('api-incidents', 'api', 'Incidents', 2),
  ('api-clusters', 'api', 'Clusters', 3),

  -- Testing & K8s
  ('k8s-redis', 'k8s', 'Test via Redis', 1),
  ('k8s-crash', 'k8s', 'Simulate pod crash', 2),
  ('k8s-watcher', 'k8s', 'Run Go watcher', 3),
  ('k8s-full', 'k8s', 'Full cluster setup', 4)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category_id = EXCLUDED.category_id, sort_order = EXCLUDED.sort_order;

-- Insert Site Branding Settings
INSERT INTO public.site_settings (key, value) VALUES
  ('branding', '{"name": "SREVOX", "tagline": "Autonomous AI Incident Diagnostics for Kubernetes Workloads", "version": "v1.0"}'::jsonb),
  ('admin_config', '{"allow_registration": false, "session_timeout_mins": 60}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
