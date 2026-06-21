import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

interface EmailOptions {
  email: string;
  userName: string;
  resetCode: string;
}

const sendResetPassEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  })

  const mailOptions = {
    from: `Hotel <${process.env.EMAIL}>`,
    to: options.email,
    subject: "Reset Code",
    html: `<div style="max-width: 500px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; font-family: Arial, sans-serif; border-radius: 8px;">
      <h2 style="color: #333;">Hi ${options.userName},</h2>
      <p style="color: #555; line-height: 1.6;">
        We received a request to reset the password for your <strong>Hotel account</strong>.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 14px; color: #888; margin-bottom: 10px;">Your reset code is:</p>
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2c3e50; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
          ${options.resetCode}
        </span>
      </div>
      <p style="color: #555; font-size: 13px;">
        Enter this code to complete the reset process. This code will expire shortly.
      </p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>`
  }

  await transporter.sendMail(mailOptions)
}

export default sendResetPassEmail
