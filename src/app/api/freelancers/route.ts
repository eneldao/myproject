import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Fetch all freelancers or a specific freelancer by ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const baseQuery = supabase.from('freelancers').select('*');
    const query = id ? baseQuery.eq('id', id).single() : baseQuery;

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

// POST: Add a new freelancer
export async function POST(request: Request) {
  try {
    const freelancer = await request.json();

    // Validate required fields
    if (!freelancer.name || !freelancer.title || !freelancer.description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('freelancers')
      .insert([freelancer])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

// PUT: Update a freelancer's details
export async function PUT(request: Request) {
  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Freelancer ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('freelancers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a freelancer by ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Freelancer ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('freelancers')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}