import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    // Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;
    
    // Check if user exists
    let user = await User.findOne({ email }); // Find by email in case they registered manually
    
    if (!user) {
      // Create new user (using role from frontend if provided)
      user = await User.create({
        googleId: sub,
        email,
        name,
        picture,
        role: req.body.role || 'Traveler' 
      });
    } else if (!user.googleId) {
      // Link google ID if email existed
      user.googleId = sub;
      await user.save();
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    // Create session JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // If doctor, load verification status
    let verificationStatus = null;
    if (user.role === 'Doctor' && user.doctorProfile) {
      const doc = await Doctor.findById(user.doctorProfile);
      verificationStatus = doc?.verificationStatus || 'unverified';
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
        verificationStatus
      }
    });

  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.status(401).json({ success: false, message: 'Authentication failed: ' + error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Traveler'
    });

    // Auto-create Doctor profile if registering as Doctor
    if (user.role === 'Doctor') {
      try {
        const nameParts = name.trim().split(/\s+/).filter(Boolean);
        const initials = nameParts.map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DR';
        const doctorProfile = await Doctor.create({
          name,
          userId: user._id,
          initials,
          languages: ['English'],
        });
        user.doctorProfile = doctorProfile._id;
        await user.save();
      } catch (docError) {
        console.error('Failed to create doctor profile:', docError);
        // Rollback user creation if doctor profile fails
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({ success: false, message: 'Failed to create doctor profile: ' + docError.message });
      }
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, verificationStatus: 'unverified' }
    });
  } catch (error) {
    console.error('Register error:', error.message, error.stack);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: `Database duplicate key error: ${error.message}` });
    }
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Please login using Google' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // If doctor, load verification status
    let verificationStatus = null;
    if (user.role === 'Doctor' && user.doctorProfile) {
      const doc = await Doctor.findById(user.doctorProfile);
      verificationStatus = doc?.verificationStatus || 'unverified';
    }

    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, verificationStatus }
    });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
