/**
 * 条件消息表达式解析器
 * 
 * 支持的表达式格式：
 * - "completed:story_01" - 检查是否完成指定关卡
 * - "!completed:story_01" - 检查是否未完成指定关卡
 * - "progress>5" - 检查进度是否大于指定值
 * - "progress>=10" - 检查进度是否大于等于指定值
 * - "synced:clue_key" - 检查是否已同步指定线索
 * - "all:completed:story_01,completed:story_02" - 多条件 AND
 * - "any:completed:story_01,completed:story_02" - 多条件 OR
 */

export interface ConditionContext {
  completedCases: string[];
  clueSyncList: string[];
  progress: number;
}

/**
 * 解析并评估单个条件表达式
 */
function evaluateSingleCondition(
  condition: string,
  context: ConditionContext
): boolean {
  const trimmed = condition.trim();
  
  // 检查否定
  if (trimmed.startsWith('!')) {
    return !evaluateSingleCondition(trimmed.slice(1), context);
  }
  
  // completed:case_id - 检查关卡完成
  if (trimmed.startsWith('completed:')) {
    const caseId = trimmed.slice('completed:'.length);
    return context.completedCases.includes(caseId);
  }
  
  // synced:clue_key - 检查线索同步
  if (trimmed.startsWith('synced:')) {
    const clueKey = trimmed.slice('synced:'.length);
    return context.clueSyncList.includes(clueKey);
  }
  
  // progress>N 或 progress>=N 或 progress<N 或 progress<=N
  const progressMatch = trimmed.match(/^progress\s*(>=|<=|>|<|=)\s*(\d+)$/);
  if (progressMatch) {
    const operator = progressMatch[1];
    const value = parseInt(progressMatch[2], 10);
    
    switch (operator) {
      case '>': return context.progress > value;
      case '>=': return context.progress >= value;
      case '<': return context.progress < value;
      case '<=': return context.progress <= value;
      case '=': return context.progress === value;
    }
  }
  
  // 未知条件，默认为 true（显示消息）
  console.warn(`Unknown condition: ${trimmed}`);
  return true;
}

/**
 * 解析并评估条件表达式
 */
export function evaluateCondition(
  condition: string | undefined,
  context: ConditionContext
): boolean {
  if (!condition) return true;
  
  const trimmed = condition.trim();
  
  // all:cond1,cond2,... - 所有条件都满足
  if (trimmed.startsWith('all:')) {
    const conditions = trimmed.slice('all:'.length).split(',');
    return conditions.every((c) => evaluateSingleCondition(c, context));
  }
  
  // any:cond1,cond2,... - 任一条件满足
  if (trimmed.startsWith('any:')) {
    const conditions = trimmed.slice('any:'.length).split(',');
    return conditions.some((c) => evaluateSingleCondition(c, context));
  }
  
  // 单个条件
  return evaluateSingleCondition(trimmed, context);
}
