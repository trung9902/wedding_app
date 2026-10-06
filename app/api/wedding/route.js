import { NextResponse } from 'next/server';
import { getPublicWeddingConfig, verifyAdminPin, updateWeddingConfig } from '@/lib/db';

export async function GET() {
  try {
    const data = await getPublicWeddingConfig();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    
    // Check PIN or token
    const isValidPin = await verifyAdminPin(body.pin);
    if (!isValidPin) {
      return NextResponse.json({ success: false, error: 'Sai mã PIN quản trị!' }, { status: 401 });
    }

    const updated = await updateWeddingConfig(body.data, body.newPin);
    return NextResponse.json({ success: true, message: 'Cập nhật thành công!', data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
