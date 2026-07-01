import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { getAuthUser } from '@/lib/auth';

/**
 * POST /api/projects/[id]/comments
 * Adds a comment to the project. Requires authentication.
 */
export async function POST(request, { params }) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return Response.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const project = await Project.findById(id);
    if (!project) {
      return Response.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    project.comments.push({
      user: user.userId,
      userName: user.name,
      text: text.trim(),
    });

    await project.save();

    return Response.json({ comments: project.comments }, { status: 201 });
  } catch (error) {
    console.error('Add comment error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
