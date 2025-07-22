// utils/sendSMS.js
const axios = require("axios");

const sendSMS = async (mobile, message) => {
  try {
    const res = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message,
        language: "english",
        numbers: mobile,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API,
        },
      }
    );
    console.log("✅ SMS sent", res.data);
  } catch (err) {
    console.error("❌ SMS error", err.message);
  }
};

module.exports = sendSMS;
