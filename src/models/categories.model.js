const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {type: String, required: true},
  value: {type: String, required: true},
});

const categoriesSchema = new Schema({
  userId: {type: String, required: true},
  categories: {type: [categorySchema], required: true},
});

const Categories = mongoose.model('Categories', categoriesSchema);

module.exports = Categories;
