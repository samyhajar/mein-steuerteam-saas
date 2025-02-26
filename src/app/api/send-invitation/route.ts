import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, name, invitationLink } = await request.json();

    // Create a test account if no environment variables
    const testAccount = await nodemailer.createTestAccount();

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || testAccount.user,
        pass: process.env.SMTP_PASS || testAccount.pass,
      },
    });

    // Send mail
    const info = await transporter.sendMail({
      from: '"Accounting App" <noreply@example.com>',
      to: email,
      subject: 'Welcome to Your Accounting Portal',
      text: `Hello ${name},\n\nYour accountant has invited you to their accounting portal. Please click the link below to set up your account:\n\n${invitationLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h1>Welcome, ${name}!</h1>
          <p>Your accountant has invited you to join their accounting portal.</p>
          <p>Click the button below to set up your account:</p>
          <div style="margin: 30px 0;">
            <a href="${invitationLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; display: inline-block;">
              Set Up My Account
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6B7280;">${invitationLink}</p>
        </div>
      `,
    });

    console.log('Message sent: %s', info.messageId);

    // For test accounts, show the preview URL
    if (!process.env.SMTP_HOST) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
