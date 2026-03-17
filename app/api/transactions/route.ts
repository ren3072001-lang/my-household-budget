import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { desc, amount, category, date } = body;

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        { desc, amount, category, date: date || new Date().toISOString() }
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error inserting transaction:', error);
    return NextResponse.json({ error: 'Failed to insert transaction' }, { status: 500 });
  }
}
