import nodemailer from "nodemailer";

/**
 * Sends an email using Gmail (via App Password)
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} html - HTML content of the email
 */
export const sendEmail = async (to, subject, html) => {
  try {
    // Create a transporter object using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    // Email options
    const mailOptions = {
      from: `"Expense Tracker App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};
