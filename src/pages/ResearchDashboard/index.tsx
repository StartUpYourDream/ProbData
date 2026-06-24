import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getAiBubbleData, getAiFinancialData, getCryptoCycleData, marketSignalFormatters } from '../../api/marketSignals'
import type { AiBubbleData, AiFinancialSnapshot, CryptoCycleData, DataSourceStatus, MacroSignal, SignalIndicator } from '../../api/marketSignals'

type ResearchTab = 'ai' | 'crypto'
type MetricStatus = 'green' | 'yellow' | 'red' | 'pending' | 'neutral'
type Severity = 'low' | 'medium' | 'high' | 'critical'
type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'All'

interface ResearchDashboardProps {
  initialTab?: ResearchTab
}

type PageData = AiBubbleData | CryptoCycleData

interface ResearchMetric {
  id: string
  name: string
  category: string
  score: number
  currentValue: string
  weeklyChange: string
  monthlyChange: string
  threshold: string
  status: MetricStatus
  source: string
  updatedAt: string
  description: string
  interpretation: string
  notes?: string
}

interface ChartFrameProps {
  height: number
  children: (width: number, height: number) => ReactNode
}

interface ResearchModule {
  title: string
  summary: string
  metrics: ResearchMetric[]
}

interface ResearchTrigger {
  id: string
  title: string
  probability: string
  impact: Severity
  status: MetricStatus
  tracking: string
  action: string
}

interface ResearchAlert {
  id: string
  title: string
  severity: Severity
  currentValue: string
  threshold: string
  explanation: string
  action: string
}

interface PendingItem {
  id: string
  name: string
  source: string
  threshold: string
}

interface CycleTimingCard {
  id: string
  title: string
  value: string
  detail: string
  status: MetricStatus
  hint: string
}

interface CycleMapSegment {
  id: string
  label: string
  subLabel: string
  start: string
  end: string
  colorClass: string
  textClass: string
}

interface CycleMapMarker {
  id: string
  label: string
  date: string
  position: number
  tone: MetricStatus
}

interface CycleMapTick {
  id: string
  label: string
  date: string
  position: number
}

interface CycleConfirmItem {
  id: string
  label: string
  value: string
  passed: boolean
  progress: number
  status: MetricStatus
}

interface CryptoSignalLight {
  id: string
  title: string
  verdict: string
  value: string
  detail: string
  status: MetricStatus
  progress: number
  lowLabel: string
  highLabel: string
}

interface AiSignalLight {
  id: string
  title: string
  verdict: string
  value: string
  detail: string
  status: MetricStatus
  progress: number
  lowLabel: string
  highLabel: string
}

interface AiChainLayer {
  id: string
  title: string
  subtitle: string
  symbols: string
  heat: number
  verdict: string
  status: MetricStatus
  detail: string
}

interface AiCapitalCard {
  id: string
  title: string
  verdict: string
  value: string
  detail: string
  status: MetricStatus
  progress: number
  lowLabel: string
  highLabel: string
}

interface CycleMapData {
  startDate: string
  endDate: string
  nowPosition: number
  currentPhase: string
  currentAction: string
  currentDetail: string
  nextTurnLabel: string
  nextTurnDate: string
  bottomWindow: string
  bullConfirmWindow: string
  bearTurnWindow: string
  bottomProgress: number
  heatPosition: number
  confirmationCount: number
  confirmItems: CycleConfirmItem[]
  segments: CycleMapSegment[]
  markers: CycleMapMarker[]
  yearTicks: CycleMapTick[]
}

const statusStyles: Record<MetricStatus, string> = {
  green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  yellow: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  red: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  pending: 'border-gray-500/30 bg-gray-500/10 text-gray-400',
  neutral: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
}

const severityStyles: Record<Severity, string> = {
  low: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  high: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  critical: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
}

const ranges: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y', 'All']
const rangeDays: Record<TimeRange, number | null> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  All: null,
}
const chartColors = ['#38bdf8', '#34d399', '#f59e0b', '#f43f5e', '#a78bfa']

function scoreRiskStatus(value: number) {
  if (value >= 85) return 'red'
  if (value >= 70) return 'yellow'
  if (value >= 50) return 'neutral'
  return 'green'
}

function statusScore(status: MetricStatus) {
  if (status === 'red') return 90
  if (status === 'yellow') return 70
  if (status === 'neutral') return 50
  if (status === 'pending') return 0
  return 25
}

function statusText(status: MetricStatus) {
  if (status === 'red') return '危险'
  if (status === 'yellow') return '注意'
  if (status === 'neutral') return '观察'
  if (status === 'pending') return '未接入'
  return '正常'
}

function statusPlainText(status: MetricStatus) {
  if (status === 'red') return '红色 = 风险高，优先减仓或防御'
  if (status === 'yellow') return '黄色 = 有压力，先观察，不追高'
  if (status === 'neutral') return '蓝色 = 中性，方向还没完全确认'
  if (status === 'pending') return '灰色 = 暂无可靠数据，不参与评分'
  return '绿色 = 风险低，可以按计划参与'
}

function severityText(severity: Severity) {
  if (severity === 'critical') return '极高'
  if (severity === 'high') return '高'
  if (severity === 'medium') return '中'
  return '低'
}

function severityPlainText(severity: Severity) {
  if (severity === 'critical') return '极高影响 = 一旦触发，需要优先防御'
  if (severity === 'high') return '高影响 = 会明显改变仓位判断'
  if (severity === 'medium') return '中影响 = 需要降低追高和杠杆'
  return '低影响 = 继续观察即可'
}

function scoreBand(score: number) {
  if (score >= 85) return { label: '高危', text: '红色', status: 'red' as MetricStatus }
  if (score >= 70) return { label: '偏高', text: '黄色', status: 'yellow' as MetricStatus }
  if (score >= 50) return { label: '观察', text: '蓝色', status: 'neutral' as MetricStatus }
  return { label: '正常', text: '绿色', status: 'green' as MetricStatus }
}

function overallScoreBand(type: ResearchTab, score: number, strategy: string) {
  if (type === 'crypto' && strategy === '等待流动性确认') {
    return { label: '流动性弱', text: '黄色', status: 'yellow' as MetricStatus }
  }
  return scoreBand(score)
}

function simpleDecision(type: ResearchTab, score: number, strategy: string) {
  if (type === 'crypto' && strategy === '等待流动性确认') return '等待流动性确认'
  if (type === 'ai' && score >= 68) return '泡沫风险升高'
  if (score >= 85) return '进入防御'
  if (score >= 70) return '谨慎参与'
  if (score >= 50) return '边走边看'
  return '可以参与'
}

function exactDate(value: string) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function exactDateRange(start: string, end: string) {
  return `${exactDate(start)} 至 ${exactDate(end)}`
}

function addCycleDays(date: string, days: number) {
  const target = new Date(`${date}T00:00:00Z`)
  target.setUTCDate(target.getUTCDate() + days)
  return target.toISOString().slice(0, 10)
}

function todayUtcDate() {
  return new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z')
}

function daysUntil(date: string) {
  const target = new Date(`${date}T00:00:00Z`)
  return Math.ceil((target.getTime() - todayUtcDate().getTime()) / (24 * 60 * 60 * 1000))
}

function inDateWindow(start: string, end: string) {
  const now = todayUtcDate().getTime()
  return now >= new Date(`${start}T00:00:00Z`).getTime() && now <= new Date(`${end}T00:00:00Z`).getTime()
}

function beforeDate(date: string) {
  return todayUtcDate().getTime() < new Date(`${date}T00:00:00Z`).getTime()
}

function afterDate(date: string) {
  return todayUtcDate().getTime() > new Date(`${date}T00:00:00Z`).getTime()
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value))
}

function positionBetween(date: string, start: string, end: string) {
  const startTime = new Date(`${start}T00:00:00Z`).getTime()
  const endTime = new Date(`${end}T00:00:00Z`).getTime()
  const targetTime = new Date(`${date}T00:00:00Z`).getTime()
  if (endTime <= startTime) return 0
  return clampPercent((targetTime - startTime) / (endTime - startTime) * 100)
}

function compactDate(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function scoreLabel(type: ResearchTab, score: number) {
  if (type === 'ai') {
    if (score >= 82) return '狂热泡沫'
    if (score >= 68) return '泡沫预警'
    if (score >= 50) return '升温扩张'
    if (score >= 32) return '正常偏热'
    return '冷却修复'
  }

  if (score >= 80) return '牛市过热'
  if (score >= 65) return '牛市后段'
  if (score >= 48) return '牛市确认'
  if (score >= 34) return '震荡筑底'
  return '熊市压力'
}

function strategyLabel(type: ResearchTab, score: number) {
  if (type === 'ai') {
    if (score >= 82) return '高度防御'
    if (score >= 68) return '等待验证'
    if (score >= 50) return '谨慎减仓'
    return '继续参与'
  }

  if (score >= 80) return '分批止盈 / 对冲'
  if (score >= 65) return '持有 + 轮动'
  if (score >= 48) return '持有'
  if (score >= 34) return '加仓'
  return '定投'
}

function strategyRecommendation(type: ResearchTab, data: PageData, score: number) {
  if (type === 'crypto') {
    const crypto = data as CryptoCycleData
    const stableChange = crypto.stablecoins?.change30d
    const fear = crypto.fearGreedHistory[0]?.value
    if (stableChange !== null && stableChange !== undefined && stableChange < 0 && score < 65) return '等待流动性确认'
    if (fear !== undefined && fear >= 80) return '停止追高'
    return strategyLabel(type, score)
  }

  const ai = data as AiBubbleData
  const tenYear = ai.macroSignals.find((signal) => signal.id === 'DGS10')?.value
  const hyOas = ai.macroSignals.find((signal) => signal.id === 'BAMLH0A0HYM2')?.value
  if (score >= 50 && ((tenYear ?? 0) >= 4.8 || (hyOas ?? 0) >= 5)) return '谨慎减仓'
  return strategyLabel(type, score)
}

function filterByRange<T extends { date: string }>(points: T[], range: TimeRange) {
  const days = rangeDays[range]
  if (!days || points.length === 0) return points

  const lastDate = new Date(`${points[points.length - 1].date}T00:00:00Z`)
  const cutoff = new Date(lastDate)
  cutoff.setUTCDate(cutoff.getUTCDate() - days)
  return points.filter((point) => new Date(`${point.date}T00:00:00Z`) >= cutoff)
}

function downsample<T>(points: T[], maxPoints = 260) {
  if (points.length <= maxPoints) return points
  const step = Math.ceil(points.length / maxPoints)
  return points.filter((_, index) => index % step === 0 || index === points.length - 1)
}

function ChartFrame({ height, children }: ChartFrameProps) {
  const frameRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return undefined

    const updateWidth = () => {
      const nextWidth = Math.floor(frame.getBoundingClientRect().width)
      setWidth((currentWidth) => (nextWidth > 0 && nextWidth !== currentWidth ? nextWidth : currentWidth))
    }

    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(frame)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={frameRef} className="w-full min-w-0" style={{ height }}>
      {width > 0 ? children(width, height) : (
        <div className="h-full w-full rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 bg-dark-900/30" />
      )}
    </div>
  )
}

function latestIndicator(indicators: SignalIndicator[], name: string) {
  return indicators.find((indicator) => indicator.name === name)
}

function metricFromIndicator(id: string, category: string, indicator: SignalIndicator | undefined, threshold: string, source: string, updatedAt: string): ResearchMetric {
  const score = indicator?.score ?? 0
  const hasValue = Boolean(indicator && indicator.value !== 'N/A')
  return {
    id,
    name: indicator?.name ?? id,
    category,
    score: hasValue ? Math.round(score) : 0,
    currentValue: indicator?.value ?? '待更新',
    weeklyChange: '待更新',
    monthlyChange: '待更新',
    threshold,
    status: hasValue ? scoreRiskStatus(score) : 'pending',
    source,
    updatedAt,
    description: indicator?.summary ?? '等待接入数据源或手动录入。',
    interpretation: hasValue ? `当前贡献分 ${score.toFixed(0)} / 100。` : '未参与评分。',
  }
}

function pendingMetric(id: string, category: string, name: string, threshold: string, description: string, source = '待接入'): ResearchMetric {
  return {
    id,
    name,
    category,
    score: 0,
    currentValue: '待更新',
    weeklyChange: '待更新',
    monthlyChange: '待更新',
    threshold,
    status: 'pending',
    source,
    updatedAt: '待更新',
    description,
    interpretation: '当前没有可靠 live 数据，不参与评分。',
  }
}

function liveMetric(
  id: string,
  category: string,
  name: string,
  currentValue: string,
  status: MetricStatus,
  threshold: string,
  source: string,
  updatedAt: string,
  interpretation: string,
  weeklyChange = '待更新',
  monthlyChange = '待更新',
  score = statusScore(status),
): ResearchMetric {
  return {
    id,
    name,
    category,
    score: Math.round(score),
    currentValue,
    weeklyChange,
    monthlyChange,
    threshold,
    status,
    source,
    updatedAt,
    description: interpretation,
    interpretation,
  }
}

function sourceBadge(source: DataSourceStatus) {
  if (source.status === 'live') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
  if (source.status === 'fallback') return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
  return 'border-rose-500/30 bg-rose-500/10 text-rose-300'
}

function sourceLabel(source: DataSourceStatus) {
  if (source.status === 'live') return '可用'
  if (source.status === 'fallback') return '部分'
  return '失败'
}

function liveSourceCount(sources: DataSourceStatus[]) {
  return sources.filter((source) => source.status === 'live').length
}

function pageTitle(type: ResearchTab) {
  return type === 'ai' ? 'AI 美股泡沫监控' : '加密市场周期监控'
}

function pageSubtitle(type: ResearchTab) {
  return type === 'ai'
    ? '只跟踪 AI 美股泡沫相关的价格、估值、上下游产业链、财报现金流、投资强度和宏观信用条件，不混入加密周期信号。'
    : '只跟踪加密市场周期相关的 BTC 趋势、减半时间、稳定币、情绪和市占率，不混入 AI 股票信号。'
}

function stageLabel(type: ResearchTab, data: PageData) {
  return type === 'ai' ? (data as AiBubbleData).stage : (data as CryptoCycleData).marketRegime
}

function shortTurnLabel(label: string) {
  if (label === '回撤/筑底观察窗口') return '筑底窗口'
  if (label === '方向确认拐点') return '确认拐点'
  if (label === '高温回调拐点') return '高温回调'
  if (label === '牛市高温窗口') return '高温窗口'
  if (label === '筑底/反弹拐点') return '筑底反弹'
  return label
}

function scoreValue(type: ResearchTab, data: PageData) {
  return type === 'ai' ? (data as AiBubbleData).bubbleScore : (data as CryptoCycleData).heatScore
}

function pageSources(type: ResearchTab, data: PageData) {
  return type === 'ai' ? (data as AiBubbleData).sources : (data as CryptoCycleData).sources
}

function pageIndicators(type: ResearchTab, data: PageData) {
  return type === 'ai' ? (data as AiBubbleData).indicators : (data as CryptoCycleData).indicators
}

