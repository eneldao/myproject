import { supabase } from './supabase';

type TableResult = {
  exists: boolean;
  error?: string;
  count: number;
};

type TableResults = {
  [key: string]: TableResult;
};

export async function checkTables() {
  const tables = ['profiles', 'freelancers', 'reviews', 'projects', 'messages'];
  const results: TableResults = {};

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      results[table] = {
        exists: !error,
        error: error?.message,
        count: count ?? 0
      };
    } catch (e) {
      results[table] = {
        exists: false,
        error: e instanceof Error ? e.message : 'Unknown error',
        count: 0
      };
    }
  }

  console.log('Table check results:', results);
  return results;
} 