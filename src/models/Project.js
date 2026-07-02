import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const ContributorSchema = new mongoose.Schema({
  name: String,
  role: String,
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'] },
  description: { type: String, required: [true, 'Description is required'] },
  impact: { type: String, default: '' },
  studentName: { type: String, required: [true, 'Student name is required'] },
  teamName: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverImage: { type: String },
  screenshots: { type: [String], default: [] },
  category: { type: String, default: 'Other' },
  techStack: { type: [String], default: [] },
  contributors: { type: [ContributorSchema], default: [] },
  demoUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  likes: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
  comments: { type: [CommentSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
export default Project;
