/**
 * 性能基准测试模块
 * 测试核心统计算法的性能表现
 */

import Benchmark from 'benchmark';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  calculateStatistics, 
  fp, 
  statsCalculators, 
  validateAndCleanData 
} from '../src/core/statistics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 生成测试数据
function generateTestData(size) {
  const regions = ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'];
  const resources = ['Cereals', 'Fruits', 'Vegetables', 'Meat', 'Dairy'];
  const data = [];
  
  for (let i = 0; i < size; i++) {
    data.push({
      id: i.toString(),
      sim_name: `SIM${i}`,
      name: `Country${i}`,
      region: regions[Math.floor(Math.random() * regions.length)],
      resource: resources[Math.floor(Math.random() * resources.length)],
      year: 2020 + Math.floor(Math.random() * 4),
      value: Math.random() * 10000,
      weight: Math.random() * 5000
    });
  }
  
  return data;
}

// 读取真实数据文件
async function loadRealData() {
  try {
    const dataPath = path.join(__dirname, '../demo.json');
    const content = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(content);
    return data.nodes || data;
  } catch (error) {
    console.warn('无法加载真实数据，使用生成的测试数据');
    return generateTestData(10000);
  }
}

// 创建不同规模的数据集
async function createDataSets() {
  const realData = await loadRealData();
  const realDataSize = realData.length;
  
  return {
    small: generateTestData(1000),
    medium: generateTestData(10000),
    large: generateTestData(50000),
    xlarge: generateTestData(100000),
    real: realData.slice(0, Math.min(realDataSize, 50000)) // 限制真实数据大小
  };
}

