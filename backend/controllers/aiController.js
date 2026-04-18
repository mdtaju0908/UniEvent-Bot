const OpenAI = require('openai');
const Event = require('../models/Event');
const VolunteerDuty = require('../models/VolunteerDuty');
const User = require('../models/User');

let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

exports.chat = async (req, res) => {
  try {
    const { message, uniqueCode } = req.body;
    
    let contextData = "";
    let systemRoleInstruction = "";
    let userRole = 'guest';

    // 1) Unique code flow (no JWT required)
    if (uniqueCode) {
      const owner = await User.findOne({ uniqueCode }).select('_id name role');
      if (!owner) {
        return res.json({ reply: "Sorry, that unique code looks invalid. Please double-check and try again." });
      }
      userRole = owner.role;

      if (owner.role === 'volunteer') {
        const duties = await VolunteerDuty.find({ volunteerId: owner._id })
          .populate('eventId', 'title venue date description');
        contextData = `
          Volunteer: ${JSON.stringify({ id: owner._id, name: owner.name })}
          Your Assigned Duties: ${JSON.stringify(duties)}
        `;
        systemRoleInstruction = "You are a Volunteer Assistant. ONLY use the volunteer's own duties and event info to answer. Do NOT reveal anything about other volunteers or users.";
      } else {
        const events = await Event.find({ status: { $ne: 'Completed' } })
          .select('title date venue description category');
        contextData = `
          User: ${JSON.stringify({ id: owner._id, name: owner.name })}
          Upcoming Events: ${JSON.stringify(events)}
        `;
        systemRoleInstruction = "You are a Student/Attendee Guide. Provide public event information. Do NOT reveal internal data.";
      }
    } else {
      // 2) Existing JWT-based flow
      const userId = req.user ? req.user.id : null;
      userRole = req.user ? req.user.role : 'guest';

      if (!userId) {
        return res.status(401).json({ reply: "Please log in to chat with the AI assistant." });
      }

      if (userRole === 'admin') {
        // Admin Isolation: Only show data created by this admin or assigned to this admin
        const events = await Event.find({ createdBy: userId }).select('title date venue status volunteers');
        // Volunteers are ASSIGNED to admin, not created by admin (usually)
        const volunteers = await User.find({ role: 'volunteer', assignedAdmin: userId }).select('name email');
        const duties = await VolunteerDuty.find({ createdBy: userId })
          .populate('eventId', 'title')
          .populate('volunteerId', 'name');
        
        // Also fetch forms created by admin
        const Form = require('../models/Form');
        const forms = await Form.find({ createdBy: userId }).select('title description targetRole');

        contextData = `
          Events: ${JSON.stringify(events)}
          Volunteers Assigned to You: ${JSON.stringify(volunteers)}
          Duties You Assigned: ${JSON.stringify(duties)}
          Forms You Created: ${JSON.stringify(forms)}
        `;
        systemRoleInstruction = "You are an Admin Assistant. You have access to YOUR events, forms, volunteers, and duty assignments. Assist the admin in managing these resources.";
      } else if (userRole === 'volunteer') {
        // Fetch volunteer's assigned admin
        const volunteer = await User.findById(userId);
        const assignedAdminId = volunteer.assignedAdmin;

        const duties = await VolunteerDuty.find({ volunteerId: userId }).populate('eventId', 'title venue date');
        
        // Fetch events created by their assigned admin (if any), otherwise public events?
        // Requirement: "Volunteer sees assigned events & duties"
        // We'll show duties (which include event info) and maybe events created by their admin.
        let events = [];
        if (assignedAdminId) {
           events = await Event.find({ createdBy: assignedAdminId }).select('title date venue status description');
        } else {
           // Fallback if not assigned yet
           events = await Event.find({ status: { $ne: 'Completed' } }).select('title date venue description');
        }

        contextData = `
          Your Assigned Duties: ${JSON.stringify(duties)}
          Events (from your Admin): ${JSON.stringify(events)}
          Your Assigned Admin ID: ${assignedAdminId || 'None'}
        `;
        systemRoleInstruction = "You are a Volunteer Assistant. Focus on helping the volunteer with their assigned duties and events from their assigned Admin. Do NOT mention other volunteers.";
      } else if (userRole === 'owner') {
         // Owner sees high-level stats or everything?
         // Requirement: "Answer based on system-level data"
         const admins = await User.find({ role: 'admin' }).select('name email approvalStatus');
         const eventCount = await Event.countDocuments();
         const userCount = await User.countDocuments();
         const volunteerCount = await User.countDocuments({ role: 'volunteer' });
         
         contextData = `
           Total Events: ${eventCount}
           Total Users: ${userCount}
           Total Volunteers: ${volunteerCount}
           Admins: ${JSON.stringify(admins)}
         `;
         systemRoleInstruction = "You are the Owner's Assistant. Provide system-level overview and admin status.";
      } else {
        const events = await Event.find({ status: { $ne: 'Completed' } }).select('title date venue description category');
        contextData = `
          Upcoming Events: ${JSON.stringify(events)}
        `;
        systemRoleInstruction = "You are a Student/Attendee Guide. Help users find events they might be interested in. Provide details about venues and times. Do NOT reveal any internal admin or volunteer data.";
      }
    }

    // Fallback if no OpenAI Key
    if (!openai) {
      return res.json({ 
        reply: `[DEMO MODE - No OpenAI Key] 
        Role: ${userRole}
        I have access to ${contextData.length} chars of data.
        Please configure OPENAI_API_KEY in .env for real responses.` 
      });
    }

    const systemPrompt = `
      ${systemRoleInstruction}
      
      CONTEXT DATA:
      ${contextData}
      
      INSTRUCTIONS:
      1. Answer the user's question based STRICTLY on the provided CONTEXT DATA.
      2. If the answer is not in the data, politely say you don't have that information.
      3. Keep responses concise and helpful.
      4. Current Date: ${new Date().toDateString()}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: response.choices[0].message.content });

  } catch (err) {
    console.error('AI Chat Error:', err);
    // Graceful fallback if quota or other error
    const isQuota = err?.status === 429 || /quota|rate/i.test(err?.message || '');
    const fallback = isQuota 
      ? "Our AI service is currently busy. Please try again soon." 
      : "Sorry, I encountered an error processing your request.";
    res.status(200).json({ reply: fallback });
  }
};
