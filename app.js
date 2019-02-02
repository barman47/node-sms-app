const express = require('express');
const ejs = require('ejs');
const Nexmo = require('nexmo');
const socketio = require('socket.io');

// Init Nexmo
const nexmo = new Nexmo({
    apiKey: '0fa7668c',
    apiSecret: 'O6aAfuRbG0BEKVtR'
}, { debug: true });

// Init App
const app = express();

app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/', (req, res) => {
    // res.send(req.body);
    // console.log(req.body);
    const number = req.body.number;
    const text = req.body.text;

    nexmo.message.sendSms('BARMAN', number, text, { type: 'unicode' }, (err, responseData) => {
        if (err) {
            console.log(err);
        } else {
            console.dir(responseData);
            // Get data from response
            const data = {
                id: responseData.messages[0]['message-id'],
                number: responseData.messages[0]['to']
            };

            // Emmit to the client
            io.emit('smsStatus', data);
        }
    });
});

const port = 3000;

const server = app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

// Connect to Socket.io

const io = socketio(server);
io.on('connection', (socket) => {
    console.log('Connected');
    io.on('disconect', () => {
        console.log('Disconnected');
    });
});