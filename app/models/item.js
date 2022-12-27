const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  // MVP calls for local deployment -- no auth
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Item', itemSchema)
