const { randomInt } = require('crypto');
const db = require('./database');

class Session {
    ussd_proceed(message, _id, nextStep) {
        return `CON ${message}`;
    }

    ussd_end(message) {
        return `END ${message}`;
    }
}

class Menu {
    constructor(session) {
        this.session = session;
    }

    randomOtpGenerator() {
        const strLen = 4;
        return randomInt(1000, 10000).toString();
    }

    home(_id) {
        const menu = `Main Menu \n1. Get OTP\n2. Validate Access Code\n`;
        return this.session.ussd_proceed(menu, _id, '1');
    }

    generateOtp() {
        const otp = this.randomOtpGenerator();
        const message = `Generate OTP\nYour generated OTP is: ${otp}\n`;
        return this.session.ussd_end(message);
    }

    validateAccessCode(text, _id, phoneNumber) {
        let phaseStr = '';

        if (text.split('*').length === 1) {
            phaseStr = 'Validate Access Code\nPlease enter your access code.\n';
            return this.session.ussd_proceed(phaseStr, _id, '');
        }

        const inputCode = text.split('*')[1];
        const currentDate = new Date().toISOString().split('T')[0];

        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM estates WHERE access_code = ? AND valid_until >= ?`, [inputCode, currentDate], (err, row) => {
                if (err) {
                    reject(err);
                }
                if (row) {
                    phaseStr = `Access Code Valid\nThe access code ${inputCode} is valid.\n`;
                } else {
                    phaseStr = `Access Code Invalid\nThe access code ${inputCode} is invalid or expired.\n`;
                }
                resolve(this.session.ussd_end(phaseStr));
            });
        });
    }

    checkSecurityNumber(phoneNumber) {
        console.log("Checking if security phone number", phoneNumber)
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM security_numbers WHERE phone_number = ?`, [phoneNumber], (err, row) => {
                if (err) {
                    reject(err);
                }
                if (row) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    unavailable() {
        return this.session.ussd_end("Service Unavailable");
    }
}

module.exports = Menu;
// module.exports = Session;
