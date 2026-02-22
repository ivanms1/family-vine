import { NextRequest, NextResponse } from 'next/server';
import { extractUser, extractChildSession } from '@/server/auth-helpers';
import { lessonService } from '@/server/services/lesson.service';
import { lessonQuerySchema } from '@/server/validators/lesson.validators';

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = lessonQuerySchema.parse(params);

    // Check if child session exists
    const childSession = await extractChildSession(request);
    if (childSession?.childProfileId) {
      const lessons = await lessonService.getLessonsForChild(
        query,
        childSession.childProfileId
      );
      return NextResponse.json({ lessons });
    }

    // Check if parent session exists
    const user = await extractUser(request);
    const isParent = user?.role === 'PARENT';
    const lessons = await lessonService.getLessons(query, isParent);
    return NextResponse.json({ lessons });
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
