import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const transactions = await request.json();

    if (!Array.isArray(transactions)) {
      return NextResponse.json({ error: 'Expected an array of transactions' }, { status: 400 });
    }

    // Format transactions for Supabase
    const formattedTransactions = transactions.map(t => ({
      desc: t.desc,
      amount: t.amount,
      category: t.category || null,
      date: t.date || new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('transactions')
      .insert(formattedTransactions)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in bulk insert:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
