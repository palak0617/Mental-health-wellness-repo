// routes/goalRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Goal = require('../models/Goal');

router.get('/', auth, async (req, res) => {
  const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(goals);
});

router.post('/', auth, async (req, res) => {
  const g = new Goal({ userId: req.user.id, title: req.body.title, note: req.body.note, dueDate: req.body.dueDate });
  await g.save();
  res.status(201).json(g);
});

router.patch('/:id', auth, async (req, res) => {
  const g = await Goal.findById(req.params.id);
  if (!g || g.userId.toString() !== req.user.id) return res.status(404).json({ message: 'Goal not found' });
  Object.assign(g, req.body);
  await g.save();
  res.json(g);
});

router.delete('/:id', auth, async (req, res) => {
  const g = await Goal.findById(req.params.id);
  if (!g || g.userId.toString() !== req.user.id) return res.status(404).json({ message: 'Goal not found' });
  await g.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;
