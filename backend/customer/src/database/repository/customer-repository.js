const mongoose = require('mongoose');
const { CustomerModel, AddressModel } = require('../models');

// Dealing with database operations
class CustomerRepository {

  async CreateCustomer({ email, password, phone, salt }) {
    const customer = new CustomerModel({
      email,
      password,
      salt,
      phone,
      address: []
    });
    const customerResult = await customer.save();
    return customerResult;
  }

  async CreateAddress({ _id, street, postalCode, city, country }) {
    // Tạo address mới
    const newAddress = new AddressModel({
      street,
      postalCode,
      city,
      country
    });
    await newAddress.save();

    // Push id address vào customer bằng atomic update
    await CustomerModel.updateOne(
      { _id },
      { $push: { address: newAddress._id } },
      { runValidators: true }
    );

    // Trả về profile sau khi cập nhật (có populate address để hiển thị)
    return await CustomerModel.findById(_id).populate('address').lean();
  }

  async FindCustomer({ email }) {
    // Dùng nguyên doc (không lean) để giữ đủ field password/salt cho ValidatePassword
    const existingCustomer = await CustomerModel.findOne({ email: email });
    return existingCustomer;
  }

  async FindCustomerById(id) {
    // GET-only: dùng lean + populate address
    const existingCustomer = await CustomerModel.findById(id)
      .populate('address')
      .lean();
    return existingCustomer;
  }

  async Wishlist(customerId) {
    const doc = await CustomerModel.findById(customerId)
      .select('wishlist')
      .lean();
    return doc?.wishlist ?? [];
  }

  /**
   * Toggle wishlist:
   * - Nếu đã tồn tại _id trong wishlist -> remove
   * - Nếu chưa tồn tại -> push
   */
  async AddWishlistItem(customerId, { _id, name, desc, price, available, banner }) {
    // 1) Thử remove trước (toggle)
    const pullRes = await CustomerModel.updateOne(
      { _id: customerId },
      { $pull: { wishlist: { _id } } },
      { runValidators: true }
    );

    // 2) Nếu không remove được (không tồn tại) thì push mới
    if (pullRes.modifiedCount === 0) {
      const product = { _id, name, desc, price, available, banner };
      await CustomerModel.updateOne(
        { _id: customerId },
        { $push: { wishlist: product } },
        { runValidators: true }
      );
    }

    // 3) Trả về wishlist mới
    const doc = await CustomerModel.findById(customerId)
      .select('wishlist')
      .lean();
    return doc?.wishlist ?? [];
  }

  /**
   * Cart:
   * - isRemove=true: xoá item theo product._id
   * - isRemove=false: nếu có rồi -> set unit; nếu chưa -> push mới
   */
  async AddCartItem(customerId, { _id, name, price, banner }, qty, isRemove) {
    if (isRemove) {
      await CustomerModel.updateOne(
        { _id: customerId },
        { $pull: { cart: { 'product._id': _id } } },
        { runValidators: true }
      );
      const doc = await CustomerModel.findById(customerId)
        .select('cart')
        .lean();
      return doc?.cart ?? [];
    }

    // 1) Thử set unit nếu item đã tồn tại
    const setRes = await CustomerModel.updateOne(
      { _id: customerId, 'cart.product._id': _id },
      { $set: { 'cart.$.unit': qty } },
      { runValidators: true }
    );

    // 2) Nếu chưa có, push mới
    if (setRes.modifiedCount === 0) {
      const cartItem = {
        product: { _id, name, price, banner },
        unit: qty
      };
      await CustomerModel.updateOne(
        { _id: customerId },
        { $push: { cart: cartItem } },
        { runValidators: true }
      );
    }

    // 3) Trả về cart mới
    const doc = await CustomerModel.findById(customerId)
      .select('cart')
      .lean();
    return doc?.cart ?? [];
  }

  async AddOrderToProfile(customerId, order) {
    // Map dữ liệu order theo schema (đã tắt _id subdoc trong patch schema đề xuất).
    // Nếu schema của bạn vẫn cho phép _id ở orders, có thể push thẳng "order".
    const payload = {
      amount: order.amount,
      date: order.date ? new Date(order.date) : new Date()
    };

    await CustomerModel.updateOne(
      { _id: customerId },
      {
        $push: { orders: payload },
        $set: { cart: [] } // clear cart sau khi tạo order
      },
      { runValidators: true }
    );

    // Trả profile (lean)
    const doc = await CustomerModel.findById(customerId)
      .select('orders cart')
      .lean();

    if (doc) return doc;
    throw new Error('Unable to add to order!');
  }
}

module.exports = CustomerRepository;
