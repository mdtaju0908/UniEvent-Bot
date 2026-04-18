const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique code for non-admin accounts
    let uniqueCode;
    if (role !== 'admin') {
      const prefix = 'UE-';
      // Ensure uniqueness by checking collisions
      for (let attempts = 0; attempts < 10; attempts++) {
        const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 hex chars
        const candidate = `${prefix}${randomPart}`;
        const exists = await User.findOne({ uniqueCode: candidate }).lean();
        if (!exists) {
          uniqueCode = candidate;
          break;
        }
      }
      if (!uniqueCode) {
        return res.status(500).json({ message: 'Failed to generate unique code. Please try again.' });
      }
    }

    // Approval logic:
    // - Only 'user' role is auto-approved
    // - 'admin', 'volunteer', 'faculty' are ALWAYS pending (must be approved by Owner)
    const isAutoApproved = role === 'user';
    const approvalStatus = isAutoApproved ? 'approved' : 'pending';

    user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role, 
      uniqueCode,
      approvalStatus
    });
    await user.save();

    // If account is pending, still issue a token so they can auto-login once approved
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    if (approvalStatus === 'pending') {
      return res.status(201).json({ 
        message: 'Account created. Awaiting Owner approval.',
        token, // Send token even if pending
        user: { 
          id: user._id, 
          name: user.name, 
          role: user.role, 
          approvalStatus: user.approvalStatus, 
          createdAt: user.createdAt,
          uniqueCode: user.uniqueCode
        }
      });
    }

    res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role, uniqueCode: user.uniqueCode, createdAt: user.createdAt, approvalStatus: 'approved' } });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Strict Role-Based Access Control
    // Owner is always allowed (Self-healing if data corrupted)
    if (user.role === 'owner') {
       if (user.approvalStatus !== 'approved') {
          user.approvalStatus = 'approved';
          await user.save();
       }
    } else {
       // Check approval status for ALL other roles
       if (user.approvalStatus !== 'approved') {
         return res.status(403).json({ message: `Account is ${user.approvalStatus}. Please contact support.` });
       }
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role,
        isApproved: user.isApproved,
        approvalStatus: user.approvalStatus,
        createdAt: user.createdAt
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Check Status (Public/Lightweight)
exports.checkStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('approvalStatus role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ status: user.approvalStatus, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Reset your password',
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
