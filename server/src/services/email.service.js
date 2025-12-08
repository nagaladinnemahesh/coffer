import nodemailer from "nodemailer";

export async function sendEmail() {
  //   console.log("sendemail called");
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to: "maheshnagaladinne21@gmail.com",
    subject: "Test email",
    text: "Hello User",
    htm: "<h1>Hello from coffer!</h1>",
  });
}
