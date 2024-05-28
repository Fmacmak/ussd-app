require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Menu = require('./menu');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Endpoint to handle USSD requests
app.post('/ussd', async (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    const session = new Session();
    const menu = new Menu(session);

    let response;

    // Check if phone number is registered as a security number
    const isRegistered = await menu.checkSecurityNumber(phoneNumber);

    if (!isRegistered) {
        response = menu.unavailable();
    } else {
        switch (text) {
            case '':
                response = menu.home(sessionId);
                break;
            case '1':
                response = menu.generateOtp();
                break;
            case '2':
                response = await menu.validateAccessCode(text, sessionId, phoneNumber);
                break;
            default:
                response = menu.unavailable();
                break;
        }
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

app.listen(PORT, () => {
    console.log(`USSD app running on port ${PORT}`);
});
