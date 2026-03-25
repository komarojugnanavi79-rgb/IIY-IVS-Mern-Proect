import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import HealthMetric from '../models/HealthMetric.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  Object.assign(user, req.body);
  await user.save();
  res.json(user);
});

export const savePushSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.pushSubscription = req.body;
  await user.save();
  res.json({ message: 'Subscription saved' });
});

export const addHealthMetric = asyncHandler(async (req, res) => {
  const metric = await HealthMetric.create({
    ...req.body,
    user: req.user._id
  });
  res.status(201).json(metric);
});

export const getHealthMetrics = asyncHandler(async (req, res) => {
  const metrics = await HealthMetric.find({ user: req.user._id }).sort({ recordedAt: -1 }).limit(20);
  res.json(metrics);
});

