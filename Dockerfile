# Dùng Node Alpine nhẹ
FROM node:22-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy file cấu hình
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Build nếu là NestJS
RUN npm run build

# Mở port
EXPOSE 5000

# Chạy app
CMD ["npm", "start"]
