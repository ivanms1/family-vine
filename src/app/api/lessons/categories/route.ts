import { NextResponse } from 'next/server';
import { lessonService } from '@/server/services/lesson.service';

export async function GET() {
  try {
    const categories = await lessonService.getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