function cryptoCycleTimingCards(data: CryptoCycleData, strategy: string): CycleTimingCard[] {
  const latest = data.history[data.history.length - 1]
  const fear = data.fearGreedHistory[0]?.value
  const stable30d = data.stablecoins?.change30d ?? null
  const distance200d = latest?.ma200d ? (latest.price / latest.ma200d - 1) * 100 : null
  const lastHalving = data.halving.lastDate
  const peakStart = addCycleDays(lastHalving, 420)
  const peakEnd = addCycleDays(lastHalving, 570)
  const bottomStart = addCycleDays(lastHalving, 760)
  const bottomEnd = addCycleDays(lastHalving, 980)
  const bullConfirmStart = addCycleDays(bottomStart, 60)
  const bullConfirmEnd = addCycleDays(bottomEnd, 120)
  const inBottomWindow = inDateWindow(bottomStart, bottomEnd)
  const inPeakWindow = inDateWindow(peakStart, peakEnd)
  const topWindowPassed = afterDate(peakEnd)
  const bottomWindowStartsIn = daysUntil(bottomStart)
  const bottomWindowEndsIn = daysUntil(bottomEnd)
  const above200d = distance200d !== null && distance200d >= 0
  const liquidityImproving = stable30d !== null && stable30d >= 0
  const sentimentRecovering = fear !== undefined && fear >= 25 && fear <= 70
  const heatConfirmed = data.heatScore >= 48
  const confirmationCount = [above200d, liquidityImproving, sentimentRecovering, heatConfirmed].filter(Boolean).length
  const bottomFishStatus: MetricStatus = inBottomWindow
    ? strategy === '等待流动性确认'
      ? 'yellow'
      : data.heatScore < 48
        ? 'green'
        : 'neutral'
    : beforeDate(bottomStart)
      ? 'pending'
      : 'neutral'
  const bottomFishValue = inBottomWindow
    ? strategy === '等待流动性确认'
      ? '只适合小仓观察'
      : '可以分批左侧'
    : beforeDate(bottomStart)
      ? `还差约 ${Math.max(0, bottomWindowStartsIn)} 天`
      : '左侧窗口已过'
  const bottomWindowTimeText = data.nextTurn.label.includes('筑底') || data.nextTurn.label.includes('回撤')
    ? data.nextTurn.daysText
    : `距窗口结束约 ${Math.max(0, bottomWindowEndsIn)} 天`
  const bottomFishDetail = inBottomWindow
    ? `抄底观察窗口 ${exactDateRange(bottomStart, bottomEnd)}，${bottomWindowTimeText}。`
    : `抄底观察窗口 ${exactDateRange(bottomStart, bottomEnd)}。`
  const bullConfirmValue = confirmationCount >= 3 ? '接近熊转牛确认' : `等待确认 ${confirmationCount}/4`
  const bullConfirmDetail = `确认窗口 ${exactDateRange(bullConfirmStart, bullConfirmEnd)}；需要 BTC 重新站上 200D、稳定币 30D 转正、情绪脱离极端恐惧、周期分 >=48。`
  const peakValue = inPeakWindow ? '牛转熊风险区' : topWindowPassed ? '本轮高温窗口已过' : `约 ${Math.max(0, daysUntil(peakStart))} 天后进入`
  const peakDetail = `牛转熊/顶部观察窗口 ${exactDateRange(peakStart, peakEnd)}。进入该区后，若周期分 >70 且情绪极端贪婪，应优先止盈。`
  const nextTurnDetail = `${data.nextTurn.dateRange} · ${data.nextTurn.daysText} · 置信度 ${data.nextTurn.confidence}`

  return [
    {
      id: 'current-stage',
      title: '当前周期阶段',
      value: data.marketRegime,
      detail: `减半后第 ${data.halving.daysSinceLast} 天，周期分 ${data.heatScore}/100。${strategy === '等待流动性确认' ? '稳定币流动性偏弱，还不是确认牛市。' : '按当前数据跟踪下一步确认。'}`,
      status: strategy === '等待流动性确认' ? 'yellow' : scoreRiskStatus(data.heatScore),
      hint: '用周期分、减半后天数、BTC 趋势和流动性一起判断当前位置。',
    },
    {
      id: 'next-turn',
      title: '下一次拐点',
      value: data.nextTurn.label,
      detail: nextTurnDetail,
      status: inBottomWindow ? 'yellow' : 'neutral',
      hint: '这是离现在最近的周期观察窗口，用于判断接下来是继续筑底、反弹确认，还是高温回撤。',
    },
    {
      id: 'bottom-fishing',
      title: '什么时候抄底',
      value: bottomFishValue,
      detail: bottomFishDetail,
      status: bottomFishStatus,
      hint: '抄底不是单一日期。左侧看时间窗口，右侧加仓要看 BTC 站回趋势线和稳定币重新扩张。',
    },
    {
      id: 'bull-confirm',
      title: '熊转牛确认',
      value: bullConfirmValue,
      detail: bullConfirmDetail,
      status: confirmationCount >= 3 ? 'green' : confirmationCount >= 2 ? 'yellow' : 'neutral',
      hint: '熊转牛需要价格、流动性、情绪和周期分同时改善；只满足一两个条件时容易是假反弹。',
    },
    {
      id: 'bear-risk',
      title: '牛转熊风险',
      value: peakValue,
      detail: peakDetail,
      status: inPeakWindow ? 'red' : topWindowPassed ? 'neutral' : 'pending',
      hint: '这个窗口按减半后 420-570 天估算，用来提醒牛市后段或顶部风险，不等于精确见顶日。',
    },
  ]
}

function cryptoCycleMapData(data: CryptoCycleData, strategy: string): CycleMapData {
  const latest = data.history[data.history.length - 1]
  const today = data.asOf.slice(0, 10)
  const fear = data.fearGreedHistory[0]?.value
  const stable30d = data.stablecoins?.change30d ?? null
  const distance200d = latest?.ma200d ? (latest.price / latest.ma200d - 1) * 100 : null
  const startDate = data.halving.lastDate
  const peakStart = addCycleDays(startDate, 420)
  const peakEnd = addCycleDays(startDate, 570)
  const bearEnd = addCycleDays(startDate, 760)
  const bottomStart = bearEnd
  const bottomEnd = addCycleDays(startDate, 980)
  const bullConfirmStart = addCycleDays(bottomStart, 60)
  const bullConfirmEnd = addCycleDays(bottomEnd, 120)
  const projectionEndDate = '2030-12-31'
  const nextHalvingDate = addCycleDays(startDate, 1460)
  const nextPeakStart = addCycleDays(nextHalvingDate, 420)
  const nextPeakEnd = addCycleDays(nextHalvingDate, 570)
  const nextBearEnd = addCycleDays(nextHalvingDate, 760)
  const nextBottomEnd = addCycleDays(nextHalvingDate, 980)
  const endDate = projectionEndDate
  const above200d = distance200d !== null && distance200d >= 0
  const liquidityImproving = stable30d !== null && stable30d >= 0
  const sentimentRecovering = fear !== undefined && fear >= 25 && fear <= 70
  const heatConfirmed = data.heatScore >= 48
  const confirmationCount = [above200d, liquidityImproving, sentimentRecovering, heatConfirmed].filter(Boolean).length
  const segments: CycleMapSegment[] = [
    {
      id: 'bull-rise',
      label: '牛市上行',
      subLabel: '趋势扩张',
      start: startDate,
      end: peakStart,
      colorClass: 'bg-emerald-500/40',
      textClass: 'text-emerald-200',
    },
    {
      id: 'bull-top',
      label: '牛市高温',
      subLabel: '牛转熊风险',
      start: peakStart,
      end: peakEnd,
      colorClass: 'bg-rose-500/45',
      textClass: 'text-rose-200',
    },
    {
      id: 'bear-down',
      label: '熊市回撤',
      subLabel: '等待恐慌释放',
      start: peakEnd,
      end: bearEnd,
      colorClass: 'bg-sky-500/35',
      textClass: 'text-sky-200',
    },
    {
      id: 'bottom',
      label: '筑底抄底',
      subLabel: '左侧观察',
      start: bottomStart,
      end: bottomEnd,
      colorClass: 'bg-amber-500/45',
      textClass: 'text-amber-200',
    },
    {
      id: 'bull-confirm',
      label: '熊转牛确认',
      subLabel: '右侧加仓',
      start: bottomEnd,
      end: bullConfirmEnd,
      colorClass: 'bg-teal-500/45',
      textClass: 'text-teal-200',
    },
    {
      id: 'cycle-reset',
      label: '休整蓄势',
      subLabel: '等待下一次减半',
      start: bullConfirmEnd,
      end: nextHalvingDate,
      colorClass: 'bg-violet-500/25',
      textClass: 'text-violet-200',
    },
    {
      id: 'next-bull-rise',
      label: '下一轮牛市上行',
      subLabel: '2028 减半后扩张',
      start: nextHalvingDate,
      end: nextPeakStart,
      colorClass: 'bg-emerald-500/30',
      textClass: 'text-emerald-200',
    },
    {
      id: 'next-bull-top',
      label: '下一轮牛市高温',
      subLabel: '2029 顶部风险',
      start: nextPeakStart,
      end: nextPeakEnd,
      colorClass: 'bg-rose-500/35',
      textClass: 'text-rose-200',
    },
    {
      id: 'next-bear-down',
      label: '下一轮熊市回撤',
      subLabel: '2030 回撤观察',
      start: nextPeakEnd,
      end: nextBearEnd,
      colorClass: 'bg-sky-500/25',
      textClass: 'text-sky-200',
    },
    {
      id: 'next-bottom',
      label: '下一轮筑底',
      subLabel: '2030 抄底观察',
      start: nextBearEnd,
      end: projectionEndDate,
      colorClass: 'bg-amber-500/30',
      textClass: 'text-amber-200',
    },
  ]
  const currentSegment = segments.find((segment) => today >= segment.start && today <= segment.end) ?? segments[segments.length - 1]
  const coreMarkers = [
    { id: 'bear-turn-start', label: '牛转熊风险开始', date: peakStart, tone: 'red' as MetricStatus },
    { id: 'bear-turn-confirm', label: '熊市确认', date: peakEnd, tone: 'red' as MetricStatus },
    { id: 'bottom-start', label: '抄底窗口开始', date: bottomStart, tone: 'yellow' as MetricStatus },
    { id: 'bull-confirm-start', label: '熊转牛确认开始', date: bullConfirmStart, tone: 'green' as MetricStatus },
    { id: 'bottom-end', label: '筑底窗口结束', date: bottomEnd, tone: 'neutral' as MetricStatus },
    { id: 'next-halving', label: '下一次减半估算', date: nextHalvingDate, tone: 'neutral' as MetricStatus },
    { id: 'next-bear-turn-start', label: '下一轮牛转熊风险', date: nextPeakStart, tone: 'red' as MetricStatus },
    { id: 'next-bear-confirm', label: '下一轮熊市确认', date: nextPeakEnd, tone: 'red' as MetricStatus },
    { id: 'next-bottom-start', label: '下一轮抄底窗口', date: nextBearEnd, tone: 'yellow' as MetricStatus },
    { id: 'next-bottom-end', label: '下一轮筑底结束', date: nextBottomEnd, tone: 'neutral' as MetricStatus },
  ]
  const markers = coreMarkers.map((marker) => ({
    ...marker,
    position: positionBetween(marker.date, startDate, endDate),
  }))
  const yearTicks: CycleMapTick[] = [
    { id: 'start', label: '2024 减半', date: startDate, position: 0 },
    ...Array.from({ length: 6 }, (_, index) => {
      const year = 2025 + index
      const date = `${year}-01-01`
      return {
        id: `${year}`,
        label: `${year}`,
        date,
        position: positionBetween(date, startDate, endDate),
      }
    }),
    { id: 'end', label: '2030 年末', date: projectionEndDate, position: 100 },
  ]
  const nextMarker = coreMarkers
    .filter((marker) => marker.date >= today)
    .sort((left, right) => left.date.localeCompare(right.date))[0]
  const currentAction = strategy === '等待流动性确认'
    ? '只看左侧小仓，等流动性转正'
    : confirmationCount >= 3
      ? '熊转牛接近确认，可以等回踩加仓'
      : currentSegment.id === 'bottom'
        ? '处在抄底窗口，分批但不重仓'
        : strategy
  const confirmItems: CycleConfirmItem[] = [
    {
      id: 'btc-200d',
      label: 'BTC 趋势',
      value: distance200d === null ? '无数据' : marketSignalFormatters.percent(distance200d),
      passed: above200d,
      progress: distance200d === null ? 0 : clampPercent(50 + distance200d),
      status: above200d ? 'green' : 'yellow',
    },
    {
      id: 'stablecoin',
      label: '稳定币流动性',
      value: stable30d === null ? '无数据' : marketSignalFormatters.percent(stable30d),
      passed: liquidityImproving,
      progress: stable30d === null ? 0 : clampPercent(50 + stable30d * 10),
      status: liquidityImproving ? 'green' : 'yellow',
    },
    {
      id: 'sentiment',
      label: '市场情绪',
      value: fear === undefined ? '无数据' : `${fear}`,
      passed: sentimentRecovering,
      progress: fear === undefined ? 0 : clampPercent(fear),
      status: sentimentRecovering ? 'green' : fear !== undefined && fear > 80 ? 'red' : 'yellow',
    },
    {
      id: 'heat',
      label: '周期热度',
      value: `${data.heatScore}/100`,
      passed: heatConfirmed,
      progress: clampPercent(data.heatScore),
      status: heatConfirmed ? 'green' : 'neutral',
    },
  ]

  return {
    startDate,
    endDate,
    nowPosition: positionBetween(today, startDate, endDate),
    currentPhase: currentSegment.label,
    currentAction,
    currentDetail: `今天是 ${exactDate(today)}，减半后第 ${data.halving.daysSinceLast} 天，市场温度 ${data.heatScore}/100，熊转牛确认 ${confirmationCount}/4。`,
    nextTurnLabel: nextMarker?.label ?? '等待下一轮周期',
    nextTurnDate: nextMarker ? exactDate(nextMarker.date) : data.nextTurn.dateRange,
    bottomWindow: exactDateRange(bottomStart, bottomEnd),
    bullConfirmWindow: exactDateRange(bullConfirmStart, bullConfirmEnd),
    bearTurnWindow: exactDateRange(peakStart, peakEnd),
    bottomProgress: positionBetween(today, bottomStart, bottomEnd),
    heatPosition: clampPercent(data.heatScore),
    confirmationCount,
    confirmItems,
    segments,
    markers,
    yearTicks,
  }
}

function lightBarClass(status: MetricStatus) {
  if (status === 'green') return 'bg-emerald-400'
  if (status === 'red') return 'bg-rose-400'
  if (status === 'yellow') return 'bg-amber-400'
  if (status === 'pending') return 'bg-gray-400'
  return 'bg-sky-400'
}

function cryptoSignalLights(map: CycleMapData): CryptoSignalLight[] {
  const btcTrend = map.confirmItems.find((item) => item.id === 'btc-200d')
  const stablecoin = map.confirmItems.find((item) => item.id === 'stablecoin')
  const sentiment = map.confirmItems.find((item) => item.id === 'sentiment')
  const isBottomPhase = map.currentPhase.includes('筑底')
  const isBeforeBottom = map.bottomProgress <= 0
  const isAfterBottom = map.bottomProgress >= 100
  const bottomStatus: MetricStatus = isBottomPhase
    ? stablecoin?.passed
      ? 'green'
      : 'yellow'
    : isBeforeBottom
      ? 'pending'
      : isAfterBottom
        ? 'neutral'
        : 'yellow'
  const bottomVerdict = isBottomPhase
    ? stablecoin?.passed
      ? '可以分批'
      : '只适合小仓'
    : isBeforeBottom
      ? '还没到'
      : isAfterBottom
        ? '左侧窗口已过'
        : '观察中'
  const addStatus: MetricStatus = map.confirmationCount >= 3
    ? 'green'
    : map.confirmationCount >= 2
      ? 'yellow'
      : 'neutral'
  const heatStatus: MetricStatus = map.heatPosition >= 75
    ? 'red'
    : map.heatPosition >= 55
      ? 'yellow'
      : map.heatPosition <= 35
        ? 'green'
        : 'neutral'
  const heatVerdict = map.heatPosition >= 75
    ? '过热，优先止盈'
    : map.heatPosition >= 55
      ? '升温，别追高'
      : map.heatPosition <= 35
        ? '低温，可观察底部'
        : '温和，继续跟踪'

  return [
    {
      id: 'bottom-light',
      title: '抄底灯',
      verdict: bottomVerdict,
      value: `${Math.round(map.bottomProgress)}%`,
      detail: `当前在${map.currentPhase}，抄底窗口是 ${map.bottomWindow}。`,
      status: bottomStatus,
      progress: map.bottomProgress,
      lowLabel: '窗口开始',
      highLabel: '窗口结束',
    },
    {
      id: 'add-light',
      title: '加仓灯',
      verdict: map.confirmationCount >= 3 ? '接近确认' : '还要等',
      value: `${map.confirmationCount}/4`,
      detail: '至少满足 3/4 个确认条件，再考虑右侧加仓。',
      status: addStatus,
      progress: map.confirmationCount * 25,
      lowLabel: '未确认',
      highLabel: '确认',
    },
    {
      id: 'liquidity-light',
      title: '流动性灯',
      verdict: stablecoin?.passed ? '资金回流' : '资金偏弱',
      value: stablecoin?.value ?? '无数据',
      detail: stablecoin?.passed ? '资金开始扩张，反弹更容易延续。' : '稳定币供应偏弱，反弹容易失败。',
      status: stablecoin?.status ?? 'pending',
      progress: stablecoin?.progress ?? 0,
      lowLabel: '弱',
      highLabel: '强',
    },
    {
      id: 'trend-light',
      title: '趋势灯',
      verdict: btcTrend?.passed ? '站回趋势' : '趋势未确认',
      value: btcTrend?.value ?? '无数据',
      detail: btcTrend?.passed ? 'BTC 已站回中长期趋势，右侧胜率提高。' : 'BTC 还没站回趋势线，重仓胜率偏低。',
      status: btcTrend?.status ?? 'pending',
      progress: btcTrend?.progress ?? 0,
      lowLabel: '弱',
      highLabel: '强',
    },
    {
      id: 'heat-light',
      title: '温度灯',
      verdict: heatVerdict,
      value: `${Math.round(map.heatPosition)}/100`,
      detail: sentiment ? `情绪 ${sentiment.value}，市场温度越高越要防守。` : '市场温度越高越要防守。',
      status: heatStatus,
      progress: map.heatPosition,
      lowLabel: '冷',
      highLabel: '热',
    },
  ]
}

