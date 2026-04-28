import cron from 'node-cron';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { Resend } from 'resend';

let resend;
const getResend = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

/**
 * Parse the booking date string (e.g., "Wed, 30 Apr") + timeSlot (e.g., "10:00 AM")
 * into a real Date object for the current year.
 */
const parseBookingDateTime = (dateStr, timeSlot) => {
  try {
    const currentYear = new Date().getFullYear();
    // dateStr format: "Wed, 30 Apr"
    const dateParts = dateStr.split(', ')[1]; // "30 Apr"
    if (!dateParts) return null;

    // timeSlot format: "10:00 AM" or "2:30 PM"
    // Convert to 24h for parsing
    let [time, meridian] = timeSlot.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (meridian && meridian.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (meridian && meridian.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }

    const dateObj = new Date(`${dateParts} ${currentYear} ${hours}:${minutes}:00`);
    
    if (isNaN(dateObj.getTime())) {
      // Fallback: try direct parsing
      return new Date(`${dateParts} ${currentYear} ${timeSlot}`);
    }
    
    return dateObj;
  } catch (e) {
    console.error('Error parsing booking date/time:', e);
    return null;
  }
};

/**
 * Send a reminder email to the patient
 */
const sendReminderEmail = async (booking, patient) => {
  const mailer = getResend();
  if (!mailer) {
    console.log('⚠️ Resend not configured, skipping reminder email');
    return false;
  }

  try {
    await mailer.emails.send({
      from: 'CareTrip <onboarding@resend.dev>',
      to: patient.email,
      subject: '⏰ Appointment Reminder - 30 Minutes Away!',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #0F766E, #14B8A6); padding: 28px 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">⏰ Appointment Reminder</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Your appointment is in 30 minutes!</p>
          </div>
          <div style="padding: 28px 24px;">
            <p style="color: #334155; font-size: 15px;">Hello <strong>${patient.name}</strong>,</p>
            <p style="color: #475569; font-size: 14px;">This is a friendly reminder that your appointment is coming up soon:</p>
            <div style="background-color: #f0fdfa; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #0F766E;">
              <p style="margin: 6px 0; color: #334155;"><strong>👨‍⚕️ Doctor:</strong> ${booking.doctorName || 'Your Doctor'}</p>
              <p style="margin: 6px 0; color: #334155;"><strong>📅 Date:</strong> ${booking.date}</p>
              <p style="margin: 6px 0; color: #334155;"><strong>🕐 Time:</strong> ${booking.timeSlot}</p>
              ${booking.doctorSpecialty ? `<p style="margin: 6px 0; color: #334155;"><strong>🏥 Specialty:</strong> ${booking.doctorSpecialty}</p>` : ''}
            </div>
            <p style="color: #475569; font-size: 14px;">Please make sure to arrive on time. If you need to cancel or reschedule, please do so from your CareTrip dashboard.</p>
            <p style="color: #475569; font-size: 14px; margin-top: 20px;">Wishing you good health! 🌿</p>
          </div>
          <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">This is an automated reminder from CareTrip. Please do not reply.</p>
          </div>
        </div>
      `
    });
    console.log(`✅ Reminder email sent to ${patient.email} for booking ${booking._id}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send reminder email to ${patient.email}:`, error.message);
    return false;
  }
};

/**
 * Start the reminder cron job - runs every minute
 */
export const startReminderScheduler = () => {
  console.log('⏰ Reminder scheduler started - checking every minute for upcoming appointments');

  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      // Find confirmed bookings that haven't had a reminder sent
      const bookings = await Booking.find({
        status: 'Confirmed',
        reminderSent: false
      }).lean();

      if (bookings.length === 0) return;

      const now = new Date();

      for (const booking of bookings) {
        if (!booking.date || !booking.timeSlot) continue;

        const appointmentTime = parseBookingDateTime(booking.date, booking.timeSlot);
        if (!appointmentTime) continue;

        // Calculate minutes until appointment
        const minutesUntil = (appointmentTime.getTime() - now.getTime()) / (1000 * 60);

        // Send reminder if appointment is between 28 and 32 minutes away
        // This 4-minute window ensures we don't miss it even if cron timing varies slightly
        if (minutesUntil >= 28 && minutesUntil <= 32) {
          console.log(`📧 Sending reminder for booking ${booking._id} (appointment in ${Math.round(minutesUntil)} min)`);

          const patient = await User.findById(booking.patientId);
          if (!patient || !patient.email) {
            console.log(`⚠️ No patient/email found for booking ${booking._id}`);
            continue;
          }

          const sent = await sendReminderEmail(booking, patient);

          // Mark as sent regardless of email success to avoid repeated attempts
          await Booking.findByIdAndUpdate(booking._id, { reminderSent: true });

          if (sent) {
            console.log(`✅ Reminder marked as sent for booking ${booking._id}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Reminder scheduler error:', error);
    }
  });
};
