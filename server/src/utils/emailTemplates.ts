/**
 * Email template for user verification with code
 */
export const verifyEmailTemplate = (
  verificationCode: string,
  brandColor: string = "#2563EB"
) => ({
  subject: "Verify your Enenni account",
  text: `Your verification code for Enenni account is: ${verificationCode}. This code will expire in 24 hours.`,
  html: `
    <html><head><style>
      body, html { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
      .header { background-color: ${brandColor}; font-weight:bold; font-size: 24px; color: #ffffff; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px; }
      .header img { max-width: 40px; margin-bottom: 10px; }
      .content { padding: 20px; text-align: center; }
      .content h1 { font-size: 24px; color: #333333; }
      .content p { font-size: 16px; color: #666666; margin: 10px 0 20px; }
      .verification-code { display: inline-block; padding: 15px 25px; font-size: 32px; font-weight: bold; letter-spacing: 5px; background-color: #f4f4f4; color: #333333; border-radius: 5px; margin: 20px 0; }
      .footer { font-size: 14px; color: #999999; text-align: center; padding: 20px; }
    </style></head><body>
      <div class="container">
        <div class="header">Enenni</div>
        <div class="content">
          <h1>Verify Your Email Address</h1>
          <p>Thank you for signing up! Please use the verification code below to confirm your account:</p>
          <div class="verification-code">${verificationCode}</div>
          <p>This code will expire in 24 hours.</p>
          <p>If you did not create this account, please disregard this email.</p>
        </div>
        <div class="footer">
          <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
        </div>
      </div>
    </body></html>
  `,
});

/**
 * Email template for password reset
 */
export const passwordResetTemplate = (
  url: string,
  brandColor: string = "#2563EB"
) => ({
  subject: "Reset Your Enenni Password",
  text: `To reset your password, please click the following link: ${url}`,
  html: `
    <html><head><style>
      body, html { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
      .header { background-color: ${brandColor}; font-size: 24px;  font-weight:bold; color: #ffffff; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px; }
      .header img { max-width: 40px; margin-bottom: 10px; }
      .content { padding: 20px; text-align: center; }
      .content h1 { font-size: 24px; color: #333333; }
      .content p { font-size: 16px; color: #666666; margin: 10px 0 20px; }
      .button { display: inline-block; padding: 15px 25px; font-size: 16px; font-weight: bold; background-color: ${brandColor};  color: #fff !important; border-radius: 5px; text-decoration: none; margin-top: 20px; }
      .footer { font-size: 14px; color: #999999; text-align: center; padding: 20px; }
    </style></head><body>
      <div class="container">
        <div class="header">Enenni</div>
        <div class="content">
          <h1>Reset Your Password</h1>
          <p>We received a request to reset your password. Click the button below to proceed with resetting your password.</p>
          <a href="${url}" class="button">Reset Password</a>
          <p>If you did not request a password reset, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
        </div>
      </div>
    </body></html>
  `,
});

/**
 * Email template for successful password reset
 */
export const passwordResetSuccessTemplate = (
  brandColor: string = "#2563EB"
) => ({
  subject: "Your Enenni Password Has Been Reset",
  text: `Your password has been successfully reset. If you did not perform this action, please contact support immediately.`,
  html: `
    <html><head><style>
      body, html { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
      .header { background-color: ${brandColor}; font-size: 24px;  font-weight:bold; color: #ffffff; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px; }
      .content { padding: 20px; text-align: center; }
      .content h1 { font-size: 24px; color: #333333; }
      .content p { font-size: 16px; color: #666666; margin: 10px 0 20px; }
      .footer { font-size: 14px; color: #999999; text-align: center; padding: 20px; }
    </style></head><body>
      <div class="container">
        <div class="header">Enenni</div>
        <div class="content">
          <h1>Password Reset Successful</h1>
          <p>Your password has been successfully reset. You can now log in with your new password.</p>
          <p>If you did not perform this action, please contact our support team immediately.</p>
        </div>
        <div class="footer">
          <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
        </div>
      </div>
    </body></html>
  `,
});

/**
 * Email template for two-factor authentication setup
 */
export const twoFactorEnabledTemplate = (
  brandColor: string = "#2563EB"
) => ({
  subject: "Two-Factor Authentication Enabled",
  text: `Two-factor authentication has been enabled for your Enenni account. If you did not perform this action, please contact support immediately.`,
  html: `
    <html><head><style>
      body, html { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
      .header { background-color: ${brandColor}; font-size: 24px;  font-weight:bold; color: #ffffff; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px; }
      .content { padding: 20px; text-align: center; }
      .content h1 { font-size: 24px; color: #333333; }
      .content p { font-size: 16px; color: #666666; margin: 10px 0 20px; }
      .footer { font-size: 14px; color: #999999; text-align: center; padding: 20px; }
    </style></head><body>
      <div class="container">
        <div class="header">Enenni</div>
        <div class="content">
          <h1>Two-Factor Authentication Enabled</h1>
          <p>Two-factor authentication has been enabled for your account. Your account is now more secure.</p>
          <p>If you did not perform this action, please contact our support team immediately.</p>
        </div>
        <div class="footer">
          <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
        </div>
      </div>
    </body></html>
  `,
});

/**
 * Email template for two-factor authentication disabled notification
 */
export const twoFactorDisabledTemplate = (
  brandColor: string = "#2563EB"
) => ({
  subject: "Two-Factor Authentication Disabled",
  text: `Two-factor authentication has been disabled for your Enenni account. If you did not perform this action, please contact support immediately.`,
  html: `
    <html><head><style>
      body, html { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
      .header { background-color: ${brandColor}; font-size: 24px;  font-weight:bold; color: #ffffff; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px; }
      .content { padding: 20px; text-align: center; }
      .content h1 { font-size: 24px; color: #333333; }
      .content p { font-size: 16px; color: #666666; margin: 10px 0 20px; }
      .footer { font-size: 14px; color: #999999; text-align: center; padding: 20px; }
    </style></head><body>
      <div class="container">
        <div class="header">Enenni</div>
        <div class="content">
          <h1>Two-Factor Authentication Disabled</h1>
          <p>Two-factor authentication has been disabled for your account. Your account security has been reduced.</p>
          <p>If you did not perform this action, please contact our support team immediately.</p>
        </div>
        <div class="footer">
          <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
        </div>
      </div>
    </body></html>
  `,
}); 