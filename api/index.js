require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// 缓存数据库连接，防止 Serverless 环境下频繁重连或连接丢失
let isConnected = false;

async function connectToDatabase() {
    if (isConnected) {
        return;
    }

    const MONGODB_URI = process.env.MONGODB_URI;

    // 如果环境变量缺失，报错提示
    if (!MONGODB_URI) {
        console.error('FATAL: MONGODB_URI 环境变量未设置');
        throw new Error('MONGODB_URI 环境变量未设置');
    }

    try {
        // 增加 bufferCommands: false 避免无连接时 hang 住
        await mongoose.connect(MONGODB_URI, {
            bufferCommands: false
        });
        isConnected = true;
        console.log('MongoDB 连接成功');
    } catch (error) {
        console.error('MongoDB 连接失败:', error);
        throw error;
    }
}

// 定义预约用户模型
const subscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now }
});

// 防止模型重复编译
const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 预约接口
// 注意：在 Vercel 中，文件名即路由前缀。但也支持 express 路由。
// 我们在 vercel.json 中配置 rewrite /api/* -> /api/index.js
app.post('/api/subscribe', async (req, res) => {

    // 每次请求前确保数据库连接
    // Vercel 可能在请求之间冻结实例，导致连接状态不明确，显式调用/检查连接最稳妥
    try {
        await connectToDatabase();
    } catch (error) {
        console.error('数据库连接错误:', error);
        // 返回详细错误信息给前端，方便调试
        return res.status(500).json({
            success: false,
            message: '服务器数据库连接失败，请在 Vercel 设置 MONGODB_URI 环境变量。',
            debug: error.message
        });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: '邮箱地址不能为空' });
    }

    try {
        // 检查邮箱是否存在
        const existingUser = await Subscriber.findOne({ email });
        if (existingUser) {
            console.log(`重复预约尝试: ${email}`);
            return res.json({ success: false, message: '您已经预约过了，请勿重复操作。' });
        }

        // 保存新用户
        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();

        console.log(`新预约保存到数据库: ${email}`);
        res.json({ success: true, message: '预约成功！' });
    } catch (err) {
        console.error('保存数据失败:', err);
        return res.status(500).json({
            success: false,
            message: '保存数据时发生服务器错误',
            debug: err.message
        });
    }
});

app.get('/api', (req, res) => {
    res.send('API is running. MongoDB status: ' + (isConnected ? 'Connected' : 'Disconnected'));
});

// 导出 app 供 Vercel 使用
module.exports = app;

// 仅在本地运行时启动监听
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`服务器运行在 http://localhost:${PORT}`);
    });
}
