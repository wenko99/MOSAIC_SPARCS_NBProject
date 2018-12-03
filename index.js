/*
    More To Implement :

    1. Image Searching - Making a mosaic --> api.js
    2. Enable grid selection via dragging mouse --> map_control.js
    3. Login / Create Account on main page, not on different pages --> login.html, create_account.html to main.ejs
    4. better visualization via HTML/CSS modification
*/

// express
const express = require('express');
//multer
const multer = require('multer');
// path
const path = require('path');
// body-parser
const bodyParser = require('body-parser');
// DB Schema
const User = require('./models/user_info');
// session
const session = require('express-session');

// DB Connection Setting
const mongoose = require('mongoose');
const db = mongoose.connection;
const Schema = mongoose.Schema;

db.on('error', console.error);
db.once('open', () => {
    console.log('DB Connected');
});
mongoose.connect('mongodb://localhost/nbproject_test');

// Middleware Setting
const app = express();
app.use(express.static('public/views'));
app.use(express.static('public/scripts'));
app.use(express.static('uploads/'));
app.set('views', __dirname+'/public/views');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: '@!#$%^&**()SECRET@@',
    resave: false,
    saveUninitialized: true
}));
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            let name = req.session.id_val + new Date().valueOf() + path.extname(file.originalname);
            console.log(name + ' created in uploads');
            cb(null, name);
        }
    })
});

// Routing
const router = require('./routes/routing')(app, User);

// API >>> CRUD
const api = require('./api/api')(app, upload, User);

// server
const server = app.listen(8000, () => {
    console.log('Server is Running at Port 8000');
});