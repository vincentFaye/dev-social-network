const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const User = require('../../models/User')

// @route    POST api/posts
// @desc     Create post
// @access   Private
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    const user = await User.findById(req.user.id).select('-password')
    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    })
    const post = await newPost.save()
    res.json(post)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  } 
})

// @route    GET api/posts
// @desc     Fetch all posts
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 })
    res.json(posts)
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Server Error')
  }
})

// @route    GET api/posts/:post_id
// @desc     Fetch a post
// @access   Private
router.get('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id)
    if (!post) {
      return res.status(404).json({ msg: 'No post found' })
    }
    res.json(post)
  } catch (err) {
    console.log(err.message)
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No post found' })
    }
    res.status(500).send('Server Error')
  }
})

// @route    DELETE api/posts/:post_id
// @desc     Delete a post
// @access   Private
router.delete('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id)

    if (!post) {
      return res.status(404).json({ msg: 'No post found' })
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized'})
    }
    await post.remove()
    res.json({ msg: 'Post removed' })
  } catch (err) {
    console.log(err.message)
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No post found' })
    }
    res.status(500).send('Server Error')
  }
})

// @route    PUT api/posts/like/:post_id
// @desc     Like a post
// @access   Private
router.put('/like/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id)
    
    if (!post) {
      return res.status(404).json({ msg: 'No post found' })
    }

    if (post.likes.filter(like => like._id.toString() === req.user.id).length > 0) {
      return res.status(400).json({ msg: 'post already liked' })
    }

    post.likes.unshift(req.user.id)
    await post.save()
    res.json(post.likes)
  } catch (err) {
    console.log(err.message)
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No post found' })
    }
    res.status(500).send('Server Error')
  }
})

// @route    PUT api/posts/unlike/:post_id
// @desc     Unlike a post
// @access   Private
router.put('/unlike/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id)
    
    if (!post) {
      return res.status(404).json({ msg: 'No post found' })
    }
    // check if post has been liked
    if (post.likes.filter(like => like._id.toString() === req.user.id).length === 0) {
      return res.status(400).json({ msg: 'post has not been liked yet' })
    }

    // check like index to remove
    const removeIndex = post.likes.map(like => like._id.toString()).indexOf(req.user.id)
    post.likes.splice(removeIndex, 1)
    await post.save()
    res.json(post.likes)
  } catch (err) {
    console.log(err.message)
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No post found' })
    }
    res.status(500).send('Server Error')
  }
})

// @route    POST api/posts/comment/:id
// @desc     Create a comment
// @access   Private
router.post('/comment/:id', [auth, [
      check('text', 'Text is required').not().isEmpty()
    ]
  ], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    const user = await User.findById(req.user.id).select('-password')
    const post = await Post.findById(req.params.id)

    const newComment = {
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    }

    post.comments.unshift(newComment)
    
    await post.save()
    
    res.json(post.comments)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete a comment
// @access   Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    
    // Pull out comment
    const comment = post.comments.find(comment => comment.id === req.params.comment_id)
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exists' })
    }
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' })
    }
    const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id)
    post.comments.splice(removeIndex, 1)
    await post.save()
    res.json(post.comments)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
