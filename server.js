require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hackathonhub:sanjay123@cluster0.ydynxul.mongodb.net/hackathonhub?retryWrites=true&w=majority';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas Cloud Successfully!'))
  .catch(err => console.error('⚠️ MongoDB Atlas Connection Error:', err.message));

/* --------------------------------------------------------------------------
   Mongoose Schemas & Models
   -------------------------------------------------------------------------- */

// 1. Enquiry Schema (Student Applications)
const enquirySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  course: { type: String, required: true },
  college: { type: String, default: 'All India College' },
  message: { type: String, default: 'No notes provided' },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

const Enquiry = mongoose.model('Enquiry', enquirySchema);

// 2. Event Schema (Campus Opportunities Catalog)
const eventSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  fee: { type: String, required: true },
  organizer: { type: String, required: true },
  prize: { type: String, required: true },
  desc: { type: String, default: 'No description' },
  location: { type: String, default: 'Pan-India' },
  inst: { type: String, default: 'cu' }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

// 3. Notification Schema (Push Announcement Drawer)
const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  time: { type: String, default: 'Just now' },
  read: { type: Boolean, default: false }
});
const Notification = mongoose.model('Notification', notificationSchema);

// 4. Student Review Schema
const reviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  detail: { type: String, required: true },
  rating: { type: String, default: '⭐⭐⭐⭐⭐' },
  comment: { type: String, required: true },
  initials: { type: String, default: 'ST' },
  date: { type: String },
  status: { type: String, default: 'Pending' } // Pending, Approved, Rejected
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

/* --------------------------------------------------------------------------
   REST API Endpoints
   -------------------------------------------------------------------------- */

// --- ADMIN AUTHENTICATION ---
app.post('/api/admin/login', (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();
  const password = (req.body.password || '').trim();

  const isEmailAdmin = email.includes('admin') || email.includes('sanjay') || email.includes('cu');
  const isPasswordCorrect = password === 'Sanjay@9351294898';

  if (isEmailAdmin && isPasswordCorrect) {
    res.json({ success: true, token: 'ADMIN_SECURE_TOKEN_GRANTED', user: email });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Admin Password' });
  }
});

// --- ENQUIRIES / APPLICATIONS ---
app.get('/api/enquiries', async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/enquiries', async (req, res) => {
  try {
    const enquiry = new Enquiry(req.body);
    await enquiry.save();
    res.status(201).json(enquiry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/enquiries/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await Enquiry.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' });
    res.json(enquiry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- EVENTS / OPPORTUNITIES ---
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    await Event.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- NOTIFICATIONS ---
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const notif = new Notification(req.body);
    await notif.save();
    res.status(201).json(notif);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/notifications/read', async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REVIEWS / COMMENTS ENDPOINTS ---
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/reviews/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const review = await Review.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    await Review.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Root Gateway Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'portal.html'));
});

// Fallback Route for Static HTML
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'portal.html'));
});

// Start Express Server for Local Development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 HackathonHub Gateway running live at http://localhost:${PORT}`);
  });
}

module.exports = app;
