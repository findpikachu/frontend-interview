
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateStatistics } from '../core/statistics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/calculate', async (req, res) => {
  try {
    console.time('API处理时间');
    
    const { data } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: '无效的数据格式，需要数组类型'
      });
    }
    
    console.log(`接收到 ${data.length} 条数据记录`);
    
    const results = calculateStatistics(data);
    
    console.timeEnd('API处理时间');
    
    res.json({
      success: true,
      data: results,
      meta: {
        totalRecords: data.length,
        processedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('计算错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 数据统计系统已启动`);
});
