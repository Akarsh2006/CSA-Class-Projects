require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("No MONGODB_URI found");
  process.exit(1);
}

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  impact: { type: String, required: true },
  studentName: { type: String, required: true },
  teamName: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverImage: { type: String },
  screenshots: { type: [String], default: [] },
  category: { type: String, default: 'Other' },
  techStack: { type: [String], default: [] },
  demoUrl: { type: String, default: '' },
  youtubeUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { strict: false }); // Disable strict to get all fields

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

async function test() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    const projects = await Project.find().limit(2).lean();
    console.log(projects);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
