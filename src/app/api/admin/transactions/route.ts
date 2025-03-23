import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.user_type !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    // Build query
    let query = supabase
      .from('transactions')
      .select(`
        *,
        sender:profiles!sender_id(*),
        receiver:profiles!receiver_id(*),
        project:projects(*)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (type === 'sent') {
      query = query.eq('sender_id', session.user.id);
    } else if (type === 'received') {
      query = query.eq('receiver_id', session.user.id);
    }

    if (start) {
      query = query.gte('created_at', start);
    }
    if (end) {
      query = query.lte('created_at', end);
    }

    // Fetch transactions
    const { data: transactions, error } = await query;

    if (error) throw error;

    // Calculate statistics
    const statistics = {
      totalTransactions: transactions.length,
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
      completedTransactions: transactions.filter(t => t.status === 'completed').length,
      pendingTransactions: transactions.filter(t => t.status === 'pending').length,
      failedTransactions: transactions.filter(t => t.status === 'failed').length,
    };

    return NextResponse.json({
      transactions,
      statistics,
    });
  } catch (error) {
    console.error('Admin transactions error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
} 