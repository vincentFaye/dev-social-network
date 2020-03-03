const express = require('express')
const request = require('request')
const config = require('config')
const router = express.Router()
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const Post = require('../../models/Post')
const { check, validationResult } = require('express-validator')

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar'])
    
    if (!profile) {
      res.status(400).json({ msg: 'There is no profile for this user' })
    }
    res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// @route    POST api/profile/me
// @desc     Create or Update user profile
// @access   Private
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty) {
    res.status(400).json({ errors: errors.array() })
  }
  const {
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
  } = req.body

  // Build profile Object
  const profileFields = {}
  profileFields.user = req.user.id
  if (company) profileFields.company = company
  if (website) profileFields.website = website
  if (location) profileFields.location = location
  if (bio) profileFields.bio = bio
  if (status) profileFields.status = status
  if (githubusername) profileFields.githubusername = githubusername
  if (skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim())
  }
  // Build social object
  profileFields.social = {}
  if (youtube) profileFields.social.youtube = youtube
  if (twitter) profileFields.social.twitter = twitter
  if (facebook) profileFields.social.facebook = facebook
  if (linkedin) profileFields.social.linkedin = linkedin
  if (instagram) profileFields.social.instagram = instagram
  
  try {
    let profile = await Profile.findOne({ user: req.user.id })
    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
      console.log('updating...')
      return res.json(profile)
    }
    // create
    profile = new Profile(profileFields)
    await profile.save()
    res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// @route    GET api/profile
// @desc     Fetch all profiles
// @access   Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])
    res.json(profiles)
  } catch (err) {
    console.error(err.message)
    resizeTo.status(500).send('Server Error')
  }
})

// @route    GET api/profile
// @desc     Fetch profile by user id
// @access   Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id}).populate('user', ['name', 'avatar'])
    if (!profile) return res.status(400).json({ msg: 'Profile not found' })
    res.json(profile)
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' })
    }
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// @route    DELETE api/profile
// @desc     delete profilem user & posts
// @access   Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove User Posts
    await Post.deleteMany({ user: req.user.id })
    // Remove Profile
    await Profile.findOneAndRemove({user: req.user.id})
    //  Remove User
    await User.findOneAndRemove({_id: req.user.id})
    res.json({ msg: 'User deleted' })
  } catch (err) {
    console.error(err.message)
    resizeTo.status(500).send('Server Error')
  }
})

// @route    PUT api/profile/experience
// @desc     add profile experience
// @access   Private
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty) {
    return res.status(400).json({ errors: errors.array() })
  }
  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  } = req.body

  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }
  try {
    const profile = await Profile.findOne({user: req.user.id})
    profile.experience.unshift(newExp)
    await profile.save()
    res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// @route    DELETE api/profile/experience/:exp_id
// @desc     delete experience
// @access   Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({user: req.user.id})
    // Get remove index
    const removeIndex = profile.experience.map(exp => exp._id).indexOf(req.params.exp_id)
    console.log(removeIndex)
    profile.experience.splice(removeIndex, 1)
    await profile.save()
    res.json(profile)
  } catch (err) {
    res.status(500).send('Server Error')
  }
})

// @route    PUT api/profile/education
// @desc     add profile education
// @access   Private
router.put('/education', [auth, [
  check('school', 'School is required').not().isEmpty(),
  check('degree', 'Degree is required').not().isEmpty(),
  check('fieldofstudy', 'Field of study is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty()
]
], async (req, res) => {
const errors = validationResult(req)
if (!errors.isEmpty) {
  return res.status(400).json({ errors: errors.array() })
}
const {
  school,
  degree,
  fieldofstudy,
  from,
  to,
  current,
  description
} = req.body

const newEdu = {
  school,
  degree,
  fieldofstudy,
  from,
  to,
  current,
  description
}
try {
  const profile = await Profile.findOne({ user: req.user.id })
  profile.education.unshift(newEdu)
  await profile.save()
  res.json(profile)
} catch (err) {
  console.error(err.message)
  res.status(500).send('Server Error')
}
})

// @route    DELETE api/profile/education/:edu_id
// @desc     delete education
// @access   Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({user: req.user.id})
    // Get remove index
    const removeIndex = profile.education.map(edu => edu._id).indexOf(req.params.edu_id)
    console.log(removeIndex)
    profile.education.splice(removeIndex, 1)
    await profile.save()
    res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// @route    GET api/profile/github/:username
// @desc     Get user repo from github
// @access   Public
router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created: asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    }

    request(options, (error, response, body) => {
      if (error) console.error(error)
      
      if (response.statusCode !== 200) {
        res.status(404).json({ msg: 'No Github profile found' })
      }

      res.json(JSON.parse(body))
    })

  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})
module.exports = router
