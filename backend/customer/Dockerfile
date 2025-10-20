# ✅ Dùng Node 20 (LTS, ổn định)
FROM node:20

# Thiết lập thư mục làm việc trong container
WORKDIR /app/customer

# Copy file khai báo dependencies
COPY package*.json ./

# Cài dependencies trong container (tránh copy node_modules từ host)
RUN npm install --omit=dev

# Copy toàn bộ mã nguồn vào container
COPY . .

# Mở cổng 8001 (hoặc cổng app của bạn)
EXPOSE 8001

# Chạy app
CMD ["npm", "start"]
