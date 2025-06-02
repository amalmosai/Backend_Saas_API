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
      subject: "مرحبًا بكم في منصتنا - الحساب قيد المراجعة",
      html: `
        <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
          <h1>مرحبًا</h1>
          <p>شكرًا لتسجيلك معنا</p>
          <p>لقد تم استلام حسابك وهو الآن قيد المراجعة.</p>
          <p>سوف تتلقى بريدًا إلكترونيًا بمجرد الموافقة على حسابك وتفعيله</p>
          <p>إذا كان لديك أي استفسارات في غضون ذلك، لا تتردد في التواصل مع فريق الدعم</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

export const sendAccountStatusEmail = async (user: IUser) => {
  try {
    let subject: string;
    let html: string;

    if (user.status === "accept") {
      subject = "تم قبول حسابك بنجاح!";
      html = `
        <div dir="rtl" style="text-align: right; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; line-height: 1.6;">
          <h1>مرحباً!</h1>
          <p>يسرنا إعلامك بأنه تم الموافقة على حسابك بنجاح.</p>
          <p>يمكنك الآن تسجيل الدخول والبدء باستخدام جميع ميزات منصتنا.</p>
          ${
            process.env.FRONTEND_LOGIN_URL
              ? `
          <p>
            <a href="${process.env.FRONTEND_LOGIN_URL}" style="color: #0066cc; text-decoration: none;">
              اضغط هنا لتسجيل الدخول
            </a>
          </p>`
              : ""
          }
          <p>إذا كان لديك أي استفسارات، يرجى التواصل مع فريق الدعم.</p>
          ${
            process.env.SUPPORT_EMAIL
              ? `
          <p>البريد الإلكتروني للدعم: ${process.env.SUPPORT_EMAIL}</p>`
              : ""
          }
        </div>
      `;
    } else if (user.status === "reject") {
      subject = "حالة طلب إنشاء الحساب";
      html = `
        <div dir="rtl" style="text-align: right; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; line-height: 1.6;">
          <h1>مرحباً!</h1>
          <p>بعد المراجعة الدقيقة، لا يمكننا الموافقة على طلب إنشاء حسابك في هذا الوقت.</p>
          <p>إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع فريق الدعم للمساعدة.</p>
          ${
            process.env.SUPPORT_EMAIL
              ? `
          <p>بريد الدعم الفني: ${process.env.SUPPORT_EMAIL}</p>`
              : ""
          }
          <p>شكراً لتفهمكم.</p>
        </div>
      `;
    } else {
      // For pending or other statuses, don't send email
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: subject,
      html: html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending account status email:", error);
    throw error;
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
