const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    }
});

const sendMail = async (to, subject, html) => {
    const mailOptions = {
        from: `"TESLA WALLET" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
        
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent to', to);
    } catch (error) {
        console.error('Email error:', error);
    }
};

module.exports = sendMail;