function aiRiskStatus(score: number): MetricStatus {
  if (score >= 82) return 'red'
  if (score >= 68) return 'yellow'
  if (score >= 50) return 'neutral'
  return 'green'
}

function aiRiskVerdict(score: number, low: string, mid: string, high: string, extreme: string) {
  if (score >= 82) return extreme
  if (score >= 68) return high
  if (score >= 50) return mid
  return low
}

function averageNumbers(values: Array<number | null | undefined>) {
  const usable = values.filter((value): value is number => value !== null && value !== undefined && Number.isFinite(value))
  return usable.length ? usable.reduce((sum, value) => sum + value, 0) / usable.length : null
}

function aiFinancialSnapshots(data: AiBubbleData) {
  return Array.isArray(data.financials) ? data.financials : []
}

function usableFinancials(data: AiBubbleData) {
  return aiFinancialSnapshots(data).filter((snapshot) => snapshot.dataQuality !== 'missing')
}

function aiFinancialBySymbol(data: AiBubbleData) {
  return new Map(aiFinancialSnapshots(data).map((snapshot) => [snapshot.symbol, snapshot]))
}

function sumFinancial(values: Array<number | null | undefined>) {
  const usable = values.filter((value): value is number => value !== null && value !== undefined && Number.isFinite(value))
  return usable.length ? usable.reduce((sum, value) => sum + value, 0) : null
}

function ratioFromFinancialSums(numerators: Array<number | null | undefined>, denominators: Array<number | null | undefined>) {
  const numerator = sumFinancial(numerators)
  const denominator = sumFinancial(denominators.filter((value) => value !== null && value !== undefined && value > 0))
  return numerator !== null && denominator !== null && denominator > 0 ? numerator / denominator : null
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '待更新'
  return marketSignalFormatters.compact(value, '$')
}

function formatRatio(value: number | null | undefined, suffix = 'x') {
  if (value === null || value === undefined || !Number.isFinite(value)) return '待更新'
  return `${value.toFixed(2)}${suffix}`
}

function formatFinancialPercent(value: number | null | undefined, decimals = 0) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '待更新'
  return marketSignalFormatters.percent(value * 100, decimals)
}

function financialUpdatedAt(financials: AiFinancialSnapshot[], fallback: string) {
  return financials.find((snapshot) => snapshot.updatedAt)?.updatedAt
    ? compactDate(financials.find((snapshot) => snapshot.updatedAt)?.updatedAt ?? fallback)
    : compactDate(fallback)
}

function financialStatusFromRisk(score: number | null): MetricStatus {
  if (score === null) return 'pending'
  if (score >= 78) return 'red'
  if (score >= 58) return 'yellow'
  if (score >= 40) return 'neutral'
  return 'green'
}

function financialMetricForSymbol(symbol: string, data: AiBubbleData, category: string): ResearchMetric {
  const financial = aiFinancialBySymbol(data).get(symbol)
  if (!financial || financial.dataQuality === 'missing') {
    return pendingMetric(
      `financial-${symbol}`,
      category,
      `${symbol} 财报 / 现金流`,
      '现金流覆盖 Capex，债务不快于现金',
      '等待财报摘要源返回可用字段。',
      'SEC companyfacts',
    )
  }

  const capexToFreeCashflow = financial.capitalExpenditure !== null && financial.freeCashflow !== null && financial.freeCashflow > 0
    ? financial.capitalExpenditure / financial.freeCashflow
    : null
  const debtCashRatio = financial.totalDebt !== null && financial.totalCash !== null && financial.totalCash > 0
    ? financial.totalDebt / financial.totalCash
    : null
  const riskScore = Math.max(
    debtCashRatio === null ? 45 : clampPercent(25 + (debtCashRatio - 0.5) * 42),
    capexToFreeCashflow === null ? 45 : clampPercent(25 + capexToFreeCashflow * 55),
    financial.freeCashflow !== null && financial.freeCashflow <= 0 ? 85 : 0,
  )
  const value = [
    `现金 ${formatMoney(financial.totalCash)}`,
    `债务 ${formatMoney(financial.totalDebt)}`,
    `FCF ${formatMoney(financial.freeCashflow)}`,
  ].join(' / ')

  return liveMetric(
    `financial-${symbol}`,
    category,
    `${symbol} 财报 / 现金流`,
    value,
    financialStatusFromRisk(riskScore),
    '债务/现金 >1.5x 或 Capex/FCF >100% 警惕',
    'SEC companyfacts',
    financial.updatedAt ? compactDate(financial.updatedAt) : compactDate(data.asOf),
    `收入增速 ${formatFinancialPercent(financial.revenueGrowth)}，毛利率 ${formatFinancialPercent(financial.grossMargin)}，Capex/FCF ${capexToFreeCashflow === null ? '待更新' : `${(capexToFreeCashflow * 100).toFixed(0)}%`}。`,
    '待更新',
    '待更新',
    riskScore,
  )
}

function aiTickerBySymbol(data: AiBubbleData) {
  return new Map(data.tickers.map((ticker) => [ticker.symbol, ticker]))
}

function aiSignalLights(data: AiBubbleData): AiSignalLight[] {
  const priceHeat = latestIndicator(data.indicators, '平均偏离 200 日线')
  const hotShare = latestIndicator(data.indicators, '高热股票占比')
  const avgPe = latestIndicator(data.indicators, '平均远期/动态 PE')
  const concentration = latestIndicator(data.indicators, '前三大市值占比')
  const macroScore = averageNumbers(data.macroSignals
    .filter((signal) => ['DGS10', 'DFII10', 'NFCI', 'BAMLH0A0HYM2', 'BAMLC0A0CM'].includes(signal.id))
    .map((signal) => signal.score))
  const tickerMap = aiTickerBySymbol(data)
  const tickerHeat = (symbols: string[]) => averageNumbers(symbols
    .map((symbol) => tickerMap.get(symbol)?.heatScore)
    .filter((value) => (value ?? 0) > 0))
  const chipHeat = tickerHeat(['NVDA', 'AMD', 'AVGO', 'ARM'])
  const supplyHeat = tickerHeat(['TSM', 'MU', 'SMH'])
  const infraHeat = tickerHeat(['DELL', 'VRT', 'ANET', 'ORCL'])
  const cloudHeat = tickerHeat(['MSFT', 'GOOGL', 'AMZN', 'META'])
  const appHeat = tickerHeat(['PLTR', 'CRM', 'NOW', 'SNOW'])
  const upstreamHeat = averageNumbers([chipHeat, supplyHeat, infraHeat])
  const downstreamHeat = averageNumbers([cloudHeat, appHeat])
  const deliveryGap = upstreamHeat !== null && downstreamHeat !== null
    ? upstreamHeat - downstreamHeat
    : null
  const deliveryScore = deliveryGap === null ? 45 : clampPercent(45 + deliveryGap * 1.3)
  const deliveryStatus: MetricStatus = deliveryScore >= 75
    ? 'red'
    : deliveryScore >= 58
      ? 'yellow'
      : deliveryScore >= 42
        ? 'neutral'
        : 'green'

  return [
    {
      id: 'ai-stage',
      title: '泡沫温度',
      verdict: data.stage,
      value: `${data.bubbleScore}/100`,
      detail: '越靠右，越接近泡沫后段；红色优先防守。',
      status: aiRiskStatus(data.bubbleScore),
      progress: data.bubbleScore,
      lowLabel: '冷却',
      highLabel: '狂热',
    },
    {
      id: 'price-distance',
      title: '股价过热',
      verdict: aiRiskVerdict(priceHeat?.score ?? 0, '不拥挤', '开始升温', '明显偏热', '过热'),
      value: priceHeat?.value ?? '无数据',
      detail: '看 AI 股票是否大幅高于长期趋势线。',
      status: aiRiskStatus(priceHeat?.score ?? 0),
      progress: priceHeat?.score ?? 0,
      lowLabel: '贴近趋势',
      highLabel: '远离趋势',
    },
    {
      id: 'breadth',
      title: '扩散程度',
      verdict: aiRiskVerdict(hotShare?.score ?? 0, '少数龙头热', '开始扩散', '全板块升温', '普涨狂热'),
      value: hotShare?.value ?? '无数据',
      detail: '从少数龙头扩散到全板块时，泡沫风险上升。',
      status: aiRiskStatus(hotShare?.score ?? 0),
      progress: hotShare?.score ?? 0,
      lowLabel: '集中',
      highLabel: '普涨',
    },
    {
      id: 'valuation',
      title: '估值压力',
      verdict: aiRiskVerdict(Math.max(avgPe?.score ?? 0, concentration?.score ?? 0), '可接受', '偏贵', '拥挤', '估值脆弱'),
      value: avgPe?.value ?? concentration?.value ?? '无数据',
      detail: '估值越贵、越集中在少数龙头，越怕财报不及预期。',
      status: aiRiskStatus(Math.max(avgPe?.score ?? 0, concentration?.score ?? 0)),
      progress: Math.max(avgPe?.score ?? 0, concentration?.score ?? 0),
      lowLabel: '便宜',
      highLabel: '昂贵',
    },
    {
      id: 'macro',
      title: '资金环境',
      verdict: aiRiskVerdict(macroScore ?? 0, '顺风', '中性', '偏紧', '压估值'),
      value: macroScore === null ? '无数据' : `${Math.round(macroScore)}/100`,
      detail: '利率、实际利率和信用利差越高，AI 高估值越脆弱。',
      status: aiRiskStatus(macroScore ?? 0),
      progress: macroScore ?? 0,
      lowLabel: '宽松',
      highLabel: '收紧',
    },
    {
      id: 'delivery',
      title: '产业兑现',
      verdict: deliveryGap === null
        ? '待验证'
        : deliveryGap > 22
          ? '上游太热'
          : deliveryGap > 10
            ? '兑现跟进中'
            : '相对均衡',
      value: deliveryGap === null ? '无数据' : `差 ${deliveryGap.toFixed(0)}`,
      detail: '芯片先涨、云和应用没跟上时，说明市场在提前透支未来。',
      status: deliveryStatus,
      progress: deliveryScore,
      lowLabel: '兑现',
      highLabel: '透支',
    },
  ]
}

function aiChainLayers(data: AiBubbleData): AiChainLayer[] {
  const tickerMap = aiTickerBySymbol(data)
  const layer = (id: string, title: string, subtitle: string, symbols: string[], detail: string): AiChainLayer => {
    const tickers = symbols.map((symbol) => tickerMap.get(symbol)).filter(Boolean)
    const heat = averageNumbers(tickers.map((ticker) => ticker?.heatScore).filter((value) => (value ?? 0) > 0))
    if (heat === null) {
      return {
        id,
        title,
        subtitle,
        symbols: symbols.join(' / '),
        heat: 0,
        verdict: '待验证',
        status: 'pending',
        detail,
      }
    }
    const status = aiRiskStatus(heat)
    return {
      id,
      title,
      subtitle,
      symbols: symbols.join(' / '),
      heat,
      verdict: aiRiskVerdict(heat, '冷静', '升温', '偏热', '过热'),
      status,
      detail,
    }
  }

  return [
    layer('chip-design', '芯片设计', '算力供给', ['NVDA', 'AMD', 'AVGO', 'ARM'], '这里过热但下游收入不跟，说明市场先透支算力需求。'),
    layer('foundry-memory', '制造和内存', '产能约束', ['TSM', 'MU', 'SMH'], '制造、封装和内存如果同步升温，说明 AI Capex 正在向供应链扩散。'),
    layer('datacenter', '服务器/电力/网络', '基建承接', ['DELL', 'VRT', 'ANET', 'ORCL'], '数据中心、电力和网络设备是 AI 资本开支能否落地的中游验证。'),
    layer('cloud', '云和模型平台', '资本开支买方', ['MSFT', 'GOOGL', 'AMZN', 'META', 'ORCL'], '云厂商继续加大投入，才能支撑芯片订单和数据中心扩张。'),
    layer('software', '软件和应用', '收入兑现端', ['PLTR', 'CRM', 'NOW', 'SNOW'], '应用层如果跟不上，泡沫会停留在“卖铲子”阶段。'),
    {
      id: 'macro',
      title: '宏观资金',
      subtitle: '外部流动性',
      symbols: 'Rates / Credit',
      heat: averageNumbers(data.macroSignals.map((signal) => signal.score)) ?? 0,
      verdict: aiRiskVerdict(averageNumbers(data.macroSignals.map((signal) => signal.score)) ?? 0, '顺风', '中性', '偏紧', '压估值'),
      status: aiRiskStatus(averageNumbers(data.macroSignals.map((signal) => signal.score)) ?? 0),
      detail: '利率和信用条件决定高估值能承受多少波动。',
    },
  ]
}

