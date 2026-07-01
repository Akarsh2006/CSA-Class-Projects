import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { getAuthUser } from '@/lib/auth';

/**
 * GET /api/projects/[id]
 * Returns full project data with populated comments.
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    await dbConnect();

    const project = await Project.findById(id).lean();

    if (!project) {
      return Response.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return Response.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id]
 * Updates a project. Only the owner can update.
 */
export async function PUT(request, { params }) {
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

    // Verify ownership
    if (project.studentId.toString() !== user.userId.toString()) {
      return Response.json(
        { error: 'Not authorized to update this project' },
        { status: 403 }
      );
    }

    const updates = await request.json();

    // Only allow updating specific fields
    const allowedFields = ['title', 'description', 'coverImage', 'screenshots', 'category'];
    const filteredUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    return Response.json({ project: updatedProject });
  } catch (error) {
    console.error('Update project error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Deletes a project. Only the owner can delete.
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

    const { id } = await params;

    await dbConnect();

    const project = await Project.findById(id);
    if (!project) {
      return Response.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (project.studentId.toString() !== user.userId.toString()) {
      return Response.json(
        { error: 'Not authorized to delete this project' },
        { status: 403 }
      );
    }

    await Project.findByIdAndDelete(id);

    return Response.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
