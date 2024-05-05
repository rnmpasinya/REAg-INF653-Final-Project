const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stateSchema = new Schema({

    //will contain the state abbreviation values
    stateCode:{
        type: String,
        required: true,
        unique: true
    },

    //will contain fun facts about the state
    funfacts: {
        //need to add "string array" type
        type: Array
    }


});

module.exports = mongoose.model('State', stateSchema);