function aiCapitalCards(data: AiBubbleData): AiCapitalCard[] {
  const financials = aiFinancialSnapshots(data)
  const usable = usableFinancials(data)
  const coverage = financials.length ? usable.length / financials.length * 100 : 0
  const avgRevenueGrowth = averageNumbers(usable.map((snapshot) => snapshot.revenueGrowth))
  const avgGrossMargin = averageNumbers(usable.map((snapshot) => snapshot.grossMargin))
  const totalCash = sumFinancial(usable.map((snapshot) => snapshot.totalCash))
  const totalDebt = sumFinancial(usable.map((snapshot) => snapshot.totalDebt))
  const netCash = totalCash !== null && totalDebt !== null ? totalCash - totalDebt : null
  const debtCashRatio = totalCash !== null && totalCash > 0 && totalDebt !== null ? totalDebt / totalCash : null
  const totalFreeCashflow = sumFinancial(usable.map((snapshot) => snapshot.freeCashflow))
  const totalCapex = sumFinancial(usable.map((snapshot) => snapshot.capitalExpenditure))
  const capexToFreeCashflow = ratioFromFinancialSums(
    usable.map((snapshot) => snapshot.capitalExpenditure),
    usable.map((snapshot) => snapshot.freeCashflow),
  )
  const negativeFreeCashflowShare = usable.length
    ? usable.filter((snapshot) => snapshot.freeCashflow !== null && snapshot.freeCashflow <= 0).length / usable.length * 100
    : null

  const financialQualityStatus: MetricStatus = avgRevenueGrowth === null
    ? 'pending'
    : avgRevenueGrowth >= 0.15 && (avgGrossMargin ?? 0) >= 0.35
      ? 'green'
      : avgRevenueGrowth >= 0.05
        ? 'neutral'
        : avgRevenueGrowth >= 0
          ? 'yellow'
          : 'red'
  const cashStatus: MetricStatus = netCash === null || totalFreeCashflow === null
    ? 'pending'
    : netCash >= 0 && totalFreeCashflow > 0
      ? 'green'
      : totalFreeCashflow > 0
        ? 'neutral'
        : 'red'
  const debtStatus: MetricStatus = debtCashRatio === null
    ? 'pending'
    : debtCashRatio <= 0.75
      ? 'green'
      : debtCashRatio <= 1.5
        ? 'neutral'
        : debtCashRatio <= 2.4
          ? 'yellow'
          : 'red'
  const capexStatus: MetricStatus = capexToFreeCashflow === null
    ? 'pending'
    : capexToFreeCashflow <= 0.65
      ? 'green'
      : capexToFreeCashflow <= 1
        ? 'neutral'
        : capexToFreeCashflow <= 1.6
          ? 'yellow'
          : 'red'

  return [
    {
      id: 'earnings-quality',
      title: '财报兑现',
      verdict: financialQualityStatus === 'green'
        ? '增长能支撑'
        : financialQualityStatus === 'neutral'
          ? '基本跟上'
          : financialQualityStatus === 'yellow'
            ? '增长放缓'
            : financialQualityStatus === 'red'
              ? '兑现不足'
              : '待验证',
      value: `${formatFinancialPercent(avgRevenueGrowth)} / 毛利 ${formatFinancialPercent(avgGrossMargin)}`,
      detail: `看收入增长和毛利率是否能支撑高估值。财报覆盖 ${usable.length}/${financials.length}。`,
      status: financialQualityStatus,
      progress: avgRevenueGrowth === null ? 0 : clampPercent(45 + avgRevenueGrowth * 180 + (avgGrossMargin ?? 0) * 45),
      lowLabel: '弱',
      highLabel: '强',
    },
    {
      id: 'cash-safety',
      title: '现金安全',
      verdict: cashStatus === 'green'
        ? '现金流健康'
        : cashStatus === 'neutral'
          ? '可承受'
          : cashStatus === 'red'
            ? '现金流压力'
            : '待验证',
      value: `净现金 ${formatMoney(netCash)}`,
      detail: `合计现金 ${formatMoney(totalCash)}，债务 ${formatMoney(totalDebt)}，自由现金流 ${formatMoney(totalFreeCashflow)}。`,
      status: cashStatus,
      progress: netCash === null ? 0 : clampPercent(50 + (netCash / Math.max(Math.abs(totalDebt ?? 0), 1)) * 35),
      lowLabel: '紧',
      highLabel: '稳',
    },
    {
      id: 'debt-pressure',
      title: '负债压力',
      verdict: debtStatus === 'green'
        ? '压力低'
        : debtStatus === 'neutral'
          ? '可观察'
          : debtStatus === 'yellow'
            ? '偏高'
            : debtStatus === 'red'
              ? '债务脆弱'
              : '待验证',
      value: `债务/现金 ${formatRatio(debtCashRatio)}`,
      detail: '债务相对现金越高，AI 基建和并购越依赖融资环境。',
      status: debtStatus,
      progress: debtCashRatio === null ? 0 : clampPercent(debtCashRatio * 38),
      lowLabel: '低',
      highLabel: '高',
    },
    {
      id: 'capex-pressure',
      title: 'AI 投资强度',
      verdict: capexStatus === 'green'
        ? '现金流覆盖'
        : capexStatus === 'neutral'
          ? '投入可控'
          : capexStatus === 'yellow'
            ? '消耗偏高'
            : capexStatus === 'red'
              ? '融资压力'
              : '待验证',
      value: capexToFreeCashflow === null ? '待更新' : `Capex/FCF ${(capexToFreeCashflow * 100).toFixed(0)}%`,
      detail: `合计 Capex ${formatMoney(totalCapex)}。FCF 为负公司占比 ${negativeFreeCashflowShare === null ? '待更新' : `${negativeFreeCashflowShare.toFixed(0)}%`}。`,
      status: capexStatus,
      progress: capexToFreeCashflow === null ? 0 : clampPercent(capexToFreeCashflow * 70),
      lowLabel: '可控',
      highLabel: '吃紧',
    },
    {
      id: 'mna-watch',
      title: '投资并购',
      verdict: '新闻源未接入',
      value: '未参与评分',
      detail: '需要接入 SEC 8-K、公司公告或新闻/RSS 后，才能自动跟踪大额投资、并购和战略融资。',
      status: 'pending',
      progress: coverage,
      lowLabel: '缺源',
      highLabel: '完整',
    },
  ]
}

function statusFromScore(score: number): MetricStatus {
  if (score >= 75) return 'red'
  if (score >= 55) return 'yellow'
  if (score >= 35) return 'neutral'
  return 'green'
}

function formatMacroValue(signal: MacroSignal | undefined) {
  if (!signal || signal.value === null) return '待更新'
  return signal.unit === 'percent' ? `${signal.value.toFixed(2)}%` : signal.value.toFixed(2)
}

