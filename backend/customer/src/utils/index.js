const bcrypt = require('bcryptjs');            
const jwt = require('jsonwebtoken');
const amqplib = require('amqplib');

const {
  APP_SECRET,
  EXCHANGE_NAME,
  CUSTOMER_SERVICE,
  MSG_QUEUE_URL,
} = require('../config');

// =============== Security helpers ===============

// Tạo salt (có thể truyền rounds qua ENV nếu muốn)
module.exports.GenerateSalt = async (rounds = 10) => {
  return await bcrypt.genSalt(rounds);
};

// Hash mật khẩu với salt
module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

// So sánh mật khẩu nhập vào với hash đã lưu
module.exports.ValidatePassword = async (enteredPassword, savedPassword /* hash */) => {
  // ❗ Không cần salt ở đây: compare làm việc trực tiếp với hash đã lưu
  return await bcrypt.compare(enteredPassword, savedPassword);
};

// =============== JWT helpers ===============
module.exports.GenerateSignature = async (payload) => {
  try {
    // Có thể thêm issuer/audience nếu cần
    return jwt.sign(payload, APP_SECRET, { expiresIn: '30d' });
  } catch (error) {
    console.error('[JWT] sign error:', error);
    throw error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const auth = req.get('Authorization') || '';
    if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
      return false;
    }
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.error('[JWT] verify error:', error.message);
    return false;
  }
};

// =============== Misc ===============
module.exports.FormateData = (data) => {
  if (data) {
    return { data };
  }
  throw new Error('Data Not found!');
};

// =============== RabbitMQ helpers ===============

// Tạo channel & đảm bảo exchange tồn tại
module.exports.CreateChannel = async () => {
  try {
    const connection = await amqplib.connect(MSG_QUEUE_URL);
    const channel = await connection.createChannel();

    // Đúng cho mô hình pub/sub theo routing key: direct exchange
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

    // Tuỳ chọn: để xử lý back-pressure
    // channel.prefetch(1);

    // Log sự cố để dễ debug
    channel.on('error', (err) => console.error('[AMQP] channel error:', err));
    channel.on('close', () => console.warn('[AMQP] channel closed'));
    connection.on('error', (err) => console.error('[AMQP] connection error:', err));
    connection.on('close', () => console.warn('[AMQP] connection closed'));

    return channel;
  } catch (err) {
    console.error('[AMQP] CreateChannel error:', err);
    throw err;
  }
};

// Publish message theo routing key = service
module.exports.PublishMessage = (channel, routingKey, msg) => {
  try {
    const ok = channel.publish(
      EXCHANGE_NAME,
      routingKey,                         // ví dụ: 'shopping-service' / 'products-service'
      Buffer.from(msg),
      { persistent: true }                // giữ message khi broker restart
    );
    if (!ok) {
      console.warn('[AMQP] publish backpressure (write buffer full)');
    }
    console.log('[AMQP] Sent:', { routingKey, msg });
  } catch (err) {
    console.error('[AMQP] PublishMessage error:', err);
    throw err;
  }
};

// Subscribe message cho CUSTOMER_SERVICE (routing key)
module.exports.SubscribeMessage = async (channel, service /* service instance có SubscribeEvents */) => {
  try {
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

    // Tạo queue tạm thời, exclusive cho consumer này
    const q = await channel.assertQueue('', { exclusive: true });
    console.log(`[AMQP] Waiting for messages in queue: ${q.queue}`);

    // Ràng buộc queue với routing key của customer
    await channel.bindQueue(q.queue, EXCHANGE_NAME, CUSTOMER_SERVICE);

    // Nhận tin
    channel.consume(
      q.queue,
      (msg) => {
        try {
          if (msg?.content) {
            const content = msg.content.toString();
            console.log('[AMQP] Received:', content);
            service.SubscribeEvents(content);
          }
        } catch (err) {
          console.error('[AMQP] consume handler error:', err);
        }
      },
      { noAck: true }
    );
  } catch (err) {
    console.error('[AMQP] SubscribeMessage error:', err);
    throw err;
  }
};
