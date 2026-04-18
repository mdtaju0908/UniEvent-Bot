const User = require('../models/User');
const nodemailer = require('nodemailer');

// Helper to send email
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send failed:', error);
  }
};

// Get all login accounts (owner only) with per-admin analytics
exports.getAccounts = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'owner' } })
      .select('name email role isApproved approvalStatus createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Attach analytics for admins: number of forms & events created & volunteers assigned
    const Event = require('../models/Event');
    const Form = require('../models/Form');

    const enriched = await Promise.all(users.map(async (u) => {
      if (u.role === 'admin') {
        const [eventsCount, formsCount, volunteersAssigned] = await Promise.all([
          Event.countDocuments({ createdBy: u._id }),
          Form.countDocuments({ createdBy: u._id }),
          User.countDocuments({ assignedAdmin: u._id })
        ]);
        return { ...u, eventsCount, formsCount, volunteersAssigned };
      }
      return u;
    }));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Protect Owner
    if (user.role === 'owner') {
      return res.status(403).json({ message: 'Cannot delete the Owner account.' });
    }

    // If deleting an Admin, unassign their volunteers
    if (user.role === 'admin') {
       await User.updateMany(
         { assignedAdmin: user._id },
         { $set: { assignedAdmin: null, assignedBy: null, assignedAt: null } }
       );
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update Account Status (Approve, Reject, Block)
exports.updateAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // pending, approved, rejected, blocked

    if (!['pending', 'approved', 'rejected', 'blocked'].includes(status)) {
       return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.role === 'owner') {
       return res.status(403).json({ message: 'Cannot change Owner status.' });
    }

    user.approvalStatus = status;
    // user.isApproved = (status === 'approved'); // Deprecated but kept for compatibility if needed, but we removed it from schema
    // user.approvedByOwner = (status === 'approved'); // Deprecated
    
    await user.save();

    // Send email notification if approved
    if (status === 'approved') {
        await sendEmail(
            user.email, 
            'Account Approved - UniEvent',
            `<p>Hello ${user.name},</p>
             <p>Your account has been approved. You can now login.</p>`
        );
    }

    res.json({ message: `Account status updated to ${status}`, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Assign Volunteer to Admin
exports.assignVolunteer = async (req, res) => {
  try {
    const { volunteerId, adminId } = req.body;
    
    const volunteer = await User.findById(volunteerId);
    if (!volunteer || volunteer.role !== 'volunteer') {
       return res.status(400).json({ message: 'Invalid volunteer' });
    }

    // If adminId is null, unassign
    if (!adminId) {
       volunteer.assignedAdmin = null;
       volunteer.assignedBy = req.user.id;
       volunteer.assignedAt = new Date();
       await volunteer.save();
       return res.json({ message: 'Volunteer unassigned successfully', volunteer });
    }

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
       return res.status(400).json({ message: 'Invalid admin' });
    }

    volunteer.assignedAdmin = admin._id;
    volunteer.assignedBy = req.user.id;
    volunteer.assignedAt = new Date();
    await volunteer.save();

    res.json({ message: `Volunteer assigned to ${admin.name}`, volunteer });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
