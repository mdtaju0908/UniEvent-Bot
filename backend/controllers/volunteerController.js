const VolunteerDuty = require('../models/VolunteerDuty');

exports.getMyDuties = async (req, res) => {
  try {
    const duties = await VolunteerDuty.find({ volunteerId: req.user.id }).populate('eventId', 'title date venue');
    res.json(duties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getDuties = async (req, res) => {
  try {
    const duties = await VolunteerDuty.find({ volunteerId: req.params.id }).populate('eventId');
    res.json(duties);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
