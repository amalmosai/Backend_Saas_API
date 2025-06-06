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
  if (!user?.email || !user?.status) {
    console.error("Invalid user object - missing email or status");
    return;
  }

  if (!["مقبول", "مرفوض"].includes(user.status)) {
    console.log(`Skipping email for status: ${user.status}`);
    return;
  }

  try {
    // Prepare email content based on status
    const { subject, html } = getEmailContent(user);

    const mailOptions = {
      from: process.env.EMAIL_FROM || "no-reply@example.com",
      to: user.email,
      subject,
      html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Account status email sent to ${user.email}: ${info.messageId}`
    );
  } catch (error) {
    console.error("Error sending account status email:", error);
    throw error; // Re-throw to handle in calling code
  }
};

const getEmailContent = (user: IUser) => {
  const commonStyles = `
    div {
      text-align: right;
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
  `;

  if (user.status === "accept") {
    return {
      subject: "تم قبول حسابك بنجاح!",
      html: `
        <style>${commonStyles}</style>
        <div dir="rtl">
          <h1>مرحباً ${"عزيزي المستخدم"}!</h1>
          <p>يسرنا إعلامك بأنه تم الموافقة على حسابك بنجاح.</p>
          <p>يمكنك الآن تسجيل الدخول والبدء باستخدام جميع ميزات منصتنا.</p>
          ${
            process.env.FRONTEND_LOGIN_URL
              ? `
          <p>
            <a href="${process.env.FRONTEND_LOGIN_URL}" style="display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; border-radius: 5px;">
              تسجيل الدخول إلى المنصة
            </a>
          </p>`
              : ""
          }
          <p>إذا كان لديك أي استفسارات، يرجى التواصل مع فريق الدعم.</p>
          ${
            process.env.SUPPORT_EMAIL
              ? `
          <p>البريد الإلكتروني للدعم: <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a></p>`
              : ""
          }
          <p>شكراً لانضمامك إلينا!</p>
        </div>
      `,
    };
  }

  // For reject status
  return {
    subject: "حالة طلب إنشاء الحساب",
    html: `
      <style>${commonStyles}</style>
      <div dir="rtl">
        <h1>مرحباً ${"عزيزي المستخدم"}!</h1>
        <p>بعد المراجعة الدقيقة، لا يمكننا الموافقة على طلب إنشاء حسابك في هذا الوقت.</p>
        <p>إذا كنت تعتقد أن هذا خطأ أو لديك أي استفسارات، يرجى التواصل مع فريق الدعم.</p>
        ${
          process.env.SUPPORT_EMAIL
            ? `
        <p>بريد الدعم الفني: <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a></p>`
            : ""
        }
        <p>شكراً لتفهمكم.</p>
      </div>
    `,
  };
};
export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
) => {
  try {
    const subject = "إعادة تعيين كلمة المرور الخاصة بك";

    const html = `
      <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
        <h2>طلب إعادة تعيين كلمة المرور</h2>
        <p>لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بك.</p>
        <p>لإعادة تعيين كلمة المرور، يرجى الضغط على الزر أدناه:</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            إعادة تعيين كلمة المرور
          </a>
        </p>
        <p>أو يمكنك نسخ الرابط التالي ولصقه في المتصفح:</p>
        <p><a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a></p>
        <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة.</p>
        <p>مع تحياتنا،</p>
        <p>فريق الدعم</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending password reset email:", error);
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
