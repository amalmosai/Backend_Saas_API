import nodemailer from "nodemailer";
import IUser from "../Interfaces/user.interface";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendWelcomeEmail = async (user: IUser) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Welcome to Our Platform!",
      html: `
        <h1>Welcome ${user.fname} ${user.lname}!</h1>
        <p>Thank you for registering with us.</p>
        <p>Your account has been successfully created.</p>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

// export const sendVerificationEmail = async (user: IUser, token: string) => {
//   try {
//     const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

//     const mailOptions = {
//       from: process.env.EMAIL_FROM,
//       to: user.email,
//       subject: "Verify Your Email Address",
//       html: `
//         <h1>Please verify your email</h1>
//         <p>Click the link below to verify your email address:</p>
//         <a href="${verificationUrl}">Verify Email</a>
//         <p>This link will expire in 24 hours.</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     console.error("Error sending verification email:", error);
//   }
// };
