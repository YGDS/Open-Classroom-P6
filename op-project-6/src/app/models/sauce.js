const mongoose = require('mongoose');

//replace thing here with model ts ex

const sauceSchema = mongoose.Schema({
  userId: { type: String},
  name: { type: String },
  manufacturer: {type: String},
  description: { type: String },
  mainPepper: { type: String},
  imageUrl: { type: String },
  heat: { type: Number},
  likes: { type: Number},
  dislikes: { type: Number},
  usersLiked: { type: [String]},
  usersDisliked: { type: [String]}
});

module.exports = mongoose.model('Sauce', sauceSchema);