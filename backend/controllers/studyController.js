const StudyEntry = require('../models/StudyEntry');

// Helper: normalize a date to midnight UTC for consistent daily keying
function toMidnightUTC(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// POST /api/study/log  — Submit or update today's study entry
exports.logStudy = async (req, res) => {
  try {
    const { userEmail, topic, duration } = req.body;
    if (!userEmail || !topic || duration === undefined) {
      return res.status(400).json({ error: 'userEmail, topic, and duration are required' });
    }

    const today = toMidnightUTC(new Date());

    // Auto-calculate status
    let status = 'missed';
    if (duration >= 20) status = 'completed';
    else if (duration > 0) status = 'partial';

    // Upsert: update if entry already exists for today, else create
    const entry = await StudyEntry.findOneAndUpdate(
      { userEmail: userEmail.toLowerCase(), date: today },
      { topic, duration, status },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(entry);
  } catch (error) {
    console.error('Error logging study entry:', error);
    res.status(500).json({ error: 'Failed to log study entry' });
  }
};

// GET /api/study/entries?email=...  — Fetch all entries for a user
exports.getEntries = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const entries = await StudyEntry.find({ userEmail: email.toLowerCase() })
      .sort({ date: -1 })
      .lean();

    res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching study entries:', error);
    res.status(500).json({ error: 'Failed to fetch study entries' });
  }
};

// DELETE /api/study/entry/:id
exports.deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;
    await StudyEntry.findByIdAndDelete(id);
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting study entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
};
