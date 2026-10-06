import { NextResponse } from 'next/server';
import { getRsvps, addRsvp } from '@/lib/db';

export async function GET() {
  try {
    const data = await getRsvps();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập họ và tên!' }, { status: 400 });
    }

    const newRsvp = await addRsvp({
      name: body.name.trim(),
      phone: body.phone?.trim() || '',
      attending: body.attending || 'yes',
      guestCount: parseInt(body.guestCount, 10) || 1,
      note: body.note?.trim() || '',
    });

    return NextResponse.json({ 
      success: true, 
      data: newRsvp, 
      message: 'Gửi xác nhận thành công! Xin chân thành cảm ơn bạn.' 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
