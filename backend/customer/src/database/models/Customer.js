const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Tắt _id cho subdocument order (đỡ bắt buộc)
const OrderSchema = new mongoose.Schema({
  // KHÔNG cần _id ở mỗi order item
  amount: { type: Number },            // trước là String
  date:   { type: Date, default: Date.now }
}, { _id: false });

const CustomerSchema = new Schema({
  email:   { type: String, required: true },
  password:{ type: String },
  salt:    { type: String },
  phone:   { type: String },

  address: [
    { type: Schema.Types.ObjectId, ref: 'address', required: true }
  ],

  cart: [
    {
      product: { 
        _id:    { type: String, required: true },
        name:   { type: String },
        banner: { type: String },
        price:  { type: Number },
      },
      unit: { type: Number, required: true }
    }
  ],

  wishlist: [
    {
      _id:         { type: String, required: true },
      name:        { type: String },
      description: { type: String },
      banner:      { type: String },
      available:   { type: Boolean }, // sửa chính tả avalable -> available
      price:       { type: Number },
    }
  ],

  // Dùng subdoc không _id để tránh ValidationError spam
  orders: { type: [OrderSchema], default: [] },

}, {
  toJSON: {
    transform(doc, ret){
      delete ret.password;
      delete ret.salt;
      delete ret.__v;
    }
  },
  timestamps: true,
  // giảm va chạm __v khi load cao
  optimisticConcurrency: false
});

module.exports =  mongoose.model('customer', CustomerSchema);
