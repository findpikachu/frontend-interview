

const precisionHelper = {
  round: (num, precision = 6) => {
    if (typeof num !== 'number' || !Number.isFinite(num)) return 0;
    return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
  },
  
  add: (a, b) => {
    if (!Number.isFinite(a)) a = 0;
    if (!Number.isFinite(b)) b = 0;
    return precisionHelper.round(a + b);
  },
  
  divide: (a, b) => {
    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return 0;
    return precisionHelper.round(a / b);
  }
};

const fp = {};

fp.curry = (fn) => (...args) => 
  args.length >= fn.length ? fn(...args) : (...nextArgs) => fp.curry(fn)(...args, ...nextArgs);

fp.pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);

fp.compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);

fp.groupBy = fp.curry((keyFn, array) => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
});

fp.map = fp.curry((fn, array) => array.map(fn));

fp.filter = fp.curry((predicate, array) => array.filter(predicate));

fp.sortBy = fp.curry((keyFn, array) => [...array].sort((a, b) => {
  const aVal = keyFn(a);
  const bVal = keyFn(b);
  return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
}));

// 统计计算函数
const statsCalculators = {
  // 计算总和
  sum: (values) => values.reduce((acc, val) => precisionHelper.add(acc, val), 0),
  
  // 计算平均值
  mean: (values) => {
    if (values.length === 0) return 0;
    return precisionHelper.divide(statsCalculators.sum(values), values.length);
  },
  
  // 计算最大值
  max: (values) => values.length === 0 ? 0 : Math.max(...values.filter(Number.isFinite)),
  
  // 计算最小值
  min: (values) => values.length === 0 ? 0 : Math.min(...values.filter(Number.isFinite)),
  
  // 计算中位数
  median: (values) => {
    if (values.length === 0) return 0;
    const sorted = [...values].filter(Number.isFinite).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? precisionHelper.divide(precisionHelper.add(sorted[mid - 1], sorted[mid]), 2)
      : sorted[mid];
  }
};

// 创建统计摘要
const createStatsSummary = (values) => ({
  sum: statsCalculators.sum(values),
  mean: statsCalculators.mean(values),
  max: statsCalculators.max(values),
  min: statsCalculators.min(values),
  median: statsCalculators.median(values),
  count: values.length
});

// 数据验证和清洗
const validateAndCleanData = (data) => {
  if (!Array.isArray(data)) {
    throw new Error('数据必须是数组格式');
  }
  
  return data.filter(item => {
    // 检查必需字段
    const requiredFields = ['id', 'region', 'resource', 'year', 'value', 'weight'];
    const hasAllFields = requiredFields.every(field => 
      item.hasOwnProperty(field) && item[field] !== null && item[field] !== undefined
    );
    
    if (!hasAllFields) return false;
    
    // 验证数值字段
    const numericFields = ['year', 'value', 'weight'];
    const hasValidNumbers = numericFields.every(field => {
      const val = Number(item[field]);
      return Number.isFinite(val) && !isNaN(val);
    });
    
    return hasValidNumbers;
  });
};

// 性能优化的分组函数
const performantGroupBy = (data, keyExtractor) => {
  const groups = new Map();
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const key = keyExtractor(item);
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  }
  
  return groups;
};

// 主要统计函数
export const calculateStatistics = (rawData) => {
  console.time('数据清洗');
  const cleanData = validateAndCleanData(rawData);
  console.timeEnd('数据清洗');
  
  if (cleanData.length === 0) {
    throw new Error('没有有效的数据记录');
  }
  
  console.log(`处理 ${cleanData.length} 条有效记录`);
  
  const results = {};
  
  // 1. 按 region 分组统计
  console.time('按region分组统计');
  const regionGroups = performantGroupBy(cleanData, item => item.region);
  results.byRegion = {};
  
  for (const [region, items] of regionGroups) {
    const values = items.map(item => Number(item.value));
    results.byRegion[region] = createStatsSummary(values);
  }
  console.timeEnd('按region分组统计');
  
  // 2. 按 region 和年份分组统计
  console.time('按region和年份分组统计');
  const regionYearGroups = performantGroupBy(
    cleanData, 
    item => `${item.region}|${item.year}`
  );
  results.byRegionAndYear = {};
  
  for (const [key, items] of regionYearGroups) {
    const [region, year] = key.split('|');
    if (!results.byRegionAndYear[region]) {
      results.byRegionAndYear[region] = {};
    }
    const values = items.map(item => Number(item.value));
    results.byRegionAndYear[region][year] = createStatsSummary(values);
  }
  console.timeEnd('按region和年份分组统计');
  
  // 3. 按 resource 分组统计
  console.time('按resource分组统计');
  const resourceGroups = performantGroupBy(cleanData, item => item.resource);
  results.byResource = {};
  
  for (const [resource, items] of resourceGroups) {
    const values = items.map(item => Number(item.value));
    results.byResource[resource] = createStatsSummary(values);
  }
  console.timeEnd('按resource分组统计');
  
  // 4. 全局 weight 统计
  console.time('全局weight统计');
  const allWeights = cleanData.map(item => Number(item.weight));
  results.globalWeight = {
    max: statsCalculators.max(allWeights),
    min: statsCalculators.min(allWeights),
    median: statsCalculators.median(allWeights)
  };
  console.timeEnd('全局weight统计');
  
  return results;
};

// 流式处理大数据集
export const calculateStatisticsStream = async (dataStream, chunkSize = 10000) => {
  const stats = {
    byRegion: new Map(),
    byRegionAndYear: new Map(),
    byResource: new Map(),
    weights: []
  };
  
  let processedCount = 0;
  
  for await (const chunk of dataStream) {
    const cleanChunk = validateAndCleanData(chunk);
    
    // 增量更新统计
    for (const item of cleanChunk) {
      const value = Number(item.value);
      const weight = Number(item.weight);
      
      // 更新region统计
      if (!stats.byRegion.has(item.region)) {
        stats.byRegion.set(item.region, []);
      }
      stats.byRegion.get(item.region).push(value);
      
      // 更新resource统计
      if (!stats.byResource.has(item.resource)) {
        stats.byResource.set(item.resource, []);
      }
      stats.byResource.get(item.resource).push(value);
      
      // 收集weight
      stats.weights.push(weight);
      
      processedCount++;
    }
    
    // 内存管理：定期清理权重数组
    if (stats.weights.length > 100000) {
      stats.weights.sort((a, b) => a - b);
      const median = statsCalculators.median(stats.weights);
      stats.weights = [median]; // 保留中位数，清理其他数据
    }
  }
  
  // 最终计算结果
  const results = {
    byRegion: {},
    byResource: {},
    globalWeight: {
      max: statsCalculators.max(stats.weights),
      min: statsCalculators.min(stats.weights),
      median: statsCalculators.median(stats.weights)
    }
  };
  
  for (const [region, values] of stats.byRegion) {
    results.byRegion[region] = createStatsSummary(values);
  }
  
  for (const [resource, values] of stats.byResource) {
    results.byResource[resource] = createStatsSummary(values);
  }
  
  return results;
};

export { fp, statsCalculators, precisionHelper, validateAndCleanData };
