const Event = require('../models/Event');

exports.createEvent = async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      createdBy: req.user.id
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id });
    res.json(events);
  } catch (err) {
    console.error('Error in getMyEvents:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    console.error('Error in getEvents:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.createdBy && event.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.createdBy && event.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
