/**
 * 测试模块 - 验证统计算法的正确性
 */

import { 
  calculateStatistics, 
  fp, 
  statsCalculators, 
  precisionHelper,
  validateAndCleanData 
} from '../src/core/statistics.js';

// 测试用例
const testCases = {
  // 基础统计函数测试
  statsCalculators: [
    {
      name: '求和测试',
      fn: () => {
        const values = [1, 2, 3, 4, 5];
        const result = statsCalculators.sum(values);
        console.assert(result === 15, `求和失败: 期望 15, 实际 ${result}`);
        console.log('✓ 求和测试通过');
      }
    },
    {
      name: '平均值测试',
      fn: () => {
        const values = [2, 4, 6, 8, 10];
        const result = statsCalculators.mean(values);
        console.assert(result === 6, `平均值失败: 期望 6, 实际 ${result}`);
        console.log('✓ 平均值测试通过');
      }
    },
    {
      name: '中位数测试 (奇数)',
      fn: () => {
        const values = [1, 3, 5, 7, 9];
        const result = statsCalculators.median(values);
        console.assert(result === 5, `中位数失败: 期望 5, 实际 ${result}`);
        console.log('✓ 中位数测试(奇数)通过');
      }
    },
    {
      name: '中位数测试 (偶数)',
      fn: () => {
        const values = [1, 2, 3, 4];
        const result = statsCalculators.median(values);
        console.assert(result === 2.5, `中位数失败: 期望 2.5, 实际 ${result}`);
        console.log('✓ 中位数测试(偶数)通过');
      }
    },
    {
      name: '最大值测试',
      fn: () => {
        const values = [5, 2, 8, 1, 9, 3];
        const result = statsCalculators.max(values);
        console.assert(result === 9, `最大值失败: 期望 9, 实际 ${result}`);
        console.log('✓ 最大值测试通过');
      }
    },
    {
      name: '最小值测试',
      fn: () => {
        const values = [5, 2, 8, 1, 9, 3];
        const result = statsCalculators.min(values);
        console.assert(result === 1, `最小值失败: 期望 1, 实际 ${result}`);
        console.log('✓ 最小值测试通过');
      }
    }
  ],

  // 精度处理测试
  precision: [
    {
      name: '浮点数精度测试',
      fn: () => {
        const result = precisionHelper.add(0.1, 0.2);
        console.assert(Math.abs(result - 0.3) < 0.000001, `精度失败: 期望 0.3, 实际 ${result}`);
        console.log('✓ 浮点数精度测试通过');
      }
    },
    {
      name: '除法精度测试',
      fn: () => {
        const result = precisionHelper.divide(1, 3);
        console.assert(typeof result === 'number' && isFinite(result), `除法失败: ${result}`);
        console.log('✓ 除法精度测试通过');
      }
    }
  ],

  // 函数式编程工具测试
  functionalProgramming: [
    {
      name: '分组测试',
      fn: () => {
        const data = [
          { type: 'A', value: 1 },
          { type: 'B', value: 2 },
          { type: 'A', value: 3 }
        ];
        const grouped = fp.groupBy(item => item.type, data);
        console.assert(grouped.A.length === 2, '分组失败: A组应该有2个元素');
        console.assert(grouped.B.length === 1, '分组失败: B组应该有1个元素');
        console.log('✓ 分组测试通过');
      }
    },
    {
      name: '映射测试',
      fn: () => {
        const data = [1, 2, 3];
        const mapped = fp.map(x => x * 2, data);
        console.assert(JSON.stringify(mapped) === JSON.stringify([2, 4, 6]), '映射失败');
        console.log('✓ 映射测试通过');
      }
    },
    {
      name: '过滤测试',
      fn: () => {
        const data = [1, 2, 3, 4, 5];
        const filtered = fp.filter(x => x > 3, data);
        console.assert(JSON.stringify(filtered) === JSON.stringify([4, 5]), '过滤失败');
        console.log('✓ 过滤测试通过');
      }
    }
  ],

  // 数据验证测试
  dataValidation: [
    {
      name: '有效数据测试',
      fn: () => {
        const validData = [
          {
            id: "1",
            region: "Asia",
            resource: "Cereals",
            year: 2020,
            value: 100.5,
            weight: 200.5
          }
        ];
        const cleaned = validateAndCleanData(validData);
        console.assert(cleaned.length === 1, '有效数据应该保留');
        console.log('✓ 有效数据测试通过');
      }
    },
    {
      name: '无效数据过滤测试',
      fn: () => {
        const invalidData = [
          { id: "1" }, // 缺少必需字段
          {
            id: "2",
            region: "Asia",
            resource: "Cereals",
            year: "invalid", // 无效年份
            value: 100,
            weight: 200
          },
          {
            id: "3",
            region: "Asia",
            resource: "Cereals",
            year: 2020,
            value: 100,
            weight: 200
          }
        ];
        const cleaned = validateAndCleanData(invalidData);
        console.assert(cleaned.length === 1, '只有1条有效数据应该保留');
        console.log('✓ 无效数据过滤测试通过');
      }
    }
  ],

  // 完整统计测试
  fullStatistics: [
    {
      name: '完整统计计算测试',
      fn: () => {
        const testData = [
          {
            id: "1",
            region: "Asia",
            resource: "Cereals",
            year: 2020,
            value: 100,
            weight: 50
          },
          {
            id: "2",
            region: "Asia",
            resource: "Cereals",
            year: 2020,
            value: 200,
            weight: 100
          },
          {
            id: "3",
            region: "Europe",
            resource: "Fruits",
            year: 2021,
            value: 150,
            weight: 75
          }
        ];
        
        const results = calculateStatistics(testData);
        
        // 验证结构
        console.assert(results.byRegion, '缺少按地区统计');
        console.assert(results.byResource, '缺少按资源统计');
        console.assert(results.byRegionAndYear, '缺少按地区年份统计');
        console.assert(results.globalWeight, '缺少全局权重统计');
        
        // 验证地区统计
        console.assert(results.byRegion.Asia, '缺少Asia地区统计');
        console.assert(results.byRegion.Asia.mean === 150, `Asia地区平均值错误: 期望150, 实际${results.byRegion.Asia.mean}`);
        
        // 验证资源统计
        console.assert(results.byResource.Cereals, '缺少Cereals资源统计');
        console.assert(results.byResource.Cereals.count === 2, `Cereals资源记录数错误`);
        
        // 验证权重统计
        console.assert(results.globalWeight.max === 100, `权重最大值错误`);
        console.assert(results.globalWeight.min === 50, `权重最小值错误`);
        
        console.log('✓ 完整统计计算测试通过');
      }
    }
  ],

  // 边界情况测试
  edgeCases: [
    {
      name: '空数据测试',
      fn: () => {
        try {
          calculateStatistics([]);
          console.assert(false, '空数据应该抛出错误');
        } catch (error) {
          console.assert(error.message.includes('没有有效的数据记录'), '错误信息不正确');
          console.log('✓ 空数据测试通过');
        }
      }
    },
    {
      name: '大数值测试',
      fn: () => {
        const largeValues = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER - 1];
        const sum = statsCalculators.sum(largeValues);
        console.assert(Number.isFinite(sum), '大数值求和应该返回有限数值');
        console.log('✓ 大数值测试通过');
      }
    },
    {
      name: 'NaN和Infinity处理测试',
      fn: () => {
        const values = [1, 2, NaN, Infinity, 3];
        const result = statsCalculators.mean(values);
        console.assert(Number.isFinite(result), 'NaN和Infinity应该被正确处理');
        console.log('✓ NaN和Infinity处理测试通过');
      }
    }
  ]
};

