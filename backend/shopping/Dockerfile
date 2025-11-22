# ✅ Dùng Node 20 LTS (ổn định, tương thích với các thư viện cũ)
FROM node:20

# Thiết lập thư mục làm việc trong container
WORKDIR /app/shopping

# Copy file package để cài dependencies trước
COPY package*.json ./

# Cài dependencies trong container (bỏ devDependencies để nhẹ hơn)
RUN npm install --omit=dev

# Copy toàn bộ mã nguồn vào container
COPY . .

# Mở cổng ứng dụng
EXPOSE 8003

# Chạy ứng dụng
CMD ["node", "-r", "./src/tracing.js", "src/index.js"]
