import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  space: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: link to user model
  authorName: { type: String }, // Can store name directly
  content: { type: String, required: true },
  type: { type: String, enum: ['normal', 'event'], default: 'normal' },
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
export default Post;
