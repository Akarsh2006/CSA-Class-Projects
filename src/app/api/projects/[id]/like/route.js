import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { getAuthUser } from '@/lib/auth';

/**
 * POST /api/projects/[id]/like
 * Toggles a like on the project for the authenticated user.
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

    await dbConnect();

    const project = await Project.findById(id);
    if (!project) {
      return Response.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const userIdStr = user.userId.toString();
    const alreadyLiked = project.likes.some(
      (likeId) => likeId.toString() === userIdStr
    );

    if (alreadyLiked) {
      // Remove the like
      project.likes = project.likes.filter(
        (likeId) => likeId.toString() !== userIdStr
      );
    } else {
      // Add the like
      project.likes.push(user.userId);
    }

    await project.save();

    return Response.json({
      likesCount: project.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    console.error('Like project error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
