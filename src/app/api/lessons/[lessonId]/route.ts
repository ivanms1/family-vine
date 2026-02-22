import { NextRequest, NextResponse } from 'next/server';
import { extractUser, extractChildSession } from '@/server/auth-helpers';
import { lessonService } from '@/server/services/lesson.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;

    // Check if child session
    const childSession = await extractChildSession(request);
    if (childSession?.childProfileId) {
      const lesson = await lessonService.getLessonForChild(
        lessonId,
        childSession.childProfileId
      );
      return NextResponse.json({ lesson });
    }

    // Parent or general access
    const user = await extractUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lesson = await lessonService.getLesson(lessonId);
    return NextResponse.json({ lesson });
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
