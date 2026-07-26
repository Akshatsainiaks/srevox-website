import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NAV_CATEGORIES, DocCategory } from "@/data/docsData";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://igjmgrdtrveoigepkuau.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_until_configured";

// Safely initialize Supabase Client without throwing panics
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabaseDocCategory {
  id: string;
  title: string;
  icon: string;
  sort_order: number;
}

export interface SupabaseDocArticle {
  id: string;
  category_id: string;
  title: string;
  content_markdown?: string;
  sort_order: number;
}

// Fetch dynamic docs from Supabase, with automatic fallback to docsData.ts
export async function getDynamicDocsData(): Promise<DocCategory[]> {
  try {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key || key.includes("dummy")) {
      return NAV_CATEGORIES;
    }

    // Query categories
    const { data: categories, error: catError } = await supabase
      .from("docs_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (catError || !categories || categories.length === 0) {
      return NAV_CATEGORIES;
    }

    // Query articles
    const { data: articles, error: artError } = await supabase
      .from("docs_articles")
      .select("*")
      .order("sort_order", { ascending: true });

    if (artError || !articles) {
      return NAV_CATEGORIES;
    }

    // Transform into DocCategory format
    const dynamicNav: DocCategory[] = categories.map((cat: SupabaseDocCategory) => {
      const catArticles = articles
        .filter((art: SupabaseDocArticle) => art.category_id === cat.id)
        .map((art: SupabaseDocArticle) => ({
          id: art.id,
          title: art.title
        }));

      return {
        id: cat.id,
        title: cat.title,
        icon: cat.icon,
        items: catArticles.length > 0 ? catArticles : (NAV_CATEGORIES.find(c => c.id === cat.id)?.items || [])
      };
    });

    return dynamicNav.length > 0 ? dynamicNav : NAV_CATEGORIES;
  } catch (err) {
    console.error("Error fetching docs from Supabase:", err);
    return NAV_CATEGORIES;
  }
}