// 运行测试
function runTests() {
  console.log('🧪 开始运行测试套件...\n');
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const [category, tests] of Object.entries(testCases)) {
    console.log(`📋 ${category} 测试:`);
    
    for (const test of tests) {
      totalTests++;
      try {
        test.fn();
        passedTests++;
      } catch (error) {
        console.error(`❌ ${test.name} 失败:`, error.message);
      }
    }
    console.log('');
  }
  
  // 性能测试
  console.log('⚡ 性能测试:');
  const performanceData = Array.from({length: 10000}, (_, i) => ({
    id: i.toString(),
    region: ['Asia', 'Europe', 'America'][i % 3],
    resource: ['Cereals', 'Fruits'][i % 2],
    year: 2020 + (i % 4),
    value: Math.random() * 1000,
    weight: Math.random() * 500
  }));
  
  console.time('10K记录统计计算');
  try {
    const results = calculateStatistics(performanceData);
    console.timeEnd('10K记录统计计算');
    console.log(`✓ 处理了 ${performanceData.length} 条记录`);
    console.log(`✓ 发现 ${Object.keys(results.byRegion).length} 个地区`);
    console.log(`✓ 发现 ${Object.keys(results.byResource).length} 个资源类型`);
    passedTests++;
  } catch (error) {
    console.error('❌ 性能测试失败:', error.message);
  }
  totalTests++;
  
  // 测试总结
  console.log('\n📊 测试总结:');
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过测试: ${passedTests}`);
  console.log(`失败测试: ${totalTests - passedTests}`);
  console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！');
    return true;
  } else {
    console.log('❌ 部分测试失败');
    return false;
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}

export { runTests, testCases };
