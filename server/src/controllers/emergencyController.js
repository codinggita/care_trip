import User from '../models/User.js';

let resend;
async function getResend() {
  if (!resend) {
    const { Resend } = await import('resend');
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// @desc    Send emergency email alert
// @route   POST /api/emergency/email
export const sendEmergencyEmail = async (req, res) => {
  try {
    const { location, message } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.emergencyEmail) {
      return res.status(400).json({ success: false, message: 'Emergency email not set' });
    }

    const emailResponse = await (await getResend()).emails.send({
      from: 'CareTrip SOS <onboarding@resend.dev>', // Use a verified domain in production
      to: user.emergencyEmail,
      subject: `EMERGENCY ALERT: ${user.name} needs help!`,
      html: `
        <h2>Emergency Alert from CareTrip</h2>
        <p><strong>Traveler Name:</strong> ${user.name}</p>
        <p><strong>Message:</strong> ${message || 'This is an emergency SOS alert.'}</p>
        <p><strong>Location:</strong> ${location || 'Unknown'}</p>
        <p><strong>Google Maps Link:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}">View on Map</a></p>
        <hr />
        <p>Sent via CareTrip</p>
      `
    });

    res.status(200).json({ success: true, data: emailResponse });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send emergency email' });
  }
};

// @desc    Generate WhatsApp SOS Link
// @route   GET /api/emergency/whatsapp-link
export const getWhatsAppLink = async (req, res) => {
  try {
    const { location } = req.query;
    const user = await User.findById(req.user.id);

    if (!user || !user.emergencyWhatsApp) {
      return res.status(400).json({ success: false, message: 'Emergency WhatsApp not set' });
    }

    const cleanNumber = user.emergencyWhatsApp.replace(/\D/g, '');
    const text = encodeURIComponent(`🚨 EMERGENCY SOS from ${user.name}! My current location: ${location}. Please help! Map: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`);
    
    const link = `https://wa.me/${cleanNumber}?text=${text}`;

    res.status(200).json({ success: true, data: link });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
