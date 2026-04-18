const Form = require('../models/Form');
const User = require('../models/User');
const FormResponse = require('../models/FormResponse');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Create a new form
exports.createForm = async (req, res) => {
  try {
    const { title, description, fields, targetRole } = req.body;
    const form = new Form({
      title,
      description,
      fields,
      targetRole: targetRole || 'user',
      createdBy: req.user.id
    });
    await form.save();
    res.status(201).json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update an existing form
exports.updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, fields, targetRole } = req.body;

    const form = await Form.findById(id);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    // Admin Isolation: Check if this admin created the form
    if (form.createdBy && form.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this form' });
    }

    form.title = title;
    form.description = description;
    form.fields = fields;
    form.targetRole = targetRole;

    await form.save();
    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all forms (for admin)
exports.getForms = async (req, res) => {
  try {
    // Admin Isolation: Only show forms created by this admin
    const forms = await Form.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get single form by ID (public)
exports.getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Submit form and create user
exports.submitForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const { responses } = req.body; // responses is an object { fieldLabel: value }

    // Basic validation
    if (!responses) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the form
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    // Extract Name and Email from responses based on systemRole or fallback to label matching
    let name = null;
    let email = null;

    form.fields.forEach(field => {
      if (field.systemRole === 'name') name = responses[field.label];
      if (field.systemRole === 'email') email = responses[field.label];
    });

    // Fallback if not mapped
    if (!name) {
      const nameField = form.fields.find(f => f.label.toLowerCase().includes('name'));
      if (nameField) name = responses[nameField.label];
    }
    if (!email) {
      const emailField = form.fields.find(f => f.label.toLowerCase().includes('email'));
      if (emailField) email = responses[emailField.label];
    }

    if (!name || !email) {
      return res.status(400).json({ message: 'Form must contain Name and Email fields properly mapped or labeled.' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Auto-generate secure password
    const generatedPassword = crypto.randomBytes(8).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(generatedPassword, salt);

    // Generate unique code (Logic copied from authController)
    let uniqueCode;
    const prefix = 'UE-';
    for (let attempts = 0; attempts < 10; attempts++) {
      const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
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

    // Determine role from form setting
    let role = form.targetRole || 'user';

    // Create user
    user = new User({
      name,
      email,
      password: hashedPassword,
      role, 
      uniqueCode,
      formResponses: responses, 
      createdBy: form.createdBy, 
      approvalStatus: role === 'user' ? 'approved' : 'pending'
    });

    await user.save();

    // Create FormResponse
    const formResponse = new FormResponse({
      formId: form._id,
      userId: user._id,
      responses,
      uniqueCode
    });
    await formResponse.save();

    // Generate Token (Optional, if we want them to be logged in automatically)
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role, 
        uniqueCode: user.uniqueCode 
      },
      message: 'Registration successful' 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get submissions for a form
exports.getFormSubmissions = async (req, res) => {
  try {
    const { formId } = req.params;
    const submissions = await FormResponse.find({ formId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete form and all its submissions
exports.deleteForm = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if form exists
    const form = await Form.findById(id);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    // Admin Isolation: Check if this admin created the form
    if (form.createdBy && form.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this form' });
    }

    // Delete all submissions associated with this form
    await FormResponse.deleteMany({ formId: id });

    // Delete the form itself
    await Form.findByIdAndDelete(id);

    res.json({ message: 'Form and related submissions deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
