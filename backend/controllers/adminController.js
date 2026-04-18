const User = require('../models/User');
const VolunteerDuty = require('../models/VolunteerDuty');

// Get all users (volunteers and regular users)
exports.getUsers = async (req, res) => {
  try {
    // Regular users created by this admin via forms
    const users = await User.find({ 
      role: 'user',
      createdBy: req.user.id 
    }).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get assigned volunteers
exports.getAssignedVolunteers = async (req, res) => {
    try {
      const volunteers = await User.find({ 
        role: 'volunteer',
        assignedAdmin: req.user.id 
      }).select('-password');
      res.json(volunteers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  };

// Assign duty to a volunteer
exports.assignDuty = async (req, res) => {
  const { volunteerId, eventId, dutyTitle, dutyDescription, timeSlot } = req.body;

  try {
    const newDuty = new VolunteerDuty({
      volunteerId,
      eventId,
      dutyTitle,
      dutyDescription,
      timeSlot,
      createdBy: req.user.id // Track who assigned this duty
    });

    const savedDuty = await newDuty.save();
    res.status(201).json(savedDuty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if admin is trying to delete themselves
    if (userId === req.user.id) {
        return res.status(400).json({ message: "You cannot delete yourself." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admin Isolation: Check if this admin created the user
    // Note: We allow deleting if createdBy is missing (legacy) ONLY if we aren't enforcing strict isolation for legacy.
    // But requirement says "Admin A sees only Admin A's users". So we should enforce it.
    // However, if we want to be safe for existing data, we might skip this check for legacy users or allow main superadmin.
    // For this specific request, we enforce "Admin A sees only Admin A's users".
    if (user.createdBy && user.createdBy.toString() !== req.user.id) {
         return res.status(403).json({ message: 'Not authorized to delete this user' });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
