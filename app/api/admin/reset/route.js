import { NextResponse } from 'next/server';
import { resetAllData } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    
    await resetAllData(body?.pin);

    return NextResponse.json({ 
      success: true, 
      message: 'Đã xóa toàn bộ RSVP và Sổ lưu bút cũ! Hệ thống sẵn sàng cho đám cưới mới.' 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Lỗi khi đặt lại dữ liệu!' 
    }, { status: error.message === 'Sai mã PIN quản trị!' ? 401 : 500 });
  }
}
