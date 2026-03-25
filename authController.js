import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, familyCode } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!name || !normalizedEmail || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    familyCode: familyCode?.trim() || undefined
  });
  const familyMembers = familyCode?.trim()
    ? await User.find({ familyCode: familyCode.trim(), _id: { $ne: user._id } })
    : [];

  for (const member of familyMembers) {
    if (!member.familyMembers.some((id) => id.equals(user._id))) {
      member.familyMembers.push(user._id);
      await member.save();
    }
  }

  user.familyMembers = familyMembers.map((member) => member._id);
  await user.save();

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    familyCode: user.familyCode,
    token: generateToken(user._id)
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    familyCode: user.familyCode,
    notifications: user.notifications,
    token: generateToken(user._id)
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const family = await User.find({ familyCode: req.user.familyCode }).select('name email');
  res.json({ ...req.user.toObject(), family });
});