// 基准测试套件
async function runBenchmarks() {
  console.log('🚀 开始性能基准测试...\n');
  
  const dataSets = await createDataSets();
  
  // 测试核心统计函数
  console.log('📊 测试统计计算函数性能:\n');
  
  const testValues = Array.from({length: 10000}, () => Math.random() * 1000);
  
  const statsSuite = new Benchmark.Suite('统计函数性能测试');
  
  statsSuite
    .add('求和 (10K数据)', () => {
      statsCalculators.sum(testValues);
    })
    .add('平均值 (10K数据)', () => {
      statsCalculators.mean(testValues);
    })
    .add('最大值 (10K数据)', () => {
      statsCalculators.max(testValues);
    })
    .add('最小值 (10K数据)', () => {
      statsCalculators.min(testValues);
    })
    .add('中位数 (10K数据)', () => {
      statsCalculators.median(testValues);
    })
    .on('cycle', (event) => {
      console.log(`  ${event.target}`);
    })
    .on('complete', function() {
      console.log(`\n🏆 最快的统计函数: ${this.filter('fastest').map('name')}\n`);
    });
  
  // 测试函数式编程工具
  console.log('🔧 测试函数式编程工具性能:\n');
  
  const fpSuite = new Benchmark.Suite('函数式编程工具测试');
  const testArray = generateTestData(1000);
  
  fpSuite
    .add('分组操作 (1K数据)', () => {
      fp.groupBy(item => item.region, testArray);
    })
    .add('映射操作 (1K数据)', () => {
      fp.map(item => item.value, testArray);
    })
    .add('过滤操作 (1K数据)', () => {
      fp.filter(item => item.value > 500, testArray);
    })
    .add('排序操作 (1K数据)', () => {
      fp.sortBy(item => item.value, testArray);
    })
    .on('cycle', (event) => {
      console.log(`  ${event.target}`);
    })
    .on('complete', function() {
      console.log(`\n🏆 最快的FP工具: ${this.filter('fastest').map('name')}\n`);
    });
  
  // 测试完整统计计算性能
  console.log('🎯 测试完整统计计算性能:\n');
  
  const fullSuite = new Benchmark.Suite('完整统计计算测试');
  
  // 为每个数据集大小创建测试
  for (const [name, data] of Object.entries(dataSets)) {
    const size = data.length;
    fullSuite.add(`完整统计计算 - ${name} (${size.toLocaleString()}条记录)`, () => {
      calculateStatistics(data);
    });
  }
  
  fullSuite
    .on('cycle', (event) => {
      const target = event.target;
      const hz = target.hz;
      const stats = target.stats;
      
      console.log(`  ${target.name}:`);
      console.log(`    速度: ${hz.toFixed(2)} ops/sec`);
      console.log(`    平均耗时: ${(stats.mean * 1000).toFixed(2)}ms`);
      console.log(`    标准差: ±${(stats.deviation * 1000).toFixed(2)}ms`);
      console.log(`    误差: ±${(stats.rme).toFixed(2)}%\n`);
    })
    .on('complete', function() {
      console.log(`🏆 最快的数据集处理: ${this.filter('fastest').map('name')}\n`);
    });
  
  // 内存使用测试
  console.log('💾 内存使用测试:\n');
  
  for (const [name, data] of Object.entries(dataSets)) {
    const initialMemory = process.memoryUsage();
    
    // 执行计算
    const startTime = process.hrtime.bigint();
    const result = calculateStatistics(data);
    const endTime = process.hrtime.bigint();
    
    const finalMemory = process.memoryUsage();
    const executionTime = Number(endTime - startTime) / 1000000; // 转换为毫秒
    
    console.log(`  ${name} 数据集 (${data.length.toLocaleString()}条记录):`);
    console.log(`    执行时间: ${executionTime.toFixed(2)}ms`);
    console.log(`    内存使用: ${((finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024).toFixed(2)}MB`);
    console.log(`    吞吐量: ${(data.length / executionTime * 1000).toFixed(0)} 记录/秒`);
    console.log(`    地区数量: ${Object.keys(result.byRegion).length}`);
    console.log(`    资源类型: ${Object.keys(result.byResource).length}\n`);
    
    // 强制垃圾回收
    if (global.gc) {
      global.gc();
    }
  }
  
  // 数据验证性能测试
  console.log('✅ 数据验证性能测试:\n');
  
  const validationSuite = new Benchmark.Suite('数据验证测试');
  
  for (const [name, data] of Object.entries(dataSets)) {
    if (name === 'xlarge') continue; // 跳过超大数据集以节省时间
    
    validationSuite.add(`数据验证 - ${name} (${data.length.toLocaleString()}条)`, () => {
      validateAndCleanData(data);
    });
  }
  
  validationSuite
    .on('cycle', (event) => {
      console.log(`  ${event.target}`);
    })
    .on('complete', function() {
      console.log(`\n🏆 最快的数据验证: ${this.filter('fastest').map('name')}\n`);
    });
  
  // 生成性能报告
  await generatePerformanceReport(dataSets);
  
  // 运行所有测试套件
  return new Promise((resolve) => {
    statsSuite.run();
    setTimeout(() => {
      fpSuite.run();
      setTimeout(() => {
        fullSuite.run();
        setTimeout(() => {
          validationSuite.run();
          setTimeout(() => {
            console.log('🎉 所有基准测试完成！');
            resolve();
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  });
}

// 生成性能报告
async function generatePerformanceReport(dataSets) {
  const report = {
    testDate: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cpus: (await import('os')).cpus().length,
    totalMemory: (await import('os')).totalmem(),
    results: {}
  };
  
  // 为每个数据集执行详细测试
  for (const [name, data] of Object.entries(dataSets)) {
    console.log(`📈 生成 ${name} 数据集的详细报告...`);
    
    const iterations = name === 'xlarge' ? 1 : 5; // 大数据集减少迭代次数
    const times = [];
    const memoryUsages = [];
    
    for (let i = 0; i < iterations; i++) {
      const initialMemory = process.memoryUsage().heapUsed;
      const startTime = process.hrtime.bigint();
      
      const result = calculateStatistics(data);
      
      const endTime = process.hrtime.bigint();
      const finalMemory = process.memoryUsage().heapUsed;
      
      times.push(Number(endTime - startTime) / 1000000); // 毫秒
      memoryUsages.push((finalMemory - initialMemory) / 1024 / 1024); // MB
      
      if (global.gc) global.gc();
    }
    
    report.results[name] = {
      dataSize: data.length,
      avgTime: times.reduce((a, b) => a + b) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      avgMemory: memoryUsages.reduce((a, b) => a + b) / memoryUsages.length,
      throughput: data.length / (times.reduce((a, b) => a + b) / times.length) * 1000
    };
  }
  
  // 保存报告
  const reportPath = path.join(__dirname, 'performance-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 性能报告已保存到: ${reportPath}\n`);
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 运行基准测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runBenchmarks().catch(console.error);
}

export { runBenchmarks, generateTestData };
