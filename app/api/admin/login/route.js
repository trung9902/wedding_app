import { NextResponse } from 'next/server';
import { verifyAdminPin } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const isValid = await verifyAdminPin(body?.pin);

    if (isValid) {
      return NextResponse.json({ success: true, message: 'Đăng nhập thành công!' });
    } else {
      return NextResponse.json({ success: false, error: 'Mã PIN không chính xác!' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
