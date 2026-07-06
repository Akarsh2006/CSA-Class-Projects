import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { getAuthUser } from '@/lib/auth';

// GET /api/projects — returns all projects
export async function GET() {
  try {
    await dbConnect();
    const projects = await Project.find()
      .select('title studentName teamName coverImage createdAt likes category userId')
      .sort({ createdAt: -1 })
      .lean();

    return Response.json(projects.map(p => ({
      _id: p._id,
      title: p.title,
      studentName: p.studentName,
      teamName: p.teamName,
      coverImage: p.coverImage,
      category: p.category,
      createdAt: p.createdAt,
      likes: p.likes || [],
      userId: p.userId,
    })));
  } catch (error) {
    console.error('Get projects error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/projects — create a project
export async function POST(request) {
  try {
    const user = getAuthUser(request);
    if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });

    await dbConnect();

    const {
      title, description, impact, coverImage, screenshots,
      category, techStack, contributors, demoUrl, youtubeUrl, githubUrl, teamName
    } = await request.json();

    if (!title || !description || !impact || !techStack || techStack.length === 0) {
      return Response.json({ error: 'Title, overview, impact, and tech stack are required' }, { status: 400 });
    }

    const project = await Project.create({
      title, description,
      impact,
      coverImage,
      screenshots: screenshots || [],
      category: category || 'Other',
      techStack,
      contributors: contributors || [],
      demoUrl: demoUrl || '',
      youtubeUrl: youtubeUrl || '',
      githubUrl: githubUrl || '',
      userId: user.userId,
      studentName: user.name,
      teamName: teamName || '',
    });

    return Response.json(project, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
