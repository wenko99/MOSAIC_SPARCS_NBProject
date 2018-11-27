const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// img_path, x_coord, y_coord are temporary values
const userSchema = new Schema({
    id : String,
    pw : String,
    image : [{
        img_path  : String,
        coord : [String],
        season : String,
        time : String
    }]
});

module.exports = mongoose.model('user', userSchema);