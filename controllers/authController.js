import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export async function signup(req, res) {
  const { username, email, password, displayName } = req.body;
  try {
    const user = new User({ username, email, passwordHash: password, displayName });
    await user.save();
    const token = signToken(user._id);
    return res.status(201).json({ token, user: user.toJSON() });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: { message: 'Username or email already exists' } });
    }
    throw err;
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: { message: 'Invalid credentials' } });
  }
  const token = signToken(user._id);
  return res.status(200).json({ token, user: user.toJSON() });
}

export async function me(req, res) {
  return res.status(200).json(req.user.toJSON());
}
