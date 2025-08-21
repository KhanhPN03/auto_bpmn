# 🚀 Deployment Guide - Vercel + Render

Hướng dẫn deploy Auto BPMN với **Client trên Vercel** và **Server trên Render** (Free Tier)

## 📋 Prerequisites

1. **GitHub Repository**: Đảm bảo code đã được push lên GitHub
2. **MongoDB Atlas**: Tạo free cluster tại [MongoDB Atlas](https://www.mongodb.com/atlas)
3. **API Keys**: OpenAI hoặc HuggingFace API keys

---

## 🌐 Deploy Client lên Vercel

### Bước 1: Tạo tài khoản Vercel
1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập bằng GitHub account

### Bước 2: Import Project
1. Nhấn "New Project"
2. Chọn repository `auto_bpmn`
3. **Framework Preset**: Vite
4. **Root Directory**: `client`
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`

### Bước 3: Cấu hình Environment Variables
Trong Vercel Dashboard > Settings > Environment Variables, thêm:

```
VITE_API_URL=https://your-render-app-name.onrender.com/api
```

⚠️ **Lưu ý**: Bạn sẽ cập nhật URL này sau khi deploy server

### Bước 4: Deploy
- Nhấn "Deploy"
- Vercel sẽ tự động build và deploy
- Ghi nhớ URL của bạn: `https://your-app-name.vercel.app`

---

## 🖥️ Deploy Server lên Render

### Bước 1: Tạo tài khoản Render
1. Truy cập [render.com](https://render.com)
2. Đăng nhập bằng GitHub account

### Bước 2: Tạo Web Service
1. Nhấn "New +" → "Web Service"
2. Connect repository `auto_bpmn`
3. **Name**: `auto-bpmn-server` (hoặc tên bạn muốn)
4. **Root Directory**: `server`
5. **Environment**: Node
6. **Build Command**: `npm install`
7. **Start Command**: `npm start`

### Bước 3: Cấu hình Environment Variables
Trong Render Dashboard > Environment, thêm các biến sau:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auto_bpmn

# Security
NODE_ENV=production
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters

# AI APIs
OPENAI_API_KEY=your_openai_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Client URL (cập nhật với URL Vercel của bạn)
CLIENT_URL=https://your-vercel-app-name.vercel.app

# Optional
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
```

### Bước 4: Deploy
- Nhấn "Create Web Service"
- Render sẽ build và deploy server
- Ghi nhớ URL: `https://your-render-app-name.onrender.com`

---

## 🔄 Cập nhật URL Cross-Reference

### Bước 1: Cập nhật Client
1. Vào Vercel Dashboard > Settings > Environment Variables
2. Cập nhật `VITE_API_URL` với URL Render:
   ```
   VITE_API_URL=https://your-render-app-name.onrender.com/api
   ```
3. Redeploy client

### Bước 2: Cập nhật Server
1. Vào Render Dashboard > Environment
2. Cập nhật `CLIENT_URL` với URL Vercel:
   ```
   CLIENT_URL=https://your-vercel-app-name.vercel.app
   ```
3. Redeploy server

---

## 💾 Setup MongoDB Atlas (Free Tier)

### Bước 1: Tạo Cluster
1. Truy cập [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Tạo free cluster (M0 Sandbox)
3. Chọn region gần nhất

### Bước 2: Tạo Database User
1. Database Access → Add New Database User
2. Chọn "Password" authentication
3. Ghi nhớ username/password

### Bước 3: Whitelist IP
1. Network Access → Add IP Address
2. Chọn "Allow Access from Anywhere" (0.0.0.0/0)
3. Hoặc thêm IP của Render

### Bước 4: Get Connection String
1. Clusters → Connect → Connect your application
2. Copy connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/auto_bpmn
   ```

---

## 🔑 API Keys Setup

### OpenAI API Key
1. Truy cập [OpenAI Platform](https://platform.openai.com)
2. API Keys → Create new secret key
3. Copy key bắt đầu với `sk-`

### HuggingFace API Key (Alternative)
1. Truy cập [HuggingFace](https://huggingface.co)
2. Settings → Access Tokens → New token
3. Copy token bắt đầu với `hf_`

---

## ✅ Testing Deployment

### 1. Test Frontend
- Truy cập URL Vercel của bạn
- Kiểm tra trang loading thành công

### 2. Test Backend
- Truy cập `https://your-render-app-name.onrender.com/api/health`
- Kiểm tra response JSON

### 3. Test Integration
- Tạo BPMN diagram từ frontend
- Kiểm tra API calls thành công

---

## 🆓 Free Tier Limitations

### Vercel (Client)
- ✅ Unlimited static deployments
- ✅ Custom domains
- ⚠️ 100GB bandwidth/month

### Render (Server)
- ✅ 750 hours/month compute time
- ⚠️ App sleeps after 15 minutes inactivity
- ⚠️ Cold start ~30 seconds

### MongoDB Atlas
- ✅ 512MB storage
- ✅ Shared cluster
- ⚠️ Limited connections

---

## 🔧 Troubleshooting

### Common Issues

1. **CORS Error**
   ```
   Kiểm tra CLIENT_URL trong server environment variables
   ```

2. **API Not Found**
   ```
   Kiểm tra VITE_API_URL trong client environment variables
   ```

3. **Database Connection Error**
   ```
   Kiểm tra MONGODB_URI và network access settings
   ```

4. **Server Sleep (Render Free Tier)**
   ```
   Server sẽ sleep sau 15 phút không hoạt động
   First request sau đó sẽ mất ~30 giây để wake up
   ```

### Health Check URLs
- **Client**: `https://your-app.vercel.app`
- **Server**: `https://your-app.onrender.com/api/health`
- **Database**: Test qua server API

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Environment variables đã đúng chưa
2. URLs có chính xác không
3. API keys có hoạt động không
4. Database connection string đúng chưa

---

**🎉 Chúc mừng! Ứng dụng của bạn đã được deploy thành công với chi phí $0!**

Lưu URLs quan trọng:
- **Client**: `https://your-app.vercel.app`
- **Server**: `https://your-app.onrender.com`
- **Database**: MongoDB Atlas Cluster
