import Question from '../models/Question.js';
import User from '../models/User.js';

function paginate(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

export async function sendQuestion(req, res) {
  const recipient = await User.findOne({ username: req.params.username });
  if (!recipient) return res.status(404).json({ error: { message: 'User not found' } });
  if (!recipient.acceptingQuestions)
    return res.status(403).json({ error: { message: 'User is not accepting questions' } });

  const question = await Question.create({ recipient: recipient._id, body: req.body.body });
  return res.status(201).json({
    id: question._id,
    body: question.body,
    answer: null,
    status: question.status,
    createdAt: question.createdAt,
  });
}

export async function listInbox(req, res) {
  const { page, limit, skip } = paginate(req.query);
  const filter = { recipient: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [data, total] = await Promise.all([
    Question.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Question.countDocuments(filter),
  ]);

  return res.status(200).json({
    data: data.map((q) => q.toJSON()),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function answerQuestion(req, res) {
  const question = await Question.findById(req.params.id);
  if (!question || !question.recipient.equals(req.user._id))
    return res.status(404).json({ error: { message: 'Question not found' } });

  question.answer = req.body.answer;
  question.answeredAt = new Date();
  question.status = 'answered';
  if (req.body.visibility) question.visibility = req.body.visibility;
  await question.save();
  return res.status(200).json(question.toJSON());
}

export async function updateQuestion(req, res) {
  const question = await Question.findById(req.params.id);
  if (!question || !question.recipient.equals(req.user._id))
    return res.status(404).json({ error: { message: 'Question not found' } });

  if (req.body.status !== undefined) question.status = req.body.status;
  if (req.body.answer !== undefined) {
    question.answer = req.body.answer;
    question.answeredAt = new Date();
    question.status = 'answered';
  }
  if (req.body.visibility !== undefined) question.visibility = req.body.visibility;
  await question.save();
  return res.status(200).json(question.toJSON());
}

export async function removeQuestion(req, res) {
  const question = await Question.findById(req.params.id);
  if (!question || !question.recipient.equals(req.user._id))
    return res.status(404).json({ error: { message: 'Question not found' } });

  await question.deleteOne();
  return res.status(200).json({ message: 'Deleted' });
}

export async function listPublicFeed(req, res) {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(404).json({ error: { message: 'User not found' } });

  const { page, limit, skip } = paginate(req.query);
  const filter = { recipient: user._id, status: 'answered', visibility: 'public' };

  const [data, total] = await Promise.all([
    Question.find(filter).sort({ answeredAt: -1 }).skip(skip).limit(limit),
    Question.countDocuments(filter),
  ]);

  return res.status(200).json({
    data: data.map((q) => {
      const obj = q.toJSON();
      delete obj.recipient;
      return obj;
    }),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