function formatPointChange(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '待更新'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

function macroDisplayName(id: string, fallback: string) {
  const names: Record<string, string> = {
    FEDFUNDS: '政策利率',
    DGS10: '10年美债利率',
    DGS2: '2年美债利率',
    DFII10: '实际利率',
    DTWEXBGS: '美元强弱',
    NFCI: '金融条件',
    BAMLH0A0HYM2: '高收益债利差',
    BAMLC0A0CM: '投资级债利差',
  }
  return names[id] ?? fallback
}

function macroMetric(
  id: string,
  category: string,
  signal: MacroSignal | undefined,
  threshold: string,
  interpretation: string,
): ResearchMetric {
  return liveMetric(
    id,
    category,
    macroDisplayName(signal?.id ?? id, signal?.name ?? id),
    formatMacroValue(signal),
    signal ? statusFromScore(signal.score) : 'pending',
    threshold,
    'FRED',
    signal?.date ?? '待更新',
    signal ? `${interpretation} 当前风险分 ${signal.score}/100。` : '等待 FRED 数据。',
    formatPointChange(signal?.change1w),
    formatPointChange(signal?.change1m),
    signal?.score ?? 0,
  )
}

function buildAiModules(data: AiBubbleData): ResearchModule[] {
  const updatedAt = compactDate(data.asOf)
  const ai1y = latestIndicator(data.indicators, 'AI 篮子 1 年涨幅')
  const spyExcess = latestIndicator(data.indicators, '相对 SPY 超额收益')
  const qqqExcess = latestIndicator(data.indicators, '相对 QQQ 超额收益')
  const distance = latestIndicator(data.indicators, '平均偏离 200 日线')
  const avgRsi = latestIndicator(data.indicators, '平均 RSI')
  const hotShare = latestIndicator(data.indicators, '高热股票占比')
  const avgPe = latestIndicator(data.indicators, '平均远期/动态 PE')
  const concentration = latestIndicator(data.indicators, '前三大市值占比')
  const tickerBySymbol = new Map(data.tickers.map((ticker) => [ticker.symbol, ticker]))
  const macroById = new Map(data.macroSignals.map((signal) => [signal.id, signal]))

  return [
    {
      title: '宏观资金压力',
      summary: '看利率、美元和金融条件。颜色越红，AI 高估值越容易被压缩。',
      metrics: [
        macroMetric('FEDFUNDS', 'Macro & Rates', macroById.get('FEDFUNDS'), '>5% 偏紧，<3% 友好', '政策利率越高，长久期成长股估值越受压。'),
        pendingMetric('rate-expectation', 'Macro & Rates', '降息/加息预期', '未来 6M 净降息 >50bp 友好', '需要接入 FedWatch 或利率期货。'),
        macroMetric('DGS10', 'Macro & Rates', macroById.get('DGS10'), '>4.8% 红灯，4.3%-4.8% 黄灯', '长端利率上行会压缩 AI 和半导体估值。'),
        macroMetric('DGS2', 'Macro & Rates', macroById.get('DGS2'), '>5% 红灯', '短端利率反映政策约束和资金成本。'),
        macroMetric('DFII10', 'Macro & Rates', macroById.get('DFII10'), '>2.2% 红灯', '实际利率越高，成长股估值压力越大。'),
        macroMetric('DTWEXBGS', 'Macro & Rates', macroById.get('DTWEXBGS'), '美元指数快速上行偏紧', '美元走强通常压制全球风险偏好。'),
        macroMetric('NFCI', 'Macro & Rates', macroById.get('NFCI'), '>0 收紧，<-0.4 宽松', '金融条件收紧通常先压缩高估值资产。'),
      ],
    },
    {
      title: '信用压力',
      summary: '看企业借钱是否变贵。信用越紧，AI 基建融资越脆弱。',
      metrics: [
        macroMetric('BAMLH0A0HYM2', 'Credit Market', macroById.get('BAMLH0A0HYM2'), '>5% 或单周 +50bp 红灯', '高收益债利差快速走阔说明风险资产融资环境恶化。'),
        macroMetric('BAMLC0A0CM', 'Credit Market', macroById.get('BAMLC0A0CM'), '>1.5% 或快速走阔红灯', '大型云厂商和数据中心融资成本的背景变量。'),
        pendingMetric('loan-spread', 'Credit Market', '杠杆贷款利差', '走阔红灯', '高杠杆数据中心融资风险指标。'),
        pendingMetric('private-credit', 'Credit Market', '私募信贷压力', '违约/展期上升红灯', '关注非银信用和数据中心贷款。'),
        pendingMetric('datacenter-debt', 'Credit Market', '数据中心发债压力', '融资快于现金流红灯', 'AI 基建如果依赖债务滚动，泡沫脆弱性上升。'),
        pendingMetric('coreweave-oracle', 'Credit Market', 'CoreWeave / Oracle 融资风险', '再融资困难红灯', '重点观察订单、债务和现金流匹配。'),
      ],
    },
    {
      title: 'AI 股价估值',
      summary: '看 AI 股票涨得快不快、贵不贵、是不是太拥挤。',
      metrics: [
        metricFromIndicator('ai-return-1y', 'Equity Valuation', ai1y, '1Y >80% 红灯', 'Sina daily K', updatedAt),
        metricFromIndicator('spy-excess', 'Equity Valuation', spyExcess, '相对 SPY +30% 红灯', 'Sina daily K', updatedAt),
        metricFromIndicator('qqq-excess', 'Equity Valuation', qqqExcess, '相对 QQQ +20% 红灯', 'Sina daily K', updatedAt),
        metricFromIndicator('avg-distance', 'Equity Valuation', distance, '>30% 红灯，15%-30% 黄灯', 'Sina daily K', updatedAt),
        metricFromIndicator('avg-rsi', 'Equity Valuation', avgRsi, '>75 过热，<45 降温', 'Sina daily K', updatedAt),
        metricFromIndicator('hot-share', 'Equity Valuation', hotShare, '>60% 代表板块扩散过热', 'Sina daily K', updatedAt),
        metricFromIndicator('avg-pe', 'Equity Valuation', avgPe, '>55x 红灯，35x-55x 黄灯', 'Sina quote', updatedAt),
        metricFromIndicator('top3-concentration', 'Equity Valuation', concentration, '>65% 龙头拥挤', 'Sina quote', updatedAt),
        pendingMetric('spx-forward-pe', 'Equity Valuation', '标普500远期市盈率', '历史 90% 分位红灯', '需要接入 FactSet/Yardeni/手动录入。'),
        pendingMetric('nasdaq-ps', 'Equity Valuation', '纳指100市销率', '接近 2000/2021 区间红灯', '需要接入指数估值源。'),
      ],
    },
    {
      title: '财报现金流',
      summary: '看 AI 上下游公司有没有足够现金、现金流和收入增长来支撑估值。',
      metrics: [
        ...['NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AVGO', 'AMD', 'TSM', 'PLTR'].map((symbol) => financialMetricForSymbol(symbol, data, 'Financial Statements')),
      ],
    },
    {
      title: 'AI 基建投入',
      summary: '看云厂商和数据中心链条的 Capex、债务和自由现金流是否匹配。',
      metrics: [
        ...['MSFT', 'GOOGL', 'AMZN', 'META', 'ORCL', 'DELL', 'VRT', 'ANET'].map((symbol) => financialMetricForSymbol(symbol, data, 'Hyperscaler & Datacenter Capex')),
        pendingMetric('mna-8k-rss', 'Capital Actions', '重大投资 / 并购公告', '大额收购或融资显著快于现金流红灯', '需要接入 SEC 8-K、公司公告或新闻/RSS。'),
        pendingMetric('ai-roi-ratio', 'Capital Actions', 'AI 投入回报比', '>1.2 健康，<0.8 危险，<0.7 红灯', '需要公司财报中 AI 收入口径或手动录入。'),
      ],
    },
    {
      title: '芯片龙头热度',
      summary: '看芯片设计、制造、内存和半导体 ETF 是否过热。',
      metrics: ['NVDA', 'AMD', 'AVGO', 'ARM', 'TSM', 'MU', 'SMH'].map((symbol) => {
        const ticker = tickerBySymbol.get(symbol)
        return liveMetric(
          `semi-${symbol}`,
          'Nvidia & Semiconductor Signal',
          `${symbol} 热度 / PE`,
          ticker ? `${ticker.heatScore} / ${ticker.trailingPe ? `${ticker.trailingPe.toFixed(1)}x` : 'N/A'}` : '待更新',
          ticker && ticker.heatScore >= 80 ? 'red' : ticker && ticker.heatScore >= 60 ? 'yellow' : ticker ? 'green' : 'pending',
          '热度 >80 红灯，PE >60x 黄/红灯',
          'Sina quote + daily K',
          updatedAt,
          ticker ? `1Y ${marketSignalFormatters.percent(ticker.return1y)}，200D 偏离 ${marketSignalFormatters.percent(ticker.distance200d)}。` : '等待行情数据。',
        )
      }),
    },
    {
      title: 'AI 应用赚钱能力',
      summary: '看 AI 应用收入能不能跟上投入和估值。',
      metrics: [
        pendingMetric('openai-arr', 'AI Application Monetization', 'OpenAI 收入 / 推理成本', '收入增速低于成本增速红灯', '需要手动录入或新闻跟踪。'),
        pendingMetric('anthropic-arr', 'AI Application Monetization', 'Anthropic 收入 / 毛利率', '融资困难红灯', '需要手动录入。'),
        pendingMetric('copilot-conversion', 'AI Application Monetization', 'Microsoft Copilot 转化率', '低于预期黄灯', '等待财报口径。'),
        pendingMetric('enterprise-token-cost', 'AI Application Monetization', '企业限制 AI Token 成本', '广泛限制红灯', '需要新闻/调研输入。'),
        ...['PLTR', 'CRM', 'NOW', 'SNOW'].map((symbol) => {
          const ticker = tickerBySymbol.get(symbol)
          return liveMetric(
            `app-${symbol}`,
            'AI Application Monetization',
            `${symbol} 市场信号`,
            ticker ? `${ticker.heatScore}` : '待更新',
            ticker && ticker.heatScore >= 80 ? 'red' : ticker && ticker.heatScore >= 60 ? 'yellow' : ticker ? 'neutral' : 'pending',
            '热度 >80 红灯，收入增速放缓需要防守',
            'Sina quote + daily K',
            updatedAt,
            ticker ? `1Y ${marketSignalFormatters.percent(ticker.return1y)}，200D 偏离 ${marketSignalFormatters.percent(ticker.distance200d)}。` : '等待行情数据。',
          )
        }),
      ],
    },
  ]
}

function buildCryptoModules(data: CryptoCycleData): ResearchModule[] {
  const updatedAt = compactDate(data.asOf)
  const btc = data.assets.find((asset) => asset.symbol === 'BTC')
  const eth = data.assets.find((asset) => asset.symbol === 'ETH')
  const sol = data.assets.find((asset) => asset.symbol === 'SOL')
  const latest = data.history[data.history.length - 1]
  const fear = data.fearGreedHistory[0]
  const byName = (name: string) => latestIndicator(data.indicators, name)
  const stable = data.stablecoins

  return [
    {
      title: 'BTC 周期核心',
      summary: '看 BTC 价格位置、趋势线、回撤和成交量。这个模块决定周期大方向。',
      metrics: [
        liveMetric('btc-price', 'BTC Cycle Core', 'BTC 价格', marketSignalFormatters.compact(btc?.price ?? null, '$'), data.heatScore >= 75 ? 'red' : data.heatScore >= 40 ? 'yellow' : 'green', '周期分 >75 进入止盈区', 'Blockchain.com stats', updatedAt, `看 BTC 当前价格和 24 小时变化。24h ${marketSignalFormatters.percent(btc?.change24h ?? null)}。`),
        liveMetric('btc-ath', 'BTC Cycle Core', '距离历史高点', marketSignalFormatters.percent(latest?.drawdown ?? null), latest?.drawdown > -15 ? 'yellow' : latest?.drawdown < -55 ? 'green' : 'neutral', '距 ATH <15% 过热，<-55% 偏底部', 'Blockchain.com market-price', updatedAt, '看现在离历史最高点有多远。越接近高点，追高风险越大。'),
        metricFromIndicator('btc-200d', 'BTC Cycle Core', byName('BTC 相对 200 日均线'), '>50% 过热，<-20% 筑底', 'Blockchain.com market-price', updatedAt),
        metricFromIndicator('btc-200w', 'BTC Cycle Core', byName('BTC 相对 200 周均线'), '接近/低于 200W 偏底部', 'Blockchain.com market-price', updatedAt),
        metricFromIndicator('volume-activity', 'BTC Cycle Core', byName('成交量活跃度'), '>1.5x 过热，<0.8x 冷却', 'Blockchain.com trade-volume', updatedAt),
        pendingMetric('mvrv-z', 'BTC Cycle Core', '链上估值热度', '>7 顶部，<0.5 底部', '需要 Glassnode/CryptoQuant/手动输入。'),
        pendingMetric('realized-price', 'BTC Cycle Core', '持币成本线', '价格低于短期持币成本偏弱', '需要链上数据源。'),
        pendingMetric('pi-cycle', 'BTC Cycle Core', '历史顶部模型', '进入历史顶部区红灯', '需要链上数据源。'),
      ],
    },
    {
      title: 'ETH / SOL 强弱',
      summary: '看 ETH、SOL 这些高 beta 资产有没有跟上 BTC。',
      metrics: [
        liveMetric('eth-price', 'ETH Cycle Core', 'ETH 价格', eth?.price ? marketSignalFormatters.compact(eth.price, '$') : '待更新', eth?.price ? 'neutral' : 'pending', 'ETH/BTC 走强才确认补涨', 'CoinLore / DefiLlama prices', updatedAt, eth?.price ? `看 ETH 是否开始补涨。24h ${marketSignalFormatters.percent(eth.change24h)}，市值 ${marketSignalFormatters.compact(eth.marketCap, '$')}。` : '等待 ETH 行情数据。'),
        pendingMetric('eth-btc', 'ETH Cycle Core', 'ETH 相对 BTC 强弱', '突破 200D 且上行黄/绿灯', '需要 ETH/BTC 历史。'),
        pendingMetric('eth-mvrv', 'ETH Cycle Core', 'ETH 链上估值', '顶部区红灯', '需要链上数据。'),
        pendingMetric('eth-staking', 'ETH Cycle Core', 'ETH ETF / 质押', 'ETF 净流入 + 质押稳定绿灯', '需要 ETF 和链上数据。'),
        pendingMetric('eth-fees', 'ETH Cycle Core', 'ETH 链上收入', '收入和 L2 活动同步扩张绿灯', '需要链上数据。'),
        liveMetric('sol-price', 'ETH Cycle Core', 'SOL 价格', sol?.price ? marketSignalFormatters.compact(sol.price, '$') : '待更新', sol?.price ? 'neutral' : 'pending', 'SOL 强弱辅助判断高 beta 扩散', 'CoinLore / DefiLlama prices', updatedAt, sol?.price ? `看高 beta 资产有没有扩散。24h ${marketSignalFormatters.percent(sol.change24h)}，市值 ${marketSignalFormatters.compact(sol.marketCap, '$')}。` : '等待 SOL 行情数据。'),
      ],
    },
    {
      title: '稳定币流动性',
      summary: '看市场里还有没有新的购买力。稳定币收缩时，不宜盲目加仓。',
      metrics: [
        liveMetric('stablecoin-total', 'Stablecoin Liquidity', '稳定币总量', stable?.totalUsd ? marketSignalFormatters.compact(stable.totalUsd, '$') : '待更新', stable?.change30d === null || stable?.change30d === undefined ? 'pending' : stable.change30d < 0 ? 'yellow' : 'green', '30D 转负红灯', 'DefiLlama stablecoins', updatedAt, stable ? `看链上购买力是否扩张。1D ${marketSignalFormatters.percent(stable.change1d)}，7D ${marketSignalFormatters.percent(stable.change7d)}，30D ${marketSignalFormatters.percent(stable.change30d)}。` : '等待稳定币供应数据。', stable ? marketSignalFormatters.percent(stable.change7d) : '待更新', stable ? marketSignalFormatters.percent(stable.change30d) : '待更新'),
        liveMetric('usdt-usdc', 'Stablecoin Liquidity', 'USDT / USDC 总量', stable ? `${marketSignalFormatters.compact(stable.usdtUsd, '$')} / ${marketSignalFormatters.compact(stable.usdcUsd, '$')}` : '待更新', stable ? 'neutral' : 'pending', 'USDT/USDC 30D 扩张绿灯', 'DefiLlama stablecoins', updatedAt, stable ? `看两大稳定币是否扩张。USDT 30D ${marketSignalFormatters.percent(stable.usdtChange30d)}，USDC 30D ${marketSignalFormatters.percent(stable.usdcChange30d)}。` : '等待 stablecoin supply 数据。', '待更新', stable ? `USDT ${marketSignalFormatters.percent(stable.usdtChange30d)} / USDC ${marketSignalFormatters.percent(stable.usdcChange30d)}` : '待更新'),
        pendingMetric('exchange-stable-balance', 'Stablecoin Liquidity', '交易所稳定币余额', '持续流入绿灯', '需要交易所余额数据。'),
        liveMetric('stablecoin-vs-marketcap', 'Stablecoin Liquidity', '稳定币购买力比例', stable?.totalUsd && data.globalMarket?.totalMarketCap ? `${(stable.totalUsd / data.globalMarket.totalMarketCap * 100).toFixed(1)}%` : '待更新', stable?.totalUsd && data.globalMarket?.totalMarketCap ? 'neutral' : 'pending', '上升代表购买力提升', 'DefiLlama + CoinLore', updatedAt, stable?.totalUsd && data.globalMarket?.totalMarketCap ? `看稳定币相对整个市场够不够多。总市值 ${marketSignalFormatters.compact(data.globalMarket.totalMarketCap, '$')}。` : '等待总市值或稳定币数据。'),
        liveMetric('stablecoin-chain', 'Stablecoin Liquidity', 'ETH / SOL 链上稳定币', stable ? `${marketSignalFormatters.compact(stable.ethereumUsd, '$')} / ${marketSignalFormatters.compact(stable.solanaUsd, '$')}` : '待更新', stable ? 'neutral' : 'pending', '链上稳定币扩张支撑风险偏好', 'DefiLlama stablecoins', updatedAt, '看购买力主要停留在哪些链上。'),
      ],
    },
    {
      title: 'ETF / 机构资金',
      summary: '看机构资金有没有持续流入。这个模块目前主要是待接入。',
      metrics: [
        pendingMetric('btc-etf-flow', 'ETF & Institutional Flow', 'BTC ETF 资金流', '连续 5 天净流出红灯', '需要 ETF flow 数据源。'),
        pendingMetric('eth-etf-flow', 'ETF & Institutional Flow', 'ETH ETF 资金流', '连续净流入绿灯', '需要 ETF flow 数据源。'),
        pendingMetric('coinbase-premium', 'ETF & Institutional Flow', 'Coinbase 溢价', '正溢价绿灯', '需要 Coinbase/Binance 价差。'),
        pendingMetric('cme-basis', 'ETF & Institutional Flow', 'CME 期货持仓 / 溢价', '溢价过热红灯', '需要 CME 数据。'),
      ],
    },
    {
      title: '杠杆风险',
      summary: '看合约杠杆是否过热。杠杆过热会放大回撤。',
      metrics: [
        pendingMetric('futures-oi', 'Leverage & Derivatives', 'BTC / ETH 期货持仓', '持仓快速上升但价格不涨红灯', '需要 Coinalyze/Glassnode。'),
        pendingMetric('funding', 'Leverage & Derivatives', '资金费率', '连续 7 天高位红灯', '需要永续合约数据。'),
        pendingMetric('basis', 'Leverage & Derivatives', '永续合约溢价', '过热红灯', '需要衍生品数据。'),
        pendingMetric('options-skew', 'Leverage & Derivatives', '期权偏斜 / 看跌看涨比', '看涨拥挤红灯', '需要 Deribit 数据。'),
      ],
    },
    {
      title: '链上真实需求',
      summary: '看是不是真的有人在链上使用和转账，而不是只有价格上涨。',
      metrics: [
        pendingMetric('active-addresses', 'On-chain Demand', '活跃地址 / 交易数', '价格涨但地址不涨黄灯', '需要链上数据。'),
        pendingMetric('exchange-flow', 'On-chain Demand', '交易所流入 / 流出', '大额净流入红灯', '需要交易所流向数据。'),
        pendingMetric('whale-miner', 'On-chain Demand', '鲸鱼增持 / 矿工卖出', '矿工和鲸鱼同步卖出红灯', '需要链上数据。'),
        pendingMetric('sopr', 'On-chain Demand', '链上利润兑现', '长期高利润兑现红灯', '需要链上数据。'),
      ],
    },
    {
      title: '山寨扩散',
      summary: '看资金有没有从 BTC 扩散到 ETH、山寨和 meme。',
      metrics: [
        liveMetric('btc-dominance', 'Altcoin Season', 'BTC 市占率', data.bitcoinDominance === null ? '待更新' : `${data.bitcoinDominance.toFixed(1)}%`, data.bitcoinDominance === null ? 'pending' : data.bitcoinDominance < 45 ? 'yellow' : 'neutral', '<45% 且 meme 放量为小盘狂热', 'CoinLore global market', updatedAt, data.ethDominance === null ? '看资金是否从 BTC 扩散到山寨。' : `看资金是否从 BTC 扩散到山寨。ETH 市占率 ${data.ethDominance.toFixed(1)}%。`),
        pendingMetric('total2-total3', 'Altcoin Season', '山寨总市值', '相对 BTC 上行绿灯', '需要 TradingView/CMC 数据。'),
        pendingMetric('alt-season-index', 'Altcoin Season', '山寨季指数', '>75 山寨季，>90 狂热', '需要 BlockchainCenter/手动输入。'),
        pendingMetric('meme-volume', 'Altcoin Season', 'Meme 成交量 / 新币发行', '暴涨红灯', '需要 DEX 和新币数据。'),
      ],
    },
    {
      title: '市场情绪',
      summary: '看大家是恐惧还是贪婪。极端贪婪容易回调，极端恐惧可能接近底部。',
      metrics: [
        liveMetric('fear-greed', 'Crypto Sentiment', '恐惧贪婪指数', fear ? `${fear.value}` : '待更新', fear ? (fear.value > 80 ? 'red' : fear.value < 25 ? 'green' : 'neutral') : 'pending', '>80 顶部风险，<25 恐惧', 'Alternative.me', updatedAt, fear ? `看市场情绪是不是过热或过冷。当前状态: ${fear.label}。` : '等待情绪数据。'),
        pendingMetric('google-trends', 'Crypto Sentiment', '比特币搜索热度', '爆表红灯', '需要 Trends 数据。'),
        pendingMetric('coinbase-rank', 'Crypto Sentiment', '交易所 App 排名', '排名飙升红灯', '需要 App Store 排名。'),
        pendingMetric('retail-hype', 'Crypto Sentiment', '社交 / Meme / NFT 热度', '全面疯狂红灯', '需要社交和 NFT 数据。'),
      ],
    },
  ]
}

function buildAiTriggers(data: AiBubbleData): ResearchTrigger[] {
  const score = data.bubbleScore
  const usable = usableFinancials(data)
  const capexToFreeCashflow = ratioFromFinancialSums(
    usable.map((snapshot) => snapshot.capitalExpenditure),
    usable.map((snapshot) => snapshot.freeCashflow),
  )
  const debtCashRatio = ratioFromFinancialSums(
    usable.map((snapshot) => snapshot.totalDebt),
    usable.map((snapshot) => snapshot.totalCash),
  )
  return [
    { id: 'ai-score-80', title: 'AI 泡沫分 > 80', probability: score > 70 ? '高' : '中', impact: 'critical', status: score > 80 ? 'red' : score > 65 ? 'yellow' : 'green', tracking: 'AI 泡沫总分', action: score > 80 ? '降风险敞口，保护利润' : '继续跟踪分数是否突破 70/80。' },
    { id: 'hy-oas', title: '高收益债利差单周走阔 > 50bp', probability: '待更新', impact: 'high', status: 'pending', tracking: '高收益债利差', action: '触发后削减高估值 AI 和高杠杆数据中心链条。' },
    { id: 'ten-year', title: '10年美债利率 > 4.8%', probability: '待更新', impact: 'high', status: 'pending', tracking: '10年美债利率', action: '触发后降低长久期成长股 beta。' },
    { id: 'nvda-guide', title: '英伟达指引不及预期 / 毛利率下降', probability: '待更新', impact: 'critical', status: 'pending', tracking: 'NVDA 指引、毛利率、库存', action: '触发后 AI 半导体仓位优先减半。' },
    { id: 'capex-fcf', title: 'AI Capex / 自由现金流 > 100%', probability: capexToFreeCashflow === null ? '待更新' : capexToFreeCashflow > 1 ? '高' : '低', impact: 'high', status: capexToFreeCashflow === null ? 'pending' : capexToFreeCashflow > 1.6 ? 'red' : capexToFreeCashflow > 1 ? 'yellow' : 'green', tracking: 'SEC companyfacts 财报现金流事实', action: capexToFreeCashflow !== null && capexToFreeCashflow > 1 ? '停止追高，重点看云厂商 Capex 指引是否下调。' : '继续观察 Capex 是否由现金流覆盖。' },
    { id: 'debt-cash', title: 'AI 链条债务 / 现金 > 1.5x', probability: debtCashRatio === null ? '待更新' : debtCashRatio > 1.5 ? '中高' : '低', impact: 'high', status: debtCashRatio === null ? 'pending' : debtCashRatio > 2.4 ? 'red' : debtCashRatio > 1.5 ? 'yellow' : 'green', tracking: 'SEC companyfacts 现金和负债事实', action: debtCashRatio !== null && debtCashRatio > 1.5 ? '削减依赖融资扩张的数据中心和二线 AI 标的。' : '债务相对现金暂未形成核心压力。' },
    { id: 'capex-down', title: '两家以上云厂商下调 AI 资本开支', probability: '待更新', impact: 'critical', status: 'pending', tracking: 'MSFT/GOOGL/AMZN/META/ORCL Capex 指引', action: '确认 AI 基建需求拐点，转入高度防御。' },
    { id: 'roi-ratio', title: 'AI 收入 / AI 投入 < 0.8', probability: '待更新', impact: 'high', status: 'pending', tracking: 'AI 投入回报比', action: '停止追高，等待盈利兑现或估值压缩。' },
  ]
}

function buildCryptoTriggers(data: CryptoCycleData): ResearchTrigger[] {
  const score = data.heatScore
  const fear = data.fearGreedHistory[0]?.value
  return [
    { id: 'crypto-score-85', title: '加密周期分 > 85', probability: score > 75 ? '中高' : '低', impact: 'critical', status: score > 85 ? 'red' : score > 70 ? 'yellow' : 'green', tracking: '加密周期总分', action: score > 85 ? '分批止盈或对冲' : '维持当前策略，观察是否进入牛末。' },
    { id: 'mvrv-top', title: 'BTC 链上估值进入顶部区', probability: '待更新', impact: 'critical', status: 'pending', tracking: 'BTC MVRV Z-Score', action: '触发后 BTC/ETH 优先止盈。' },
    { id: 'funding-hot', title: '资金费率连续 7 天过热', probability: '待更新', impact: 'high', status: 'pending', tracking: '资金费率', action: '降低杠杆和山寨币敞口。' },
    { id: 'stablecoin-negative', title: '稳定币 30D 供应转负', probability: '待更新', impact: 'high', status: 'pending', tracking: '稳定币供应增长', action: '停止加仓，等待流动性恢复。' },
    { id: 'etf-outflow', title: 'ETF 连续 5 天净流出', probability: '待更新', impact: 'medium', status: 'pending', tracking: 'BTC/ETH ETF 资金流', action: '降低短线仓位，观察是否引发趋势破位。' },
    { id: 'retail-euphoria', title: '散户热度爆表', probability: fear && fear > 75 ? '中' : '低', impact: 'high', status: fear && fear > 80 ? 'red' : 'neutral', tracking: '恐惧贪婪 + App/搜索热度', action: '若同时山寨疯狂，开始分批兑现。' },
  ]
}

function buildAiPageAlerts(data: AiBubbleData): ResearchAlert[] {
  const alerts: ResearchAlert[] = []
  const hyOas = data.macroSignals.find((signal) => signal.id === 'BAMLH0A0HYM2')
  const tenYear = data.macroSignals.find((signal) => signal.id === 'DGS10')
  const realYield = data.macroSignals.find((signal) => signal.id === 'DFII10')
  const scoredTickerCount = data.tickers.filter((ticker) => ticker.heatScore > 0).length
  const usable = usableFinancials(data)
  const capexToFreeCashflow = ratioFromFinancialSums(
    usable.map((snapshot) => snapshot.capitalExpenditure),
    usable.map((snapshot) => snapshot.freeCashflow),
  )
  const debtCashRatio = ratioFromFinancialSums(
    usable.map((snapshot) => snapshot.totalDebt),
    usable.map((snapshot) => snapshot.totalCash),
  )

  if (data.basketHistory.length < 253 || scoredTickerCount < 9) {
    alerts.push({
      id: 'ai-price-history-degraded',
      title: 'AI 价格历史源异常，当前为降级评分',
      severity: 'medium',
      currentValue: `${data.basketHistory.length} 天 / ${scoredTickerCount} 只可评分`,
      threshold: '>=253 天且 >=9 只股票',
      explanation: 'Sina 日线接口当前返回空数据，股价过热、扩散和超额收益指标没有完整参与。',
      action: '先看宏观、估值快照和 SEC 财报面板；不要把当前阶段当成完整价格模型结论。',
    })
  }

  if (data.bubbleScore >= 80) {
    alerts.push({ id: 'ai-score', title: 'AI 泡沫分进入危险区', severity: 'critical', currentValue: `${data.bubbleScore}`, threshold: '>=80', explanation: '价格、估值和宏观脆弱性已经进入高风险区。', action: '降低高 beta AI 和高估值半导体敞口。' })
  } else if (data.bubbleScore >= 68) {
    alerts.push({ id: 'ai-score-warm', title: 'AI 泡沫分进入验证区', severity: 'medium', currentValue: `${data.bubbleScore}`, threshold: '>=68', explanation: '趋势仍可参与，但需要财报和现金流兑现来支撑估值。', action: '保留核心仓位，减少追高和杠杆。' })
  }

  if ((hyOas?.change1w ?? 0) >= 0.5 || (hyOas?.value ?? 0) >= 5) {
    alerts.push({ id: 'hy-oas', title: '高收益信用利差恶化', severity: 'high', currentValue: formatMacroValue(hyOas), threshold: '>=5% 或 1W +50bp', explanation: '信用压力上升会削弱 AI 基建融资链条。', action: '削减依赖外部融资的 AI 基建链条。' })
  }

  if ((tenYear?.value ?? 0) >= 4.8 || (realYield?.value ?? 0) >= 2.3) {
    alerts.push({ id: 'rates', title: '长端/实际利率进入估值压力区', severity: 'high', currentValue: `10Y ${formatMacroValue(tenYear)} / Real ${formatMacroValue(realYield)}`, threshold: '10Y >=4.8% 或 Real >=2.3%', explanation: '长久期成长股对贴现率更敏感。', action: '降低估值扩张驱动的 AI 标的权重。' })
  }

  if (capexToFreeCashflow !== null && capexToFreeCashflow >= 1) {
    alerts.push({ id: 'capex-fcf', title: 'AI 基建投入开始压自由现金流', severity: capexToFreeCashflow >= 1.6 ? 'high' : 'medium', currentValue: `${(capexToFreeCashflow * 100).toFixed(0)}%`, threshold: 'Capex/FCF >=100%', explanation: '资本开支高于自由现金流时，AI 基建链条更依赖融资和持续高增长。', action: '停止追高数据中心和二线 AI 基建，等待财报确认回报。' })
  }

  if (debtCashRatio !== null && debtCashRatio >= 1.5) {
    alerts.push({ id: 'debt-cash', title: 'AI 链条债务相对现金偏高', severity: debtCashRatio >= 2.4 ? 'high' : 'medium', currentValue: `${debtCashRatio.toFixed(2)}x`, threshold: '债务/现金 >=1.5x', explanation: '债务越快于现金，越怕信用条件收紧和并购/投资回报不及预期。', action: '优先降低高债务、高 Capex、低 FCF 的 AI 基建链条。' })
  }

  if (!alerts.length) {
    alerts.push({ id: 'ai-normal', title: '暂无 AI 核心红色预警', severity: 'low', currentValue: `${data.bubbleScore}`, threshold: '>=68/80', explanation: '当前 AI 泡沫分数未进入危险区，宏观和信用压力未形成叠加。', action: '保持周度更新，重点看龙头财报、Capex 指引和信用利差。' })
  }

  return alerts
}

function buildCryptoPageAlerts(data: CryptoCycleData): ResearchAlert[] {
  const alerts: ResearchAlert[] = []
  const fear = data.fearGreedHistory[0]?.value
  const stableChange = data.stablecoins?.change30d

  if (data.heatScore >= 85) {
    alerts.push({ id: 'crypto-score', title: '加密周期分进入顶部区', severity: 'critical', currentValue: `${data.heatScore}`, threshold: '>=85', explanation: '周期热度进入牛末或顶部风险区。', action: '分批止盈，降低山寨和杠杆敞口。' })
  } else if (data.heatScore >= 70) {
    alerts.push({ id: 'crypto-hot', title: '加密周期分进入高温区', severity: 'medium', currentValue: `${data.heatScore}`, threshold: '>=70', explanation: '趋势偏强但风险收益开始变差。', action: '持有为主，新增仓位等待回撤。' })
  }

  if (fear !== undefined && fear >= 80) {
    alerts.push({ id: 'fear', title: 'Crypto 情绪极端贪婪', severity: 'high', currentValue: `${fear}`, threshold: '>=80', explanation: '散户追涨情绪过热，局部回撤概率上升。', action: '停止追高，减少高 beta 山寨。' })
  }

  if (stableChange !== null && stableChange !== undefined && stableChange < 0) {
    alerts.push({ id: 'stablecoin', title: '稳定币供应 30D 收缩', severity: 'medium', currentValue: marketSignalFormatters.percent(stableChange), threshold: '<0%', explanation: '链上购买力边际下降，不利于持续风险扩张。', action: '等待稳定币供应恢复扩张再加仓。' })
  }

  if (!alerts.length) {
    alerts.push({ id: 'crypto-normal', title: '暂无 Crypto 核心红色预警', severity: 'low', currentValue: `${data.heatScore}`, threshold: '>=70/85', explanation: '当前加密周期热度未进入顶部区，情绪和流动性未形成极端共振。', action: '按周期分和趋势均线执行仓位计划。' })
  }

  return alerts
}

function InfoHint(props: { text: string }) {
  void props
  return null
}

function SimpleLegend() {
  const items: Array<{ status: MetricStatus; label: string }> = [
    { status: 'green', label: '正常' },
    { status: 'neutral', label: '观察' },
    { status: 'yellow', label: '注意' },
    { status: 'red', label: '危险' },
  ]

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {items.map((item) => (
        <span key={item.status} className={`rounded-md border px-2.5 py-1 ${statusStyles[item.status]}`} title={statusPlainText(item.status)}>
          {item.label}
        </span>
      ))}
    </div>
  )
}

