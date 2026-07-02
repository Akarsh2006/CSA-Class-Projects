import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { getAuthUser } from '@/lib/auth';

// GET /api/projects/[id]
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    const project = await Project.findById(id).lean();
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });
    return Response.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/projects/[id]
export async function PUT(request, { params }) {
  try {
    const user = getAuthUser(request);
    if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const project = await Project.findById(id);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    if (project.userId.toString() !== user.userId.toString()) {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updates = await request.json();
    const allowed = ['title', 'description', 'impact', 'coverImage', 'screenshots', 'category', 'techStack', 'contributors', 'demoUrl', 'githubUrl', 'teamName'];
    const filtered = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) filtered[key] = updates[key];
    }

    const updated = await Project.findByIdAndUpdate(id, filtered, { new: true, runValidators: true });
    return Response.json(updated);
  } catch (error) {
    console.error('Update project error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/projects/[id]
export async function DELETE(request, { params }) {
  try {
    const user = getAuthUser(request);
    if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const project = await Project.findById(id);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    if (project.userId.toString() !== user.userId.toString()) {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    await Project.findByIdAndDelete(id);
    return Response.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
