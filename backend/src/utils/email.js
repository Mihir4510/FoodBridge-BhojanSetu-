const nodemailer = require("nodemailer");

async function sendEmail({ to, subject, text, html }) {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST, 
            port: process.env.SMTP_PORT || 587,
            secure: false, 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Send email
        await transporter.sendMail({
            from: `"BhojanSetu" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });

        // console.log(` Email sent to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = sendEmail;