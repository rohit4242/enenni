import { Resend } from 'resend';
import { config } from '../config';
import { 
  verifyEmailTemplate, 
  passwordResetTemplate,
  passwordResetSuccessTemplate,
  twoFactorEnabledTemplate,
  twoFactorDisabledTemplate
} from '../utils/emailTemplates';

// Initialize Resend
const resend = new Resend(config.email.resendApiKey);

/**
 * Send an email verification code to a user
 */
export const sendVerificationEmail = async (
  email: string,
  code: string
): Promise<void> => {
  const { subject, text, html } = verifyEmailTemplate(
    code,
    config.email.brandColor
  );
  
  try {
    console.log('Sending verification email to:', email);
    const result = await resend.emails.send({
      from: `${config.email.fromName} <${config.email.fromEmail}>`,
      to: "genrativeai1@gmail.com",
      subject,
      text,
      html,
    });
    console.log('Verification email sent:', result);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // We're catching the error but not rethrowing to prevent the registration process from failing
  }
};

/**
 * Send a password reset link to a user
 */
export const sendPasswordResetEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const resetUrl = `${config.app.frontendUrl}/auth/reset-password?token=${token}`;
  
  const { subject, text, html } = passwordResetTemplate(
    resetUrl,
    config.email.brandColor
  );
  
  try {
    console.log('Sending password reset email to:', email);
    const result = await resend.emails.send({
      from: `${config.email.fromName} <${config.email.fromEmail}>`,
      to: "genrativeai1@gmail.com",
      subject,
      text,
      html,
    });
    console.log('Password reset email sent:', result);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    // We're catching the error but not rethrowing to prevent the process from failing
  }
};

/**
 * Send password reset success notification
 */
export const sendPasswordResetSuccessEmail = async (
  email: string
): Promise<void> => {
  const { subject, text, html } = passwordResetSuccessTemplate(
    config.email.brandColor
  );
  
  try {
    console.log('Sending password reset success email to:', email);
    const result = await resend.emails.send({
      from: `${config.email.fromName} <${config.email.fromEmail}>`,
      to: "genrativeai1@gmail.com",
      subject,
      text,
      html,
    });
    console.log('Password reset success email sent:', result);
  } catch (error) {
    console.error('Failed to send password reset success email:', error);
    // We're catching the error but not rethrowing
  }
};

/**
 * Send two-factor authentication enabled notification
 */
export const sendTwoFactorEnabledEmail = async (
  email: string
): Promise<void> => {
  const { subject, text, html } = twoFactorEnabledTemplate(
    config.email.brandColor
  );
  
  try {
    console.log('Sending two-factor enabled email to:', email);
    const result = await resend.emails.send({
      from: `${config.email.fromName} <${config.email.fromEmail}>`,
      to: "genrativeai1@gmail.com",
      subject,
      text,
      html,
    });
    console.log('Two-factor enabled email sent:', result);
  } catch (error) {
    console.error('Failed to send two-factor enabled email:', error);
    // We're catching the error but not rethrowing
  }
};

/**
 * Send two-factor authentication disabled notification
 */
export const sendTwoFactorDisabledEmail = async (
  email: string
): Promise<void> => {
  const { subject, text, html } = twoFactorDisabledTemplate(
    config.email.brandColor
  );
  
  try {
    console.log('Sending two-factor disabled email to:', email);
    const result = await resend.emails.send({
      from: `${config.email.fromName} <${config.email.fromEmail}>`,
      to: "genrativeai1@gmail.com",
      subject,
      text,
      html,
    });
    console.log('Two-factor disabled email sent:', result);
  } catch (error) {
    console.error('Failed to send two-factor disabled email:', error);
    // We're catching the error but not rethrowing
  }
}; 