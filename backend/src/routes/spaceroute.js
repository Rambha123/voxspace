import express from 'express';
import { nanoid } from 'nanoid';
import Space from '../models/Space.js';


import Post from '../models/Post.js';
import authMiddleware from '../middleware/authentication.js';
import upload from '../middleware/upload.js'; //  multer middleware
import fs from 'fs';


const router = express.Router();



// CREATE A NEW SPACE

router.post('/create', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  const code = nanoid(6).toUpperCase();

  try {
    const space = new Space({
      name,
      code,
      createdBy: req.user.id,
      members: [req.user.id]
    });

    await space.save();
    res.status(201).json(space);
  } catch (err) {
    res.status(500).json({ message: "Error creating space" });
  }
});


// JOIN A SPACE BY CODE


router.post('/join', authMiddleware, async (req, res) => {
  const { code } = req.body;

  try {
    const space = await Space.findOne({ code });

    if (!space) {
      return res.status(404).json({ message: "Space not found" });
    }

    if (space.members.includes(req.user.id)) {
      return res.status(400).json({ message: "Already a member" });
    }

    space.members.push(req.user.id);
    await space.save();

    res.json(space);
  } catch (err) {
    res.status(500).json({ message: "Error joining space" });
  }
});

// DELETE A SPACE
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ message: 'Space not found' });

    if (space.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the creator can delete this space' });
    }

    await Post.deleteMany({ space: space._id }); // optional: delete related posts
    await Space.findByIdAndDelete(req.params.id);
    res.json({ message: 'Space deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete space' });
  }
});


// GET LOGGED-IN USER'S SPACES


router.get('/my-spaces', authMiddleware, async (req, res) => {
  try {
    const spaces = await Space.find({ members: req.user.id });
    res.json(spaces);
  } catch (err) {
    res.status(500).json({ message: "Error fetching spaces" });
  }
});



// GET A SPECIFIC SPACE BY ID

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ message: 'Space not found' });

    if (!space.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(space);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get space' });
  }
});




// GET POSTS IN A SPACE


router.get('/:id/posts', authMiddleware, async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space || !space.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const posts = await Post.find({ space: req.params.id })
      .sort({ createdAt: -1 })
      .populate('authorId', 'name');

    const formatted = posts.map(post => ({
      _id: post._id,
      content: post.content,
      type: post.type,
      createdAt: post.createdAt,
      authorName: post.authorName || post.authorId?.name || 'Unknown',
      authorId: post.authorId?._id?.toString(),
      imageUrl: post.imageUrl || null
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});


// CREATE A POST IN A SPACE 

router.post('/:id/posts', authMiddleware, upload.single('image'), async (req, res) => {

  const { content, type } = req.body;

  try {
    const space = await Space.findById(req.params.id);
    if (!space || !space.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to post in this space' });
    }

    const post = new Post({
      space: req.params.id,
      content,
      type: type === 'event' ? 'event' : 'normal',
      authorId: req.user.id,

      authorName: req.user.name,
      imageUrl: req.file ? req.file.path : null

    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {


    res.status(400).json({ message: 'Failed to create post' });
  }
});


// DELETE A POST 

router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to delete this post' });
    }

    // delete image from disk
    if (post.imageUrl) {
      fs.unlink(post.imageUrl, (err) => {
        if (err) console.error("Failed to delete image:", err);
      });
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete post' });
  }
});


export default router;

