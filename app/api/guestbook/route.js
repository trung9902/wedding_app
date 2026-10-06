import { NextResponse } from 'next/server';
import { getWishes, addWish, deleteWish } from '@/lib/db';

export async function GET() {
  try {
    const data = await getWishes();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name?.trim() || !body.message?.trim()) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập tên và lời chúc!' }, { status: 400 });
    }

    const newWish = await addWish({
      name: body.name.trim(),
      message: body.message.trim(),
    });

    return NextResponse.json({ 
      success: true, 
      data: newWish, 
      message: 'Đã gửi lời chúc thành công!' 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Thiếu id lời chúc' }, { status: 400 });

    await deleteWish(id);
    return NextResponse.json({ success: true, message: 'Đã xóa lời chúc' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