function CryptoSignalBoard({ map }: { map: CycleMapData }) {
  const lights = cryptoSignalLights(map)

  return (
    <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">关键灯号</h2>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
            后台指标压成 5 个灯：看灯号就能判断现在该抄底、等待、加仓还是防守。
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-500 light:text-gray-600">绿色好，黄色谨慎，红色防守</div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {lights.map((light) => (
          <div key={light.id} className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 bg-dark-900/20 dark:bg-dark-900/20 light:bg-gray-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-500 light:text-gray-600">{light.title}</div>
                <div className="mt-1 text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">{light.verdict}</div>
              </div>
              <span className={`shrink-0 rounded-md border px-2 py-1 text-xs ${statusStyles[light.status]}`}>
                {statusText(light.status)}
              </span>
            </div>

            <div className="mt-4">
              <div className="h-2 rounded-full bg-dark-700 dark:bg-dark-700 light:bg-gray-200 overflow-hidden">
                <div className={`h-full rounded-full ${lightBarClass(light.status)}`} style={{ width: `${clampPercent(light.progress)}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-gray-500">
                <span>{light.lowLabel}</span>
                <span>{light.highLabel}</span>
              </div>
            </div>

            <div className="mt-3 font-mono text-sm text-gray-300 dark:text-gray-300 light:text-gray-700">{light.value}</div>
            <div className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-500 light:text-gray-600">{light.detail}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AiBubbleStagePanel({ data, action }: { data: AiBubbleData; action: string }) {
  const stages = [
    { label: '冷却修复', start: 0, end: 32, className: 'bg-sky-500/35', textClass: 'text-sky-200' },
    { label: '正常偏热', start: 32, end: 50, className: 'bg-emerald-500/35', textClass: 'text-emerald-200' },
    { label: '升温扩张', start: 50, end: 68, className: 'bg-amber-500/35', textClass: 'text-amber-200' },
    { label: '泡沫预警', start: 68, end: 82, className: 'bg-orange-500/40', textClass: 'text-orange-200' },
    { label: '狂热泡沫', start: 82, end: 100, className: 'bg-rose-500/45', textClass: 'text-rose-200' },
  ]

  return (
    <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <div>
          <div className="text-sm text-gray-400">AI 泡沫阶段</div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className={`rounded-md border px-3 py-1 text-sm font-semibold ${statusStyles[aiRiskStatus(data.bubbleScore)]}`}>
              {data.stage}
            </span>
            <span className="rounded-md border border-dark-600 dark:border-dark-600 light:border-gray-200 px-3 py-1 text-sm text-gray-400">
              更新时间 {compactDate(data.asOf)}
            </span>
          </div>
          <div className="mt-4 text-3xl font-bold text-gray-100 dark:text-gray-100 light:text-gray-900">
            当前处于：{data.stage}
          </div>
          <div className="mt-3 text-2xl font-semibold text-primary">{action}</div>
          <div className="mt-4 max-w-3xl text-sm leading-6 text-gray-400 dark:text-gray-400 light:text-gray-600">
            当前泡沫温度 {data.bubbleScore}/100。页面把股价、估值、扩散、宏观资金和产业链兑现压成灯号，不需要先读原始指标。
          </div>
        </div>

        <div className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 bg-dark-900/20 dark:bg-dark-900/20 light:bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-gray-100 dark:text-gray-100 light:text-gray-900">阶段条</div>
            <div className="font-mono text-sm text-gray-400">{data.bubbleScore}/100</div>
          </div>
          <div className="relative mt-6 h-24 rounded-lg border border-dark-600 dark:border-dark-600 light:border-gray-300 overflow-hidden">
            {stages.map((stage) => (
              <div
                key={stage.label}
                className={`absolute top-0 h-full px-2 py-4 ${stage.className}`}
                style={{ left: `${stage.start}%`, width: `${stage.end - stage.start}%` }}
              >
                <div className={`text-xs font-semibold leading-4 ${stage.textClass}`}>{stage.label}</div>
              </div>
            ))}
            <div
              className="absolute top-0 bottom-0 z-20 -translate-x-1/2"
              style={{ left: `${clampPercent(data.bubbleScore)}%` }}
            >
              <div className="mx-auto h-full w-0.5 bg-primary" />
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-white">
                现在
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 text-xs text-gray-500">
            <span>冷却</span>
            <span className="text-center">升温</span>
            <span className="text-right">狂热</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function AiSignalBoard({ data }: { data: AiBubbleData }) {
  const lights = aiSignalLights(data)

  return (
    <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">泡沫关键灯号</h2>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
            把 AI 股票、估值、扩散、宏观和产业链兑现压成 6 个灯号。
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-500 light:text-gray-600">绿色正常，黄色预警，红色泡沫脆弱</div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {lights.map((light) => (
          <div key={light.id} className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 bg-dark-900/20 dark:bg-dark-900/20 light:bg-gray-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-500 light:text-gray-600">{light.title}</div>
                <div className="mt-1 text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">{light.verdict}</div>
              </div>
              <span className={`shrink-0 rounded-md border px-2 py-1 text-xs ${statusStyles[light.status]}`}>
                {statusText(light.status)}
              </span>
            </div>
            <div className="mt-4">
              <div className="h-2 rounded-full bg-dark-700 dark:bg-dark-700 light:bg-gray-200 overflow-hidden">
                <div className={`h-full rounded-full ${lightBarClass(light.status)}`} style={{ width: `${clampPercent(light.progress)}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-gray-500">
                <span>{light.lowLabel}</span>
                <span>{light.highLabel}</span>
              </div>
            </div>
            <div className="mt-3 font-mono text-sm text-gray-300 dark:text-gray-300 light:text-gray-700">{light.value}</div>
            <div className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-500 light:text-gray-600">{light.detail}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AiChainBoard({ data }: { data: AiBubbleData }) {
  const layers = aiChainLayers(data)

  return (
    <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">AI 产业链热度</h2>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
            看泡沫集中在卖铲子的算力端，还是已经传导到云和应用收入端。
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-500 light:text-gray-600">热度越高，估值越需要业绩兑现</div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3">
        {layers.map((layer) => (
          <div key={layer.id} className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 bg-dark-900/20 dark:bg-dark-900/20 light:bg-gray-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-500 light:text-gray-600">{layer.subtitle}</div>
                <div className="mt-1 text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">{layer.title}</div>
              </div>
              <span className={`shrink-0 rounded-md border px-2 py-1 text-xs ${statusStyles[layer.status]}`}>
                {layer.verdict}
              </span>
            </div>
            <div className="mt-4 h-3 rounded-full bg-dark-700 dark:bg-dark-700 light:bg-gray-200 overflow-hidden">
              <div className={`h-full rounded-full ${lightBarClass(layer.status)}`} style={{ width: `${clampPercent(layer.heat)}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="font-mono text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">{Math.round(layer.heat)}</div>
              <div className="truncate text-xs text-gray-500">{layer.symbols}</div>
            </div>
            <div className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-500 light:text-gray-600">{layer.detail}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AiCapitalHealthBoard({ data, isLoadingFinancials }: { data: AiBubbleData; isLoadingFinancials: boolean }) {
  const cards = aiCapitalCards(data)
  const financials = aiFinancialSnapshots(data)
  const usable = usableFinancials(data)
  const updatedAt = financialUpdatedAt(usable, data.asOf)
  const isWaiting = isLoadingFinancials && usable.length === 0

  return (
    <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">财报和资本动作</h2>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
            把现金、负债、自由现金流、Capex 和投资并购压成结论。绿色能支撑，红色需要防守。
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-500 light:text-gray-600">
          {isWaiting ? '正在读取 SEC 财报...' : `覆盖 ${usable.length}/${financials.length} · 更新 ${updatedAt}`}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {cards.map((card) => (
          <div key={card.id} className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 bg-dark-900/20 dark:bg-dark-900/20 light:bg-gray-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-500 light:text-gray-600">{card.title}</div>
                <div className="mt-1 text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">{card.verdict}</div>
              </div>
              <span className={`shrink-0 rounded-md border px-2 py-1 text-xs ${statusStyles[card.status]}`}>
                {statusText(card.status)}
              </span>
            </div>

            <div className="mt-4">
              <div className="h-2 rounded-full bg-dark-700 dark:bg-dark-700 light:bg-gray-200 overflow-hidden">
                <div className={`h-full rounded-full ${lightBarClass(card.status)}`} style={{ width: `${clampPercent(card.progress)}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-gray-500">
                <span>{card.lowLabel}</span>
                <span>{card.highLabel}</span>
              </div>
            </div>

            <div className="mt-3 font-mono text-sm text-gray-300 dark:text-gray-300 light:text-gray-700">{card.value}</div>
            <div className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-500 light:text-gray-600">{card.detail}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CycleMapPanel({ map }: { map: CycleMapData }) {
  return (
    <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">
            牛熊周期地图
            <InfoHint text="这张图按减半后的历史节奏画出牛市、熊市、筑底和熊转牛确认窗口。竖线“今天”表示当前所在位置。" />
          </div>
          <div className="mt-2 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
            直接看“今天”竖线落在哪个颜色区，再看下一个拐点日期。时间轴已扩展到 2030 年末，2028 之后为按下一次减半节奏推演的观察区。
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm xl:max-w-[760px] xl:justify-end">
          <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-200">
            现在: {map.currentPhase}
          </span>
          <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-sky-200">
            下一拐点: {map.nextTurnDate} · {map.nextTurnLabel}
          </span>
          <span className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-primary">
            动作: {map.currentAction}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 bg-dark-900/20 dark:bg-dark-900/20 light:bg-gray-50 p-4">
        <div className="overflow-x-auto">
          <div className="relative min-w-[1800px] h-[310px]">
            <div className="absolute left-0 right-0 top-[30px] h-px bg-dark-700 dark:bg-dark-700 light:bg-gray-300">
              {map.yearTicks.map((tick) => {
                const edgeAlign = tick.position <= 1
                  ? 'translate-x-0'
                  : tick.position >= 99
                    ? '-translate-x-full'
                    : '-translate-x-1/2'
                const textAlign = tick.position <= 1
                  ? 'text-left'
                  : tick.position >= 99
                    ? 'text-right'
                    : 'text-center'

                return (
                  <div
                    key={tick.id}
                    className={`absolute top-1/2 -translate-y-1/2 ${edgeAlign}`}
                    style={{ left: `${tick.position}%` }}
                  >
                    <div className="mx-auto h-3 w-px bg-dark-500 dark:bg-dark-500 light:bg-gray-400" />
                    <div className={`mt-1 w-20 text-[11px] text-gray-500 dark:text-gray-500 light:text-gray-600 ${textAlign}`}>
                      {tick.label}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="absolute left-0 right-0 top-[78px] h-24 overflow-hidden rounded-lg border border-dark-600 dark:border-dark-600 light:border-gray-300">
              {map.segments.map((segment) => {
                const left = positionBetween(segment.start, map.startDate, map.endDate)
                const right = positionBetween(segment.end, map.startDate, map.endDate)
                return (
                  <div
                    key={segment.id}
                    className={`absolute top-0 h-full border-r border-dark-800/50 dark:border-dark-800/50 light:border-white/60 px-3 py-4 ${segment.colorClass}`}
                    style={{ left: `${left}%`, width: `${Math.max(0, right - left)}%` }}
                  >
                    <div className={`text-sm font-semibold ${segment.textClass}`}>{segment.label}</div>
                    <div className="mt-1 text-xs text-gray-300 dark:text-gray-300 light:text-gray-700">{segment.subLabel}</div>
                    <div className="mt-3 text-[11px] text-gray-400 dark:text-gray-400 light:text-gray-600">
                      {exactDate(segment.start)}
                    </div>
                  </div>
                )
              })}
            </div>

            <div
              className="absolute top-4 bottom-8 z-20 -translate-x-1/2"
              style={{ left: `${map.nowPosition}%` }}
            >
              <div className="mx-auto w-max rounded-md border border-primary/50 bg-primary px-3 py-1 text-xs font-semibold text-white shadow-lg">
                今天
              </div>
              <div className="mx-auto h-[250px] w-0.5 bg-primary" />
            </div>

            {map.markers.map((marker, index) => (
              <div
                key={marker.id}
                className="absolute z-10 -translate-x-1/2"
                style={{ left: `${marker.position}%`, top: index % 2 === 0 ? 172 : 228 }}
              >
                <div className={`mx-auto h-8 w-px ${marker.tone === 'red' ? 'bg-rose-400' : marker.tone === 'green' ? 'bg-emerald-400' : marker.tone === 'yellow' ? 'bg-amber-400' : 'bg-sky-400'}`} />
                <div className={`mt-1 w-28 rounded-md border px-2 py-1 text-center text-[11px] leading-4 ${statusStyles[marker.tone]}`}>
                  <div className="font-medium">{marker.label}</div>
                  <div className="mt-0.5 opacity-80">{exactDate(marker.date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-md border border-dark-700 dark:border-dark-700 light:border-gray-200 px-3 py-2">
            <span className="text-gray-500">牛转熊窗口: </span>
            <span className="text-rose-300">{map.bearTurnWindow}</span>
          </div>
          <div className="rounded-md border border-dark-700 dark:border-dark-700 light:border-gray-200 px-3 py-2">
            <span className="text-gray-500">抄底窗口: </span>
            <span className="text-amber-300">{map.bottomWindow}</span>
          </div>
          <div className="rounded-md border border-dark-700 dark:border-dark-700 light:border-gray-200 px-3 py-2">
            <span className="text-gray-500">熊转牛确认: </span>
            <span className="text-emerald-300">{map.bullConfirmWindow}</span>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">{map.currentDetail}</div>
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-[0.9fr_1.2fr_0.9fr] gap-4">
        <div className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 bg-dark-900/20 dark:bg-dark-900/20 light:bg-gray-50 p-4">
          <div className="text-sm font-medium text-gray-100 dark:text-gray-100 light:text-gray-900">抄底窗口进度</div>
          <div className="mt-5">
            <div className="relative h-4 rounded-full bg-dark-700 dark:bg-dark-700 light:bg-gray-200">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400" style={{ width: `${map.bottomProgress}%` }} />
              <div className="absolute top-1/2 h-8 w-0.5 -translate-y-1/2 bg-primary" style={{ left: `${map.bottomProgress}%` }} />
            </div>
            <div className="mt-3 flex justify-between text-xs text-gray-500">
              <span>窗口开始</span>
              <span>今天</span>
              <span>窗口结束</span>
            </div>
          </div>
          <div className="mt-4 text-2xl font-semibold text-amber-300">{Math.round(map.bottomProgress)}%</div>
          <div className="mt-1 text-sm text-gray-500">越靠右，左侧抄底窗口越接近结束。</div>
        </div>

        <div className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 bg-dark-900/20 dark:bg-dark-900/20 light:bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-gray-100 dark:text-gray-100 light:text-gray-900">熊转牛确认仪表</div>
            <div className="rounded-md border border-dark-600 dark:border-dark-600 light:border-gray-200 px-2 py-1 text-xs text-gray-400">
              {map.confirmationCount}/4
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {map.confirmItems.map((item) => (
              <div key={item.id}>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className={item.passed ? 'text-emerald-300' : 'text-gray-400'}>{item.label}</span>
                  <span className="font-mono text-gray-500">{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-dark-700 dark:bg-dark-700 light:bg-gray-200">
                  <div
                    className={`h-full rounded-full ${item.status === 'green' ? 'bg-emerald-400' : item.status === 'red' ? 'bg-rose-400' : item.status === 'yellow' ? 'bg-amber-400' : 'bg-sky-400'}`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 bg-dark-900/20 dark:bg-dark-900/20 light:bg-gray-50 p-4">
          <div className="text-sm font-medium text-gray-100 dark:text-gray-100 light:text-gray-900">市场温度条</div>
          <div className="relative mt-6 h-5 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500">
            <div className="absolute top-1/2 h-9 w-1 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${map.heatPosition}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-3 text-xs text-gray-500">
            <span>冷</span>
            <span className="text-center">中</span>
            <span className="text-right">热</span>
          </div>
          <div className="mt-4 text-2xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">{Math.round(map.heatPosition)}</div>
          <div className="mt-1 text-sm text-gray-500">低温适合观察底部，高温优先防御。</div>
        </div>
      </div>
    </div>
  )
}

function MetricGrid({ metrics, onSelect }: { metrics: ResearchMetric[]; onSelect: (metric: ResearchMetric) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {metrics.map((metric) => (
        <button
          key={metric.id}
          type="button"
          onClick={() => onSelect(metric)}
          className="text-left rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 bg-dark-900/40 dark:bg-dark-900/40 light:bg-gray-50 p-4 hover:border-primary/60 transition-all"
          title={metric.description}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-100 dark:text-gray-100 light:text-gray-900">
                <span>{metric.name}</span>
                <InfoHint text={`${metric.description} ${metric.interpretation}`} />
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className="font-mono text-3xl font-bold text-gray-100 dark:text-gray-100 light:text-gray-900">{metric.score}</span>
                <span className="pb-1 text-xs text-gray-500">/100</span>
              </div>
            </div>
            <span className={`shrink-0 rounded-md border px-2 py-1 text-xs font-medium ${statusStyles[metric.status]}`}>
              {statusText(metric.status)}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-300 dark:text-gray-300 light:text-gray-700">{statusPlainText(metric.status)}</div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500 light:text-gray-600">当前值: {metric.currentValue}</div>
          {(metric.weeklyChange !== '待更新' || metric.monthlyChange !== '待更新') && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-500 light:text-gray-600">
              {metric.weeklyChange !== '待更新' && <div>周变: {metric.weeklyChange}</div>}
              {metric.monthlyChange !== '待更新' && <div>月变: {metric.monthlyChange}</div>}
            </div>
          )}
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">判断线: {metric.threshold}</div>
        </button>
      ))}
    </div>
  )
}

function PendingList({ items }: { items: PendingItem[] }) {
  if (!items.length) return null

  return (
    <div className="mt-5 rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 bg-dark-900/30 dark:bg-dark-900/30 light:bg-gray-50 p-4">
      <div className="text-sm font-medium text-gray-100 dark:text-gray-100 light:text-gray-900">待接入观察清单</div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-md border border-dark-700/70 dark:border-dark-700/70 light:border-gray-200 px-3 py-2">
            <div className="flex items-center gap-2 text-sm text-gray-200 dark:text-gray-200 light:text-gray-800">
              <span>{item.name}</span>
              <InfoHint text={`${item.name}: 当前没有稳定 live 数据源，所以只作为观察项，不参与评分。判断线: ${item.threshold}`} />
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-500 light:text-gray-600">{item.source} · {item.threshold}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[260px] items-center justify-center rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 bg-dark-900/30 dark:bg-dark-900/30 light:bg-gray-50 text-sm text-gray-500">
      {message}
    </div>
  )
}

function TriggerTable({ triggers }: { triggers: ResearchTrigger[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-dark-700 dark:border-dark-700 light:border-gray-200 text-left text-xs uppercase text-gray-500">
            <th className="py-3 pr-4 font-medium">触发器</th>
            <th className="py-3 pr-4 font-medium">概率</th>
            <th className="py-3 pr-4 font-medium">影响</th>
            <th className="py-3 pr-4 font-medium">状态</th>
            <th className="py-3 pr-4 font-medium">跟踪数据</th>
            <th className="py-3 font-medium">发生后动作</th>
          </tr>
        </thead>
        <tbody>
          {triggers.map((trigger) => (
            <tr key={trigger.id} className="border-b border-dark-700/70 dark:border-dark-700/70 light:border-gray-100">
              <td className="py-3 pr-4 font-medium text-gray-100 dark:text-gray-100 light:text-gray-900">
                <div className="flex items-center gap-2">
                  <span>{trigger.title}</span>
                  <InfoHint text={`用来判断是否需要改变仓位。跟踪: ${trigger.tracking}。触发后: ${trigger.action}`} />
                </div>
              </td>
              <td className="py-3 pr-4 text-gray-300 dark:text-gray-300 light:text-gray-700">{trigger.probability}</td>
              <td className="py-3 pr-4">
                <span className={`rounded-md border px-2 py-1 text-xs font-medium ${severityStyles[trigger.impact]}`} title={severityPlainText(trigger.impact)}>{severityText(trigger.impact)}</span>
              </td>
              <td className="py-3 pr-4">
                <span className={`rounded-md border px-2 py-1 text-xs font-medium ${statusStyles[trigger.status]}`}>{statusText(trigger.status)}</span>
              </td>
              <td className="py-3 pr-4 text-gray-300 dark:text-gray-300 light:text-gray-700">{trigger.tracking}</td>
              <td className="py-3 text-gray-300 dark:text-gray-300 light:text-gray-700">{trigger.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SourceList({ sources }: { sources: DataSourceStatus[] }) {
  const liveCount = sources.filter((source) => source.status === 'live').length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">数据源状态</h2>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
            可用源参与当次计算；失败源只展示错误，不用模拟数据补分。
          </p>
        </div>
        <div className="font-mono text-sm text-gray-400">{liveCount}/{sources.length}</div>
      </div>
      <div className="max-h-[440px] overflow-y-auto pr-1 space-y-2">
        {sources.map((source) => (
          <div key={`${source.name}-${source.detail}`} className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-gray-100 dark:text-gray-100 light:text-gray-900">{source.name}</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-500 light:text-gray-600">{source.detail}</div>
              </div>
              <span className={`shrink-0 rounded-md border px-2 py-1 text-xs font-medium ${sourceBadge(source)}`}>
                {sourceLabel(source)}
              </span>
            </div>
            {source.updatedAt && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-500 light:text-gray-600">
                更新: {compactDate(source.updatedAt)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ResearchDashboard({ initialTab = 'ai' }: ResearchDashboardProps) {
  const pageType = initialTab
  const [range, setRange] = useState<TimeRange>('1Y')
  const [activeModuleTitle, setActiveModuleTitle] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<ResearchMetric | null>(null)
  const [showRawDetails, setShowRawDetails] = useState(false)
  const [judgment, setJudgment] = useState(() => localStorage.getItem(`research-dashboard-judgment-${pageType}`) ?? '')
  const { data, isLoading, refetch } = useQuery<PageData>({
    queryKey: [pageType === 'ai' ? 'ai-bubble' : 'crypto-cycle'],
    queryFn: () => (pageType === 'ai' ? getAiBubbleData() : getCryptoCycleData()),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })
  const aiFinancialQuery = useQuery({
    queryKey: ['ai-financials'],
    queryFn: getAiFinancialData,
    enabled: pageType === 'ai' && Boolean(data),
    staleTime: 1000 * 60 * 60,
    refetchInterval: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })

  const displayData = useMemo<PageData | null>(() => {
    if (!data) return null
    if (pageType !== 'ai') return data

    const aiData = data as AiBubbleData
    const financialData = aiFinancialQuery.data
    if (!financialData) return aiData

    return {
      ...aiData,
      financials: financialData.financials,
      sources: [...aiData.sources.filter((source) => source.name !== financialData.source.name), financialData.source],
    }
  }, [aiFinancialQuery.data, data, pageType])

  useEffect(() => {
    setActiveModuleTitle(null)
    setSelectedMetric(null)
    setShowRawDetails(false)
  }, [pageType])

  const derived = useMemo(() => {
    if (!displayData) return null
    if (pageType === 'ai') {
      const aiData = displayData as AiBubbleData
      return {
        modules: buildAiModules(aiData),
        triggers: buildAiTriggers(aiData),
        alerts: buildAiPageAlerts(aiData),
      }
    }

    const cryptoData = displayData as CryptoCycleData
    return {
      modules: buildCryptoModules(cryptoData),
      triggers: buildCryptoTriggers(cryptoData),
      alerts: buildCryptoPageAlerts(cryptoData),
    }
  }, [displayData, pageType])

  if (isLoading || !displayData || !derived) {
    return (
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="card p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <div className="text-gray-400 mt-4">正在加载{pageType === 'ai' ? 'AI 泡沫' : '加密周期'}数据...</div>
        </div>
      </div>
    )
  }

  const activeScore = scoreValue(pageType, displayData)
  const activeTurn = displayData.nextTurn
  const activeSources = pageSources(pageType, displayData)
  const activeIndicators = pageIndicators(pageType, displayData)
  const activeModule = derived.modules.find((module) => module.title === activeModuleTitle) ?? derived.modules[0]
  const activeMetrics = activeModule?.metrics.filter((metric) => metric.status !== 'pending') ?? []
  const pendingMetrics: PendingItem[] = activeModule?.metrics
    .filter((metric) => metric.status === 'pending')
    .map((metric) => ({ id: metric.id, name: metric.name, source: metric.source, threshold: metric.threshold })) ?? []
  const activeTriggers = derived.triggers.filter((trigger) => trigger.status !== 'pending')
  const pendingTriggers: PendingItem[] = derived.triggers
    .filter((trigger) => trigger.status === 'pending')
    .map((trigger) => ({ id: trigger.id, name: trigger.title, source: trigger.tracking, threshold: trigger.action }))
  const rawChartData = pageType === 'ai'
    ? (displayData as AiBubbleData).basketHistory.map((point) => ({ date: point.date, primary: point.aiBasket, secondary: point.qqq, tertiary: point.sp500 }))
    : (() => {
      const history = (displayData as CryptoCycleData).history
      const firstPrice = history.find((point) => point.price > 0)?.price ?? null
      return history.map((point) => ({
        date: point.date,
        primary: point.heat,
        secondary: firstPrice ? point.price / firstPrice * 100 : null,
        tertiary: point.drawdown + 100,
      }))
    })()
  const rangedChartData = filterByRange(rawChartData, range)
  const chartData = downsample(rangedChartData)
  const sourceLiveCount = liveSourceCount(activeSources)
  const activeStrategy = strategyRecommendation(pageType, displayData, activeScore)
  const overallBand = overallScoreBand(pageType, activeScore, activeStrategy)
  const simpleAction = simpleDecision(pageType, activeScore, activeStrategy)
  const cryptoTimingCards = pageType === 'crypto'
    ? cryptoCycleTimingCards(displayData as CryptoCycleData, activeStrategy)
    : []
  const cryptoCycleMap = pageType === 'crypto'
    ? cryptoCycleMapData(displayData as CryptoCycleData, activeStrategy)
    : null
  const aiBubbleData = pageType === 'ai'
    ? displayData as AiBubbleData
    : null
  const usesSimplifiedResearchView = pageType === 'crypto' || pageType === 'ai'
  const saveJudgment = (value: string) => {
    setJudgment(value)
    localStorage.setItem(`research-dashboard-judgment-${pageType}`, value)
  }
  const exportWeeklyReport = () => {
    const lines = [
      `${pageTitle(pageType)} - ${new Date().toLocaleString('zh-CN')}`,
      `总分: ${activeScore} / ${scoreLabel(pageType, activeScore)} / ${activeStrategy}`,
      `阶段: ${stageLabel(pageType, displayData)}`,
      `下一观察窗口: ${activeTurn.label} / ${activeTurn.daysText} / ${activeTurn.dateRange}`,
      '',
      ...(cryptoTimingCards.length > 0 ? [
        '周期时间表:',
        ...cryptoTimingCards.map((card) => `- ${card.title}: ${card.value} / ${card.detail}`),
        '',
      ] : []),
      '风险提示:',
      ...derived.alerts.map((alert) => `- [${severityText(alert.severity)}] ${alert.title}: ${alert.action}`),
      '',
      '我的判断:',
      judgment || '未填写',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `investment-research-${new Date().toISOString().slice(0, 10)}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }
  const saveSnapshot = () => {
    const snapshot = {
      savedAt: new Date().toISOString(),
      type: pageType,
      score: activeScore,
      stage: stageLabel(pageType, displayData),
      judgment,
    }
    localStorage.setItem(`research-snapshot-${snapshot.savedAt}`, JSON.stringify(snapshot))
  }

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-100 dark:text-gray-100 light:text-gray-900">{pageTitle(pageType)}</h1>
              <span className={`rounded-md border px-3 py-1 text-sm font-medium ${statusStyles[overallBand.status]}`}>
                {stageLabel(pageType, displayData)}
              </span>
            </div>
            <p className="mt-2 max-w-5xl text-gray-400 dark:text-gray-400 light:text-gray-600">
              {pageSubtitle(pageType)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => refetch()} className="btn btn-secondary">刷新</button>
            <button type="button" onClick={exportWeeklyReport} className="btn btn-secondary">导出周报</button>
            <button type="button" onClick={() => window.print()} className="btn btn-secondary">导出 PDF</button>
            <button type="button" onClick={saveSnapshot} className="btn btn-primary">保存快照</button>
          </div>
        </div>

        {pageType === 'crypto' && cryptoCycleMap ? (
          <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
            <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6">
              <div>
                <div className="text-sm text-gray-400">现在结论</div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className={`rounded-md border px-3 py-1 text-sm font-semibold ${statusStyles[overallBand.status]}`}>
                    {overallBand.text} · {overallBand.label}
                  </span>
                  <span className="rounded-md border border-dark-600 dark:border-dark-600 light:border-gray-200 px-3 py-1 text-sm text-gray-400">
                    更新时间 {compactDate(displayData.asOf)}
                  </span>
                </div>
                <div className="mt-4 text-3xl font-bold text-gray-100 dark:text-gray-100 light:text-gray-900">
                  当前处于：{cryptoCycleMap.currentPhase}
                </div>
                <div className="mt-3 text-2xl font-semibold text-primary">{cryptoCycleMap.currentAction}</div>
                <div className="mt-4 max-w-3xl text-sm leading-6 text-gray-400 dark:text-gray-400 light:text-gray-600">
                  {cryptoCycleMap.currentDetail} 指标已经在后台参与计算，日常只需要看这个结论和下面的周期图。
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-sky-500/25 bg-sky-500/10 p-4">
                  <div className="text-sm text-sky-200">下一拐点</div>
                  <div className="mt-2 text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">{cryptoCycleMap.nextTurnDate}</div>
                  <div className="mt-1 text-sm text-gray-400">{cryptoCycleMap.nextTurnLabel}</div>
                </div>
                <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-4">
                  <div className="text-sm text-amber-200">抄底窗口</div>
                  <div className="mt-2 text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">{cryptoCycleMap.bottomWindow}</div>
                  <div className="mt-1 text-sm text-gray-400">只做分批，不重仓一把梭。</div>
                </div>
                <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-4">
                  <div className="text-sm text-emerald-200">熊转牛确认</div>
                  <div className="mt-2 text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">{cryptoCycleMap.confirmationCount}/4</div>
                  <div className="mt-1 text-sm text-gray-400">满 3/4 再考虑右侧加仓。</div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-3">
              <div className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 bg-dark-900/20 dark:bg-dark-900/20 light:bg-gray-50 p-4">
                <div className="text-sm text-gray-500">现在应该做</div>
                <div className="mt-2 text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">{simpleAction}</div>
                <div className="mt-1 text-sm text-gray-400">{cryptoCycleMap.currentAction}</div>
              </div>
              <div className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 bg-dark-900/20 dark:bg-dark-900/20 light:bg-gray-50 p-4">
                <div className="text-sm text-gray-500">需要警惕</div>
                <div className="mt-2 text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">
                  {derived.alerts[0]?.title ?? '暂无高优先级风险'}
                </div>
                <div className="mt-1 text-sm text-gray-400">{derived.alerts[0]?.action ?? '继续按当前计划观察。'}</div>
              </div>
            </div>
          </div>
        ) : pageType === 'ai' && aiBubbleData ? (
          <AiBubbleStagePanel data={aiBubbleData} action={simpleAction} />
        ) : (
          <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  现在结论
                  <InfoHint text="这是把所有可用指标压缩成的日常决策结论。先看颜色，再看分数，最后看指标明细。" />
                </div>
                <div className="mt-3 flex flex-wrap items-end gap-4">
                  <div className="font-mono text-6xl font-bold text-gray-100 dark:text-gray-100 light:text-gray-900">{activeScore}</div>
                  <div className="pb-2">
                    <div className={`inline-flex rounded-md border px-3 py-1 text-sm font-semibold ${statusStyles[overallBand.status]}`}>
                      {overallBand.text} · {overallBand.label}
                    </div>
                    <div className="mt-2 text-2xl font-bold text-primary">{simpleAction}</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                  细分阶段: {stageLabel(pageType, displayData)} · 下一个观察窗口: {activeTurn.daysText}
                </div>
                <div className="mt-4">
                  <SimpleLegend />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    下一步
                    <InfoHint text="这是按当前分数和周期位置估算的下一次重要变化窗口，不是精确预测日期。" />
                  </div>
                  <div className="mt-2 text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">{shortTurnLabel(activeTurn.label)}</div>
                  <div className="mt-1 text-sm text-gray-500">{activeTurn.daysText}</div>
                </div>
                <div className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    数据源
                    <InfoHint text="可用表示这次评分真实用到了这个数据源；失败表示不会用假数据补分。" />
                  </div>
                  <div className="mt-2 text-2xl font-bold text-gray-100 dark:text-gray-100 light:text-gray-900">{sourceLiveCount}/{activeSources.length}</div>
                  <div className="mt-1 text-sm text-gray-500">可用源参与评分</div>
                </div>
                <div className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    更新时间
                    <InfoHint text="页面会定时刷新，但如果数据源当天没更新，指标日期可能落后于当前时间。" />
                  </div>
                  <div className="mt-2 text-sm font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">{compactDate(displayData.asOf)}</div>
                  <div className="mt-2 text-sm text-gray-500">预警数: {derived.alerts.filter((alert) => alert.severity !== 'low').length}</div>
                </div>
              </div>
            </div>
            <div className="mt-5 h-3 rounded-full bg-dark-700 dark:bg-dark-700 light:bg-gray-200 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500" style={{ width: `${activeScore}%` }} />
            </div>
          </div>
        )}

        {pageType === 'ai' && aiBubbleData && <AiSignalBoard data={aiBubbleData} />}

        {pageType === 'ai' && aiBubbleData && <AiChainBoard data={aiBubbleData} />}

        {pageType === 'ai' && aiBubbleData && <AiCapitalHealthBoard data={aiBubbleData} isLoadingFinancials={aiFinancialQuery.isFetching} />}

        {pageType === 'crypto' && cryptoCycleMap && <CryptoSignalBoard map={cryptoCycleMap} />}

        {cryptoCycleMap && <CycleMapPanel map={cryptoCycleMap} />}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.7fr] gap-6">
          <div className="min-w-0 bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">
                  {pageType === 'ai' ? 'AI 股票篮子 vs 大盘' : '周期热度 vs BTC 价格'}
                  <InfoHint text={pageType === 'ai' ? '黄色线是 AI 股票篮子，蓝色/绿色线是纳指和标普参考。用来看 AI 是否明显跑赢大盘。' : '黄色线是周期热度，蓝色线是 BTC 价格指数，绿色线是距离历史高点的回撤。用来看价格和周期热度是否同步。'} />
                </div>
                <div className="mt-1 text-sm text-gray-500">显示 {chartData.length} / {rangedChartData.length} / {rawChartData.length} 个数据点 · {range}</div>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {ranges.map((item) => (
                  <button key={item} type="button" onClick={() => setRange(item)} className={`px-3 py-1.5 rounded-md text-xs ${range === item ? 'bg-primary text-white' : 'bg-dark-700 text-gray-400'}`}>{item}</button>
                ))}
              </div>
            </div>
            <div className="mt-3 min-w-0">
              {chartData.length > 0 ? (
                <ChartFrame height={360}>
                  {(width, height) => (
                  <LineChart width={width} height={height} data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#273244" />
                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} minTickGap={44} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb' }} />
                    <Line type="monotone" dataKey="primary" name={pageType === 'ai' ? 'AI 股票篮子' : '周期热度'} stroke="#f59e0b" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="secondary" name={pageType === 'ai' ? '纳指参考' : 'BTC 价格指数'} stroke="#38bdf8" strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
                    {pageType === 'ai' && <Line type="monotone" dataKey="tertiary" name="标普参考" stroke="#34d399" strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />}
                    {pageType === 'crypto' && <Line type="monotone" dataKey="tertiary" name="回撤位置" stroke="#34d399" strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />}
                  </LineChart>
                  )}
                </ChartFrame>
              ) : (
                <ChartEmpty message="当前核心历史序列为空，请检查数据源状态。" />
              )}
            </div>
          </div>

          <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">
              风险提示
              <InfoHint text="这里只显示需要你优先关注的风险。低影响表示暂时没有红色预警，高影响或极高影响表示要优先检查仓位。" />
            </div>
            <div className="mt-4 space-y-3">
              {derived.alerts.map((alert) => (
                <div key={alert.id} className={`rounded-lg border p-4 ${severityStyles[alert.severity]}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-xs">{severityText(alert.severity)}</div>
                  </div>
                  <div className="mt-2 text-sm opacity-90">当前 {alert.currentValue} / 阈值 {alert.threshold}</div>
                  <div className="mt-2 text-sm opacity-90">{alert.explanation}</div>
                  <div className="mt-2 text-sm font-medium">{alert.action}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                颜色动作
                <InfoHint text="这是总分颜色对应的默认动作。最终还是要结合你的持仓成本和仓位大小。" />
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-300 dark:text-gray-300 light:text-gray-700">
                <div>绿色: 可以参与，按计划执行</div>
                <div>黄色/蓝色: 谨慎，少追高，多观察</div>
                <div>红色: 防御，减仓或对冲优先</div>
              </div>
              <div className="mt-3 text-xs text-gray-500">{activeTurn.rationale}</div>
            </div>
          </div>
        </div>

        {usesSimplifiedResearchView && (
          <div className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 bg-dark-800 dark:bg-dark-800 light:bg-white p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">计算依据已收起</div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-500 light:text-gray-600">
                  {pageType === 'ai'
                    ? '日常只看上面的泡沫阶段、关键灯号和产业链热度；原始指标只在需要排查时展开。'
                    : '日常只看上面的结论、周期地图和风险提示；原始指标只在需要排查时展开。'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRawDetails((visible) => !visible)}
                className="btn btn-secondary shrink-0"
              >
                {showRawDetails ? '隐藏计算依据' : '查看计算依据'}
              </button>
            </div>
          </div>
        )}

        {(!usesSimplifiedResearchView || showRawDetails) && (
          <>
        <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-6">
          <div className="space-y-6">
            <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">
                    指标模块
                    <InfoHint text="先看上面的总分和颜色，再点这里切换到某一类指标。每张指标卡都有 0-100 分和问号解释。" />
                  </div>
                  <p className="mt-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">只渲染当前模块，减少 tab 切换时的重绘。</p>
                </div>
                <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                  {derived.modules.map((module) => (
                    <button
                      key={module.title}
                      type="button"
                      onClick={() => setActiveModuleTitle(module.title)}
                      className={`shrink-0 rounded-md px-3 py-2 text-xs font-medium ${activeModule?.title === module.title ? 'bg-primary text-white' : 'bg-dark-700 text-gray-400'}`}
                    >
                      {module.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {activeModule && (
              <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">{activeModule.title}</h2>
                  <p className="mt-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">{activeModule.summary}</p>
                </div>
                {activeMetrics.length > 0 ? (
                  <MetricGrid metrics={activeMetrics} onSelect={setSelectedMetric} />
                ) : (
                  <div className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6 text-sm text-gray-500">当前模块暂无 live 指标。</div>
                )}
                <PendingList items={pendingMetrics} />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">指标详情 / 备注</h2>
              {selectedMetric ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">{selectedMetric.name}</div>
                  <div className="text-gray-400">当前值: {selectedMetric.currentValue}</div>
                  <div className="text-gray-400">阈值: {selectedMetric.threshold}</div>
                  <div className="text-gray-400">来源: {selectedMetric.source}</div>
                  <div className="text-gray-300 dark:text-gray-300 light:text-gray-700">{selectedMetric.interpretation}</div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-gray-500">点击任一指标查看解释。</div>
              )}
              <textarea
                value={judgment}
                onChange={(event) => saveJudgment(event.target.value)}
                className="mt-4 input w-full min-h-32 resize-y"
                placeholder="我自己的判断、仓位计划、需要下周补的数据..."
              />
            </div>

            <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
              <SourceList sources={activeSources} />
            </div>

            <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">触发器列表</h2>
              <div className="mt-4">
                {activeTriggers.length > 0 ? (
                  <TriggerTable triggers={activeTriggers} />
                ) : (
                  <div className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-4 text-sm text-gray-500">暂无可由 live 数据直接判定的触发器。</div>
                )}
                <PendingList items={pendingTriggers} />
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
          <div className="flex items-center gap-2 text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">
            分数构成
            <InfoHint text="这里展示每个核心指标对总分的贡献。柱子越高，说明这个指标对当前风险或热度的贡献越大。" />
          </div>
          <div className="mt-4 min-w-0">
            {activeIndicators.length > 0 ? (
              <ChartFrame height={340}>
                {(width, height) => (
                <BarChart width={width} height={height} data={activeIndicators}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#273244" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} interval={0} angle={-22} textAnchor="end" height={90} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`${Math.round(Number(value))}/100`, '贡献分']}
                    labelFormatter={(label) => `指标: ${label}`}
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb' }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                    {activeIndicators.map((indicator, index) => (
                      <Cell key={indicator.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
                )}
              </ChartFrame>
            ) : (
              <ChartEmpty message="当前评分指标为空，请检查核心价格和宏观数据源。" />
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}
