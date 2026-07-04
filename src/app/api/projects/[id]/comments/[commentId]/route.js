import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { getAuthUser } from '@/lib/auth';

/**
 * DELETE /api/projects/[id]/comments/[commentId]
 * Deletes a comment from the project. Requires authentication and author ownership.
 */
export async function DELETE(request, { params }) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id, commentId } = await params;
    await dbConnect();

    const project = await Project.findById(id);
    if (!project) {
      return Response.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const commentIndex = project.comments.findIndex(c => c._id.toString() === commentId);
    if (commentIndex === -1) {
      return Response.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const comment = project.comments[commentIndex];
    if (comment.user.toString() !== (user.userId || user._id)?.toString()) {
      return Response.json(
        { error: 'Not authorized to delete this comment' },
        { status: 403 }
      );
    }

    project.comments.splice(commentIndex, 1);
    await project.save();

    return Response.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
