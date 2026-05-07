import User from '../models/User.js';

export async function getPublicProfile(req, res) {
  const user = await User.findOne({ username: req.params.username })
    .select('-email -passwordHash');
  if (!user) return res.status(404).json({ error: { message: 'User not found' } });
  return res.status(200).json(user.toJSON());
}

export async function updateMe(req, res) {
  const allowed = ['displayName', 'bio', 'avatarUrl', 'acceptingQuestions', 'tags'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  return res.status(200).json(user.toJSON());
}
