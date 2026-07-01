import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { getAuthUser } from '@/lib/auth';

/**
 * GET /api/projects
 * Returns all projects sorted by newest first.
 * Only selects fields needed for card display.
 */
export async function GET() {
  try {
    await dbConnect();

    const projects = await Project.find()
      .select('title studentName coverImage createdAt likes category')
      .sort({ createdAt: -1 })
      .lean();

    // Map to include likes count instead of full array
    const result = projects.map((project) => ({
      _id: project._id,
      title: project.title,
      studentName: project.studentName,
      coverImage: project.coverImage,
      category: project.category,
      createdAt: project.createdAt,
      likesCount: project.likes ? project.likes.length : 0,
    }));

    return Response.json({ projects: result });
  } catch (error) {
    console.error('Get projects error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Creates a new project. Requires authentication.
 */
export async function POST(request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { title, description, coverImage, screenshots, category } =
      await request.json();

    if (!title || !description) {
      return Response.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const project = await Project.create({
      title,
      description,
      coverImage,
      screenshots: screenshots || [],
      category: category || 'Other',
      studentId: user.userId,
      studentName: user.name,
    });

    return Response.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
