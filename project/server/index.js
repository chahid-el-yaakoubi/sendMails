import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MongoDB = process.env.MONGODB_URI;
console.log({ "MongoDB_URI": MongoDB });

// MongoDB connection
(async () => {
  try {
    await mongoose.connect(MongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.log('MongoDB connection error:', err);
  }
})();

// Email Schema
const emailSchema = new mongoose.Schema({
  to: [String],
  subject: String,
  content: String,
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['success', 'failed'], required: true }
});

const Email = mongoose.model('Email', emailSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Admin = mongoose.model('Admin', adminSchema);

// Create default admin if none exists
const createDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      await Admin.create({ username: 'admin', password: "admin123" });
      console.log('Default admin created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

createDefaultAdmin();

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username, password });
    if (admin) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Nodemailer configuration
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    for (const email of to) {
      await transporter.sendMail({
        from: `"AVIS_PRO_REVIEWS" <${process.env.EMAIL_USER}>`, // Custom sender name
        to: email,
        subject,
        text,
      });
      console.log(`Email sent successfully to ${email}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before sending the next email
    }
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

// Send email endpoint
app.post('/api/send-email', async (req, res) => {
  const { to, subject, content } = req.body;
  try {
    const emailAddresses = to.split(',').map(email => email.trim());
    await sendEmail(emailAddresses, subject, content);
    const emailRecord = new Email({ to: emailAddresses, subject, content, status: 'success' });
    await emailRecord.save();
    res.json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending emails:', error);
    const emailRecord = new Email({ to: to.split(',').map(email => email.trim()), subject, content, status: 'failed' });
    await emailRecord.save();
    res.status(500).json({ success: false, message: 'Failed to send emails' });
  }
});

// Get email history endpoint
app.get('/api/emails', async (req, res) => {
  try {
    const emails = await Email.find().sort({ sentAt: -1 });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching emails' });
  }
});

const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
