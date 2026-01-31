require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 连接 MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB 连接成功'))
    .catch(err => console.error('MongoDB 连接失败:', err));

// 定义预约用户模型
const subscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// 预约接口
app.post('/api/subscribe', async (req, res) => {
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
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
