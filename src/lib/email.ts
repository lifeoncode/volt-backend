import { Resend } from "resend";

const EMAIL_KEY = process.env.EMAIL_API_KEY;
const VOLT_EMAIL_ADDRESS = process.env.VOLT_EMAIL_ADDRESS;

const resend = new Resend(EMAIL_KEY);

export const verificationEmailTemplate = (token: string) => {
  return {
    subject: "Welcome to Volt!🤗",
    body: `
    <p style="font-size: 16px">Hi there,<br/>We're excited to have you, before you can use Volt, you're gonna have to verify your email first. Click the link below</p>
    <p style="font-size: 16px">
      <a href="https://voltpassword.xyz/verify?token=${token}">https://voltpassword.xyz/verify?token=${token}</a>
    </p>
    <p style="font-size: 16px">Please note that this link <strong>will expire in 24 hours</strong>. If you're not expecting this email or did not request it, feel free to ignore it.</p>
    <hr />
    <p style="font-size: 12px">This is an automated email from Volt. Please do not reply.</p>
`,
  };
};

export const passwordResetTemplate = (token: string) => {
  return {
    subject: "Password reset",
    body: `
    <p style="font-size: 16px">Hi there,<br/>it looks like you forgot your password, click the link below to create a new one.</p>
    <p style="font-size: 16px">
      <a href="https://voltpassword.xyz/recover/reset?token=${token}">https://voltpassword.xyz/recover/reset?token=${token}</a>
    </p>
    <p style="font-size: 16px">Please note that this link <strong>will expire in 60 minutes</strong>. If you're not expecting this email or did not request it, feel free to ignore it.</p>
    <hr />
    <p style="font-size: 12px">This is an automated email from Volt. Please do not reply.</p>
`,
  };
};

/**
 * @func sendEmail
 *
 * @description
 * Sends email to User email address for account recovery.
 *
 * @param {String} emailAddress - User email
 * @param {Object} template - The email template containing content
 *
 * @returns {boolean}
 *
 * @sideEffects
 * Logs email event on success. Logs error message on failure
 */
export const sendEmail = (emailAddress: string, template: { subject: string; body: string }): boolean => {
  try {
    resend.emails.send({
      from: `Volt <${VOLT_EMAIL_ADDRESS}>`,
      to: emailAddress,
      subject: template.subject,
      html: template.body,
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
