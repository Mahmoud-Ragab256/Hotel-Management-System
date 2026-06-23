import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv'

dotenv.config()

// تعريف الـ Interface الخاص بالبيانات المرسلة للـ API
interface BrevoEmailPayload {
  sender: { name: string; email: string };
  to: { email: string }[];
  subject: string;
  htmlContent: string;
}

interface MailOptions {
  email: string,
  userName: string,
  resetCode: string
}

export const sendResetPassEmail = async (mailOptions: MailOptions): Promise<boolean> => {
  const url: string = 'https://api.brevo.com/v3/smtp/email';

  const data: BrevoEmailPayload = {
    sender: {
      name: "Hotel Management System",
      email: "mahmoudragabwd@gmail.com" // الإيميل المسجل به في Brevo
    },
    to: [
      {
        email: mailOptions.email
      }
    ],
    subject: "Reset Code",
    htmlContent: `<div style="max-width: 500px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; font-family: Arial, sans-serif; border-radius: 8px;">
      <h2 style="color: #333;">Hi ${mailOptions.userName},</h2>
      <p style="color: #555; line-height: 1.6;">
        We received a request to reset the password for your <strong>Hotel account</strong>.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 14px; color: #888; margin-bottom: 10px;">Your reset code is:</p>
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2c3e50; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
          ${mailOptions.resetCode}
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
  };

  const config = {
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY as string,
      'content-type': 'application/json'
    }
  };

  try {
    // تحديد نوع الـ Response القادم من Axios ليكون متوافقاً مع TypeScript
    const response: AxiosResponse = await axios.post(url, data, config);
    return true;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return (error.response?.data || error.message);
    } else {
      console.error('Unexpected Error:', error);
    }
    return false;
  }
};

export default sendResetPassEmail;