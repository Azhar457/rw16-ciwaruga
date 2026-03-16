import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function sendOTPEmail(to: string, otp: string, name: string) {
    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to,
        subject: "Kode Verifikasi RW 16 Ciwaruga",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4F46E5; text-align: center;">Verifikasi Akun</h2>
        <p>Halo <strong>${name}</strong>,</p>
        <p>Terima kasih telah mendaftar di Portal RW 16 Ciwaruga. Kode verifikasi (OTP) Anda adalah:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">
          ${otp}
        </div>
        <p>Kode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapa pun.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
          Jika Anda tidak merasa mendaftar, silakan abaikan email ini.
        </p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${to}`);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}
