/**
 * 使用示例演示
 * 展示如何使用数据统计系统的各种功能
 */

import { calculateStatistics } from '../src/core/statistics.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 生成示例数据
function generateSampleData(size = 1000) {
    const regions = [
        'Asia', 'Europe', 'North America', 'South America',
        'Africa', 'Oceania', 'Middle East'
    ];
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
            value: Math.random() * 10000 + 100,
            weight: Math.random() * 5000 + 50
        });
    }

    return data;
}

// 演示基本用法
async function basicUsageDemo() {
    console.log('🚀 基本用法演示\n');

    // 生成示例数据
    const sampleData = generateSampleData(100);
    console.log(`📊 生成了 ${sampleData.length} 条示例数据`);

    // 执行统计分析
    console.time('统计计算耗时');
    const results = calculateStatistics(sampleData);
    console.timeEnd('统计计算耗时');

    // 显示结果摘要
    console.log('\n📈 统计结果摘要:');
    console.log(`地区数量: ${Object.keys(results.byRegion).length}`);
    console.log(`资源类型: ${Object.keys(results.byResource).length}`);
    console.log(`权重范围: ${results.globalWeight.min.toFixed(2)} - ${results.globalWeight.max.toFixed(2)}`);

    // 显示最高价值地区
    const topRegion = Object.entries(results.byRegion)
        .reduce((max, [region, stats]) =>
            stats.max > max.value ? { region, value: stats.max } : max,
            { region: '', value: -Infinity }
        );
    console.log(`最高价值地区: ${topRegion.region} (${topRegion.value.toLocaleString()})`);

    return results;
}

// 演示性能测试
async function performanceDemo() {
    console.log('\n⚡ 性能测试演示\n');

    const sizes = [1000, 5000, 10000, 20000];

    for (const size of sizes) {
        console.log(`📊 测试 ${size.toLocaleString()} 条记录:`);

        const data = generateSampleData(size);
        const startMemory = process.memoryUsage().heapUsed;

        console.time(`  计算耗时`);
        const results = calculateStatistics(data);
        console.timeEnd(`  计算耗时`);

        const endMemory = process.memoryUsage().heapUsed;
        const memoryUsed = (endMemory - startMemory) / 1024 / 1024;

        console.log(`  内存使用: ${memoryUsed.toFixed(2)}MB`);
        console.log(`  地区数量: ${Object.keys(results.byRegion).length}`);
        console.log(`  资源类型: ${Object.keys(results.byResource).length}`);
        console.log('');
    }
}

// 演示真实数据处理
async function realDataDemo() {
    console.log('🔬 真实数据处理演示\n');

    try {
        const dataPath = path.join(__dirname, '../demo.json');
        const content = await fs.readFile(dataPath, 'utf-8');
        const rawData = JSON.parse(content);
        const data = rawData.nodes || rawData;

        console.log(`📂 加载真实数据: ${data.length} 条记录`);

        console.time('真实数据处理耗时');
        const results = calculateStatistics(data);
        console.timeEnd('真实数据处理耗时');

        console.log('\n📊 真实数据统计结果:');
        console.log(`有效地区数: ${Object.keys(results.byRegion).length}`);
        console.log(`资源类型数: ${Object.keys(results.byResource).length}`);

        // 显示各地区记录数
        console.log('\n🌍 各地区记录分布:');
        Object.entries(results.byRegion)
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 5)
            .forEach(([region, stats]) => {
                console.log(`  ${region}: ${stats.count} 条记录, 平均值 ${stats.mean.toFixed(2)}`);
            });

        return results;

    } catch (error) {
        console.error('❌ 无法加载真实数据:', error.message);
        console.log('💡 请确保 demo.json 文件存在');
    }
}

// 演示API调用
async function apiDemo() {
    console.log('\n🌐 API 调用演示\n');

    const sampleData = generateSampleData(500);

    try {
        const response = await fetch('http://localhost:3000/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: sampleData })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ API 调用成功');
            console.log(`📊 处理了 ${result.meta.totalRecords} 条记录`);
            console.log(`🕐 处理时间: ${result.meta.processedAt}`);

            // 显示部分结果
            const regions = Object.keys(result.data.byRegion);
            console.log(`🌍 发现 ${regions.length} 个地区: ${regions.slice(0, 3).join(', ')}${regions.length > 3 ? '...' : ''}`);

        } else {
            console.error('❌ API 调用失败:', response.statusText);
        }

    } catch (error) {
        console.warn('⚠️  Web 服务器未运行，跳过 API 演示');
        console.log('💡 运行 "npm run dev" 启动服务器后重试');
    }
}

// 主演示函数
async function runDemo() {
    console.log('🎯 数据统计系统功能演示');
    console.log('='.repeat(50));

    try {
        // 基本用法演示
        await basicUsageDemo();

        // 性能测试演示
        await performanceDemo();

        // 真实数据演示
        await realDataDemo();

        // API 调用演示
        await apiDemo();

        console.log('\n🎉 演示完成！');
        console.log('\n💡 使用建议:');
        console.log('  • Web 端: 运行 "npm run dev" 并访问 http://localhost:3000');
        console.log('  • CLI 端: 运行 "npm run cli demo.json"');
        console.log('  • 性能测试: 运行 "npm run benchmark"');

    } catch (error) {
        console.error('❌ 演示过程中发生错误:', error.message);
    }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
    runDemo().catch(console.error);
}

export { generateSampleData, runDemo };
