#!/usr/bin/env node

/**
 * Node CLI 数据统计程序
 * 支持命令行参数，提供美观的输出格式
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateStatistics } from '../core/statistics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

// CLI 配置
program
  .name('data-stats')
  .description('高性能数据统计分析工具')
  .version('1.0.0');

program
  .argument('<file>', '要分析的JSON数据文件路径')
  .option('-o, --output <file>', '输出结果到文件')
  .option('-f, --format <type>', '输出格式 (json|table|summary)', 'table')
  .option('-v, --verbose', '显示详细信息')
  .option('--no-color', '禁用颜色输出')
  .action(async (file, options) => {
    await runAnalysis(file, options);
  });

// 主要分析函数
async function runAnalysis(filePath, options) {
  const spinner = ora('正在启动数据分析...').start();
  
  try {
    // 验证文件路径
    const fullPath = path.resolve(filePath);
    
    spinner.text = '正在读取数据文件...';
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    
    spinner.text = '正在解析JSON数据...';
    let data;
    try {
      data = JSON.parse(fileContent);
      // 处理嵌套的 nodes 结构
      if (data.nodes && Array.isArray(data.nodes)) {
        data = data.nodes;
      }
    } catch (error) {
      spinner.fail('JSON 文件格式错误');
      console.error(chalk.red('错误:'), error.message);
      process.exit(1);
    }
    
    spinner.text = `正在分析 ${data.length.toLocaleString()} 条数据记录...`;
    
    // 执行统计计算
    console.time('计算耗时');
    const results = calculateStatistics(data);
    console.timeEnd('计算耗时');
    
    spinner.succeed('数据分析完成!');
    
    // 输出结果
    await outputResults(results, options, data.length);
    
  } catch (error) {
    spinner.fail('分析失败');
    
    if (error.code === 'ENOENT') {
      console.error(chalk.red('错误:'), `文件不存在: ${filePath}`);
    } else if (error.code === 'EACCES') {
      console.error(chalk.red('错误:'), `没有权限读取文件: ${filePath}`);
    } else {
      console.error(chalk.red('错误:'), error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
    }
    process.exit(1);
  }
}

// 输出结果
async function outputResults(results, options, totalRecords) {
  const output = formatOutput(results, options.format, totalRecords);
  
  if (options.output) {
    try {
      await fs.writeFile(options.output, output);
      console.log(chalk.green('✓'), `结果已保存到: ${options.output}`);
    } catch (error) {
      console.error(chalk.red('保存失败:'), error.message);
    }
  } else {
    console.log(output);
  }
}

// 格式化输出
function formatOutput(results, format, totalRecords) {
  switch (format) {
    case 'json':
      return JSON.stringify(results, null, 2);
    
    case 'summary':
      return formatSummary(results, totalRecords);
    
    case 'table':
    default:
      return formatTable(results, totalRecords);
  }
}

// 表格格式输出
function formatTable(results, totalRecords) {
  let output = '';
  
  // 标题
  output += chalk.bold.blue('\n📊 数据统计分析报告\n');
  output += chalk.gray('='.repeat(60)) + '\n';
  output += chalk.yellow(`总记录数: ${totalRecords.toLocaleString()}\n\n`);
  
  // 按地区统计
  output += chalk.bold.green('🌍 按地区统计\n');
  output += chalk.gray('-'.repeat(40)) + '\n';
  for (const [region, stats] of Object.entries(results.byRegion)) {
    output += formatStatsSection(region, stats);
  }
  
  // 按资源统计
  output += chalk.bold.green('\n🌾 按资源类型统计\n');
  output += chalk.gray('-'.repeat(40)) + '\n';
  for (const [resource, stats] of Object.entries(results.byResource)) {
    output += formatStatsSection(resource, stats);
  }
  
  // 全局权重统计
  output += chalk.bold.green('\n⚖️  全局权重统计\n');
  output += chalk.gray('-'.repeat(40)) + '\n';
  output += chalk.cyan('最大值: ') + chalk.white(results.globalWeight.max.toLocaleString()) + '\n';
  output += chalk.cyan('最小值: ') + chalk.white(results.globalWeight.min.toLocaleString()) + '\n';
  output += chalk.cyan('中位数: ') + chalk.white(results.globalWeight.median.toLocaleString()) + '\n';
  
  // 按地区和年份统计（简化显示）
  output += chalk.bold.green('\n📅 按地区和年份统计 (前5个地区)\n');
  output += chalk.gray('-'.repeat(40)) + '\n';
  const regions = Object.keys(results.byRegionAndYear).slice(0, 5);
  for (const region of regions) {
    output += chalk.magenta(`${region}:\n`);
    const years = Object.keys(results.byRegionAndYear[region]).sort().slice(-3); // 最近3年
    for (const year of years) {
      const stats = results.byRegionAndYear[region][year];
      output += `  ${year}: 平均 ${stats.mean.toFixed(2)}, 总和 ${stats.sum.toLocaleString()}\n`;
    }
  }
  
  return output;
}

// 格式化统计区域
function formatStatsSection(title, stats) {
  let section = chalk.magenta(`${title}:\n`);
  section += `  平均值: ${chalk.white(stats.mean.toFixed(2))}\n`;
  section += `  最大值: ${chalk.white(stats.max.toLocaleString())}\n`;
  section += `  最小值: ${chalk.white(stats.min.toLocaleString())}\n`;
  section += `  中位数: ${chalk.white(stats.median.toLocaleString())}\n`;
  section += `  总和:   ${chalk.white(stats.sum.toLocaleString())}\n`;
  section += `  记录数: ${chalk.white(stats.count.toLocaleString())}\n\n`;
  return section;
}

// 摘要格式输出
function formatSummary(results, totalRecords) {
  let output = '';
  
  output += '📊 数据统计摘要\n';
  output += `总记录数: ${totalRecords.toLocaleString()}\n`;
  output += `地区数量: ${Object.keys(results.byRegion).length}\n`;
  output += `资源类型: ${Object.keys(results.byResource).length}\n`;
  output += `权重范围: ${results.globalWeight.min.toLocaleString()} - ${results.globalWeight.max.toLocaleString()}\n`;
  
  // 最大值地区
  const maxRegion = Object.entries(results.byRegion)
    .reduce((max, [region, stats]) => stats.max > max.stats.max ? {region, stats} : max, 
            {region: '', stats: {max: -Infinity}});
  output += `最高值地区: ${maxRegion.region} (${maxRegion.stats.max.toLocaleString()})\n`;
  
  return output;
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('未处理的Promise拒绝:'), reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('未捕获的异常:'), error.message);
  process.exit(1);
});

// 运行程序
program.parse();
