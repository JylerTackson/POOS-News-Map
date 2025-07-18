import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function sendVerificationEmail(toEmail, token, userId) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&id=${userId}`;
  const msg = {
    to:      toEmail,
    from:    process.env.EMAIL_FROM,
    subject: "Verify your NewsMap account",
    html: `
      <p>Thanks for signing up! Click <a href="${verifyUrl}">here</a> to verify your email address.</p>
      <p>If you didn't register, just ignore this email.</p>
    `,
  };
  await sgMail.send(msg);
}
