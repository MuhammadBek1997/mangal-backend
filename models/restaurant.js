const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  title: String,
  price: Number,
  img: String
});

const userSchema = new mongoose.Schema({
  id: Number,
  name: String,
  password: String
});

const adminSchema = new mongoose.Schema({
  id: String,
  name: String,
  password: String
});

const clientSchema = new mongoose.Schema({
  name: String,
  bonus: Number,
  number: Number,
  address: {
    lat: Number,
    long: Number
  }
});

const superAdminSchema = new mongoose.Schema({
  login: String,
  password: String
});

const dataSchema = new mongoose.Schema({
  foods: [foodSchema],
  drinks: [foodSchema],
  sweets: [foodSchema]
});

const restDataSchema = new mongoose.Schema({
  superAdmin: superAdminSchema,
  data: dataSchema,
  users: [userSchema],
  admins: [adminSchema],
  clients: [clientSchema]
});

const restaurantSchema = new mongoose.Schema({
  id: String,
  rest_name: String,
  rest_data: restDataSchema
});

module.exports = mongoose.model('Restaurant', restaurantSchema);