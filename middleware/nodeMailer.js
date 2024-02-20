const nodemailer = require("nodemailer");
require("dotenv").config()

// exports.sendEmail = async (randomOTP,userEmail) => {
//     console. log(userEmail,randomOTP)
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     auth: {
//       user: process.env.MAIL_ID,
//       pass: process.env.MAIL_PASS,
//     }
    
//   });

//   // Define email data using the provided data object
//   const emailData = {
//       from: "shibinshabu392@gmail.com", // Recipient address
//     to: "shibinshabu392@gmail.com", // Sender address
//     subject: "Hello from Nodemailer", // Subject line
//     text: "This is a test email sent using Nodemailer.", // Plain text body
//     html:`<b>${randomOTP}</b>`, // HTML body
//   };

//   console.log("Preview sent: %s", emailData.subject);

//   try {
//     // Send the email
//     const info = await transporter.sendMail(emailData);
//     console.log('Email sent:', info.response);
//     return info;
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw error; // Re-throw the error for handling in the calling function or route
//   }
// };

exports.sendEmail = async (randomOTP, userEmail) => {
    console.log(userEmail, randomOTP);
  
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS,
      },
    });
  
    // Define email data using the provided data object
    const emailData = {
      from: 'shibinshabu392@gmail.com', // Sender address
      to: userEmail, // Use the userEmail parameter here
      subject: 'Hello from Nodemailer', // Subject line
      text: 'This is a test email sent using Nodemailer.', // Plain text body
      html: `<b>${randomOTP}</b>`, // HTML body
    };
  
    console.log('Preview sent: %s', emailData.subject);
  
    try {
      // Send the email
      const info = await transporter.sendMail(emailData);
      console.log('Email sent:', info.response);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error; // Re-throw the error for handling in the calling function or route
    }
  };