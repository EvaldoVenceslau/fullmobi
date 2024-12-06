const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
  },
});
module.exports = mongoose.model('Item', ItemSchema);
