# Nội dung file: frontend/Dockerfile

FROM node:20-alpine

WORKDIR /app-frontend

COPY package*.json ./

# Lưu ý: Lệnh này sẽ cài đặt dựa trên package-lock.json (nếu có)
RUN npm install

COPY . .

# Mở cổng 3000 bên TRONG container
EXPOSE 3000

# Lệnh để khởi động server phát triển
CMD ["npm", "start"]