import { NextRequest, NextResponse } from 'next/server';
import { requireChild } from '@/server/auth-helpers';
import { lessonService } from '@/server/services/lesson.service';
import { completeLessonSchema } from '@/server/validators/lesson.validators';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await requireChild(request);
    const { lessonId } = await params;

    const body = await request.json();
    const input = completeLessonSchema.parse(body);

    const result = await lessonService.completeLesson(
      lessonId,
      session.childProfileId!,
      input
    );

    return NextResponse.json(result);
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
