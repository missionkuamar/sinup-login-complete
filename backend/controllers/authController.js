import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 🔐 JWT Token Generator
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// ✅ Register Controller
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // 🔍 Basic input validation
  if (!name || !email || !password) {
    console.warn('[REGISTER] Missing required fields');
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    // 🔄 Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn('[REGISTER] User already exists:', email);
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    // 🔐 Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🧾 Create and save the new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log('[REGISTER] New user registered:', user.email);

    res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(user._id),
    });

  } catch (err) {
    console.error('[REGISTER] Server error:', err);
    res.status(500).json({ message: 'Something went wrong during registration' });
  }
};

// ✅ Login Controller
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // 🔍 Validate input
  if (!email || !password) {
    console.warn('[LOGIN] Missing email or password');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // 🔎 Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.warn('[LOGIN] No user found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' }); // Avoid hinting whether email exists
    }

    // 🔐 Compare hashed passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn('[LOGIN] Incorrect password for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('[LOGIN] User logged in:', email);

    res.status(200).json({
      message: 'Login successful',
      token: generateToken(user._id),
    });

  } catch (err) {
    console.error('[LOGIN] Server error:', err);
    res.status(500).json({ message: 'Something went wrong during login' });
  }
};

// ✅ Get Profile Controller (Protected)
export const getProfile = async (req, res) => {
  try {
    // 🧾 Get user by ID (set by auth middleware)
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.warn('[PROFILE] User not found for ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('[PROFILE] Returning profile for:', user.email);

    res.status(200).json(user);
  } catch (err) {
    console.error('[PROFILE] Server error:', err);
    res.status(500).json({ message: 'Something went wrong fetching profile' });
  }
};
