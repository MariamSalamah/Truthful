import Question from '../models/Question.js';
import User from '../models/User.js';

export async function listGlobalFeed(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  let recipientIds;
  if (req.query.tag) {
    const users = await User.find({ tags: req.query.tag }).select('_id');
    recipientIds = users.map((u) => u._id);
  }

  const filter = { status: 'answered', visibility: 'public' };
  if (recipientIds) filter.recipient = { $in: recipientIds };

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort({ answeredAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('recipient', 'username displayName avatarUrl tags'),
    Question.countDocuments(filter),
  ]);

  const data = questions.map((q) => {
    const obj = q.toJSON();
    return {
      id: obj.id,
      body: obj.body,
      answer: obj.answer,
      answeredAt: obj.answeredAt,
      status: obj.status,
      recipient: {
        username: q.recipient.username,
        displayName: q.recipient.displayName,
        avatarUrl: q.recipient.avatarUrl,
        tags: q.recipient.tags,
      },
    };
  });

  return res.status(200).json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
}
