export type SourceStatus = 'live' | 'fallback' | 'failed'

export interface DataSourceStatus {
  name: string
  status: SourceStatus
  detail: string
  updatedAt?: string
}

export interface SignalIndicator {
  name: string
  value: string
  score: number
  weight: number
  summary: string
}

export interface CryptoAssetQuote {
  symbol: string
  name: string
  price: number
  change24h: number | null
  marketCap: number | null
  volume24h: number | null
}

export interface CryptoHistoryPoint {
  date: string
  price: number
  ma200d: number | null
  ma200w: number | null
  drawdown: number
  heat: number
}

export interface FearGreedPoint {
  date: string
  value: number
  label: string
}

export interface HalvingState {
  lastDate: string
  nextDate: string
  nextHeight: number
  currentHeight: number | null
  daysSinceLast: number
  daysToNext: number
  progress: number
}

export interface TurnEstimate {
  label: string
  dateRange: string
  daysText: string
  confidence: string
  rationale: string
}

export interface CryptoCycleData {
  asOf: string
  isFallback: boolean
  marketRegime: string
  regimeTone: 'bull' | 'bear' | 'neutral' | 'risk'
  heatScore: number
  nextTurn: TurnEstimate
  assets: CryptoAssetQuote[]
  indicators: SignalIndicator[]
  history: CryptoHistoryPoint[]
  fearGreedHistory: FearGreedPoint[]
  halving: HalvingState
  bitcoinDominance: number | null
  ethDominance: number | null
  globalMarket: CryptoGlobalMarket | null
  stablecoins: StablecoinSnapshot | null
  sources: DataSourceStatus[]
}

export interface MacroSignal {
  id: string
  name: string
  value: number | null
  date: string | null
  change1w: number | null
  change1m: number | null
  score: number
  unit: 'percent' | 'index'
}

export interface AiTickerMetric {
  symbol: string
  name: string
  price: number
  change1d: number | null
  return1m: number | null
  return3m: number | null
  return1y: number | null
  drawdown52w: number | null
  distance200d: number | null
  rsi14: number | null
  volatility60d: number | null
  marketCap: number | null
  trailingPe: number | null
  forwardPe: number | null
  priceToSales: number | null
  heatScore: number
}

export interface AiFinancialSnapshot {
  symbol: string
  name: string
  totalCash: number | null
  totalDebt: number | null
  netCash: number | null
  operatingCashflow: number | null
  freeCashflow: number | null
  capitalExpenditure: number | null
  revenueGrowth: number | null
  grossMargin: number | null
  ebitdaMargin: number | null
  debtToEquity: number | null
  currentRatio: number | null
  trailingPe: number | null
  forwardPe: number | null
  priceToSales: number | null
  dataQuality: 'live' | 'partial' | 'missing'
  updatedAt: string | null
}

export interface AiBasketPoint {
  date: string
  aiBasket: number
  qqq: number | null
  sp500: number | null
}

export interface AiBubbleData {
  asOf: string
  isFallback: boolean
  stage: string
  stageTone: 'normal' | 'warm' | 'hot' | 'bubble'
  bubbleScore: number
  nextTurn: TurnEstimate
  indicators: SignalIndicator[]
  basketHistory: AiBasketPoint[]
  tickers: AiTickerMetric[]
  financials: AiFinancialSnapshot[]
  macroSignals: MacroSignal[]
  sources: DataSourceStatus[]
}

export interface AiFinancialData {
  asOf: string
  financials: AiFinancialSnapshot[]
  source: DataSourceStatus
}

export interface StablecoinSnapshot {
  totalUsd: number | null
  change1d: number | null
  change7d: number | null
  change30d: number | null
  usdtUsd: number | null
  usdtChange30d: number | null
  usdcUsd: number | null
  usdcChange30d: number | null
  ethereumUsd: number | null
  solanaUsd: number | null
  updatedAt: string | null
}

export interface CryptoGlobalMarket {
  totalMarketCap: number | null
  totalVolume24h: number | null
  marketCapChange24h: number | null
  btcDominance: number | null
  ethDominance: number | null
}

interface CoingeckoSimplePrice {
  [id: string]: {
    usd?: number
    usd_market_cap?: number
    usd_24h_vol?: number
    usd_24h_change?: number
    last_updated_at?: number
  }
}

interface LlamaPriceResponse {
  coins?: Record<string, {
    price?: number
    symbol?: string
    timestamp?: number
    confidence?: number
  }>
}

type CoinloreGlobalResponse = Array<{
  total_mcap?: number
  total_volume?: number
  btc_d?: string
  eth_d?: string
  mcap_change?: string
}>

type CoinloreTickerResponse = Array<{
  symbol?: string
  name?: string
  price_usd?: string
  percent_change_24h?: string
  market_cap_usd?: string
  volume24?: number
}>

interface StablecoinsResponse {
  peggedAssets?: Array<{
    name?: string
    symbol?: string
    circulating?: Record<string, number>
    circulatingPrevDay?: Record<string, number>
    circulatingPrevWeek?: Record<string, number>
    circulatingPrevMonth?: Record<string, number>
  }>
  chains?: Array<{
    name?: string
    totalCirculatingUSD?: Record<string, number>
  }>
}

interface BlockchainChartResponse {
  status?: string
  name?: string
  values?: Array<{
    x: number
    y: number
  }>
}

interface BlockchainStatsResponse {
  timestamp?: number
  market_price_usd?: number
  trade_volume_usd?: number
  totalbc?: number
  n_blocks_total?: number
}

interface FearGreedResponse {
  data?: Array<{
    value: string
    value_classification: string
    timestamp: string
  }>
}

interface EquityQuote {
  symbol: string
  name: string
  regularMarketPrice: number | null
  regularMarketChangePercent: number | null
  marketCap: number | null
  trailingPE: number | null
  priceToSalesTrailing12Months: number | null
  fiftyTwoWeekHigh: number | null
  fiftyTwoWeekLow: number | null
  updatedAt: string | null
}

interface SinaKLinePoint {
  d: string
  c: string
}

interface DailyPoint {
  date: string
  value: number
}

interface BtcPoint {
  date: string
  price: number
  marketCap: number | null
  volume: number | null
}

interface CapturedResult<T> {
  data: T | null
  source: DataSourceStatus
}

interface FredSeriesDefinition {
  id: string
  name: string
  unit: MacroSignal['unit']
  risk: (value: number, change1w: number | null, change1m: number | null) => number
}

const BLOCKCHAIN_BASE = import.meta.env.DEV ? '/api/blockchain' : 'https://api.blockchain.info'
const ALTERNATIVE_BASE = import.meta.env.DEV ? '/api/alternative' : 'https://api.alternative.me'
const MEMPOOL_BASE = import.meta.env.DEV ? '/api/mempool' : 'https://mempool.space/api'
const SINA_HQ_BASE = import.meta.env.DEV ? '/api/sina-hq' : 'https://hq.sinajs.cn'
const SINA_STOCK_BASE = import.meta.env.DEV ? '/api/sina-stock' : 'https://stock.finance.sina.com.cn'
const FRED_BASE = import.meta.env.DEV ? '/api/fred' : 'https://fred.stlouisfed.org'
const DEFILLAMA_STABLE_BASE = import.meta.env.DEV ? '/api/defillama-stable' : 'https://stablecoins.llama.fi'
const LLAMA_PRICES_BASE = import.meta.env.DEV ? '/api/llama-prices' : 'https://coins.llama.fi'
const COINLORE_BASE = import.meta.env.DEV ? '/api/coinlore' : 'https://api.coinlore.net'
const SEC_DATA_BASE = import.meta.env.DEV ? '/api/sec-data' : 'https://data.sec.gov'

const MS_PER_DAY = 24 * 60 * 60 * 1000
const AVERAGE_BLOCK_MS = 10 * 60 * 1000
const NEXT_HALVING_HEIGHT = 1_050_000
const LAST_HALVING_DATE = '2024-04-20'
const AI_SYMBOLS = ['NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AVGO', 'AMD', 'TSM', 'ORCL', 'ARM', 'MU', 'DELL', 'VRT', 'ANET', 'PLTR', 'CRM', 'NOW', 'SNOW', 'SMH']
const AI_PRICE_SYMBOLS = ['NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AVGO', 'AMD', 'TSM', 'ORCL', 'MU', 'PLTR', 'SMH']
const AI_SEC_CIKS: Record<string, string> = {
  NVDA: '1045810',
  MSFT: '789019',
  GOOGL: '1652044',
  AMZN: '1018724',
  META: '1326801',
  AVGO: '1730168',
  AMD: '2488',
  TSM: '1046179',
  ORCL: '1341439',
  ARM: '1973239',
  MU: '723125',
  DELL: '1571996',
  VRT: '1674101',
  ANET: '1596532',
  PLTR: '1321655',
  CRM: '1108524',
  NOW: '1373715',
  SNOW: '1640147',
}
const AI_FINANCIAL_SYMBOLS = AI_SYMBOLS.filter((symbol) => AI_SEC_CIKS[symbol])
const BENCHMARK_SYMBOLS = ['QQQ', 'SPY']
const FRED_SERIES: FredSeriesDefinition[] = [
  { id: 'FEDFUNDS', name: 'Fed Funds Rate', unit: 'percent', risk: (value) => clamp((value - 2.5) * 22) },
  { id: 'DGS10', name: '10Y Treasury Yield', unit: 'percent', risk: (value, change1w) => clamp((value - 3.4) * 32 + Math.max(change1w ?? 0, 0) * 80) },
  { id: 'DGS2', name: '2Y Treasury Yield', unit: 'percent', risk: (value) => clamp((value - 3.7) * 34) },
  { id: 'DFII10', name: '10Y Real Yield', unit: 'percent', risk: (value) => clamp((value - 1.2) * 45) },
  { id: 'DTWEXBGS', name: 'Trade Weighted Dollar Index', unit: 'index', risk: (value, change1w) => clamp((value - 116) * 5 + Math.max(change1w ?? 0, 0) * 8) },
  { id: 'NFCI', name: 'Financial Conditions Index', unit: 'index', risk: (value) => clamp(45 + value * 90) },
  { id: 'BAMLH0A0HYM2', name: 'High Yield OAS', unit: 'percent', risk: (value, change1w) => clamp((value - 2.6) * 28 + Math.max(change1w ?? 0, 0) * 55) },
  { id: 'BAMLC0A0CM', name: 'Investment Grade OAS', unit: 'percent', risk: (value, change1w) => clamp((value - 0.8) * 65 + Math.max(change1w ?? 0, 0) * 90) },
]
const AI_NAMES: Record<string, string> = {
  NVDA: 'Nvidia',
  MSFT: 'Microsoft',
  GOOGL: 'Alphabet',
  AMZN: 'Amazon',
  META: 'Meta',
  AVGO: 'Broadcom',
  AMD: 'AMD',
  TSM: 'TSMC',
  ORCL: 'Oracle',
  ARM: 'Arm Holdings',
  MU: 'Micron',
  DELL: 'Dell',
  VRT: 'Vertiv',
  ANET: 'Arista Networks',
  PLTR: 'Palantir',
  CRM: 'Salesforce',
  NOW: 'ServiceNow',
  SNOW: 'Snowflake',
  SMH: 'VanEck Semiconductor ETF',
}

function recentFredCsvUrl(seriesId: string) {
  const startYear = new Date().getUTCFullYear() - 2
  return `${FRED_BASE}/graph/fredgraph.csv?id=${seriesId}&cosd=${startYear}-01-01`
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function fetchJson<T>(url: string, timeoutMs = 12_000): Promise<T> {
  const controller = new AbortController()
  let timedOut = false
  const timeout = window.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/json,text/plain,*/*',
      },
    })

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    const text = await response.text()
    const trimmed = text.trim()
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      throw new Error('non-JSON response')
    }

    return JSON.parse(trimmed) as T
  } catch (error) {
    if (timedOut) {
      throw new Error(`timeout after ${Math.round(timeoutMs / 1000)}s`)
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

async function fetchText(url: string, timeoutMs = 12_000): Promise<string> {
  const controller = new AbortController()
  let timedOut = false
  const timeout = window.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'text/plain,text/javascript,*/*',
      },
    })

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`)
    }

    return await response.text()
  } catch (error) {
    if (timedOut) {
      throw new Error(`timeout after ${Math.round(timeoutMs / 1000)}s`)
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

async function mapConcurrent<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let nextIndex = 0
  const workerCount = Math.min(Math.max(concurrency, 1), items.length)

  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex
      nextIndex += 1
      results[currentIndex] = await mapper(items[currentIndex], currentIndex)
    }
  }))

  return results
}

async function capture<T>(
  name: string,
  request: () => Promise<T>,
  detail: string,
  attempts = 1,
): Promise<CapturedResult<T>> {
  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const data = await request()
      return {
        data,
        source: {
          name,
          status: 'live',
          detail,
          updatedAt: new Date().toISOString(),
        },
      }
    } catch (error) {
      lastError = error
      if (attempt < attempts - 1) {
        await sleep(350 * (attempt + 1))
      }
    }
  }

  return {
    data: null,
    source: {
      name,
      status: 'failed',
      detail: lastError instanceof Error ? lastError.message : 'request failed',
    },
  }
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

function weightedAverage(indicators: SignalIndicator[]) {
  const usable = indicators.filter((item) => item.value !== 'N/A' && item.weight > 0)
  const weight = usable.reduce((sum, item) => sum + item.weight, 0)
  if (weight === 0) return 0
  return usable.reduce((sum, item) => sum + item.score * item.weight, 0) / weight
}

function mean(values: number[]) {
  const filtered = values.filter(Number.isFinite)
  if (filtered.length === 0) return 0
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length
}

function nullableMean(values: Array<number | null | undefined>) {
  const filtered = values.filter((value): value is number => value !== null && value !== undefined && Number.isFinite(value))
  if (filtered.length === 0) return null
  return mean(filtered)
}

function standardDeviation(values: number[]) {
  if (values.length < 2) return 0
  const avg = mean(values)
  const variance = mean(values.map((value) => (value - avg) ** 2))
  return Math.sqrt(variance)
}

function movingAverage(values: number[], windowSize: number) {
  const result: Array<number | null> = []
  let sum = 0

  values.forEach((value, index) => {
    sum += value
    if (index >= windowSize) {
      sum -= values[index - windowSize]
    }
    result.push(index >= windowSize - 1 ? sum / windowSize : null)
  })

  return result
}

function formatCompact(value: number | null, prefix = '') {
  if (value === null || !Number.isFinite(value)) return 'N/A'
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000_000) return `${prefix}${(value / 1_000_000_000_000).toFixed(2)}T`
  if (abs >= 1_000_000_000) return `${prefix}${(value / 1_000_000_000).toFixed(2)}B`
  if (abs >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${prefix}${(value / 1_000).toFixed(1)}K`
  return `${prefix}${value.toFixed(2)}`
}

function formatPercentValue(value: number | null, decimals = 1) {
  if (value === null || !Number.isFinite(value)) return 'N/A'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

function percentageChange(current: number | null, previous: number | null) {
  if (!current || !previous || previous <= 0) return null
  return (current / previous - 1) * 100
}

function toIsoDate(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10)
}

function daysBetween(start: string | Date, end: Date) {
  const startDate = typeof start === 'string' ? new Date(`${start}T00:00:00Z`) : start
  return Math.floor((end.getTime() - startDate.getTime()) / MS_PER_DAY)
}

function addDays(date: string | Date, days: number) {
  const target = typeof date === 'string' ? new Date(`${date}T00:00:00Z`) : new Date(date)
  target.setUTCDate(target.getUTCDate() + Math.round(days))
  return target.toISOString().slice(0, 10)
}

function parseFredCsv(text: string | null): DailyPoint[] {
  if (!text) return []

  return text
    .split('\n')
    .slice(1)
    .map((line) => {
      const [date, value] = line.trim().split(',')
      const parsed = Number(value)
      return {
        date,
        value: parsed,
      }
    })
    .filter((point) => point.date && Number.isFinite(point.value))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function fredSignal(definition: FredSeriesDefinition, text: string | null): MacroSignal {
  const series = parseFredCsv(text)
  const latest = series[series.length - 1]
  const change1w = latest ? latest.value - (series[Math.max(0, series.length - 6)]?.value ?? latest.value) : null
  const change1m = latest ? latest.value - (series[Math.max(0, series.length - 22)]?.value ?? latest.value) : null

  return {
    id: definition.id,
    name: definition.name,
    value: latest?.value ?? null,
    date: latest?.date ?? null,
    change1w,
    change1m,
    score: latest ? Math.round(definition.risk(latest.value, change1w, change1m)) : 0,
    unit: definition.unit,
  }
}

function parseBlockchainBtcPoints(
  priceChart: BlockchainChartResponse | null,
  volumeChart: BlockchainChartResponse | null,
  stats: BlockchainStatsResponse | null,
): BtcPoint[] {
  if (!priceChart?.values?.length) return []

  const volumeByDate = new Map(
    (volumeChart?.values ?? []).map((point) => [toIsoDate(point.x * 1000), point.y]),
  )
  const points: BtcPoint[] = priceChart.values
    .map((point) => {
      const date = toIsoDate(point.x * 1000)
      return {
        date,
        price: point.y,
        marketCap: null,
        volume: volumeByDate.get(date) ?? null,
      }
    })
    .filter((point) => Number.isFinite(point.price))

  const currentPrice = stats?.market_price_usd
  if (currentPrice && Number.isFinite(currentPrice)) {
    const currentDate = stats?.timestamp ? toIsoDate(stats.timestamp) : toIsoDate(Date.now())
    const supply = stats?.totalbc ? stats.totalbc / 100_000_000 : null
    const currentPoint: BtcPoint = {
      date: currentDate,
      price: currentPrice,
      marketCap: supply ? currentPrice * supply : null,
      volume: stats?.trade_volume_usd ?? null,
    }
    const existingIndex = points.findIndex((point) => point.date === currentDate)
    if (existingIndex >= 0) {
      points[existingIndex] = {
        ...points[existingIndex],
        ...currentPoint,
      }
    } else {
      points.push(currentPoint)
    }
  }

  return points.sort((a, b) => a.date.localeCompare(b.date))
}

function nearestReturn(series: DailyPoint[], days: number) {
  if (series.length <= days) return null
  const last = series[series.length - 1]?.value
  const previous = series[Math.max(0, series.length - 1 - days)]?.value
  if (!last || !previous) return null
  return (last / previous - 1) * 100
}

function drawdownFromWindowHigh(series: DailyPoint[], days: number) {
  if (series.length === 0) return null
  const window = series.slice(Math.max(0, series.length - days))
  const high = Math.max(...window.map((point) => point.value))
  const last = series[series.length - 1]?.value
  if (!last || !Number.isFinite(high) || high <= 0) return null
  return (last / high - 1) * 100
}

function distanceToAverage(last: number, average: number | null) {
  if (!average || average <= 0) return null
  return (last / average - 1) * 100
}

function calculateRsi(values: number[], period = 14) {
  if (values.length <= period) return null

  const changes = values.slice(1).map((value, index) => value - values[index])
  const recent = changes.slice(-period)
  const gains = recent.map((change) => Math.max(change, 0))
  const losses = recent.map((change) => Math.max(-change, 0))
  const avgGain = gains.reduce((sum, value) => sum + value, 0) / period
  const avgLoss = losses.reduce((sum, value) => sum + value, 0) / period

  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

function calculateAnnualizedVolatility(values: number[], days = 60) {
  if (values.length <= days + 1) return null
  const slice = values.slice(-(days + 1))
  const returns = slice.slice(1).map((value, index) => Math.log(value / slice[index])).filter(Number.isFinite)
  if (returns.length < 2) return null
  return standardDeviation(returns) * Math.sqrt(252) * 100
}

function classifyCryptoHeat(score: number): Pick<CryptoCycleData, 'marketRegime' | 'regimeTone'> {
  if (score >= 80) return { marketRegime: '牛市过热', regimeTone: 'risk' }
  if (score >= 65) return { marketRegime: '牛市后段', regimeTone: 'bull' }
  if (score >= 48) return { marketRegime: '牛市确认', regimeTone: 'bull' }
  if (score >= 34) return { marketRegime: '震荡筑底', regimeTone: 'neutral' }
  return { marketRegime: '熊市压力', regimeTone: 'bear' }
}

function cryptoTurnEstimate(score: number, daysSinceHalving: number, daysToNextHalving: number): TurnEstimate {
  const now = new Date()
  const peakStart = addDays(LAST_HALVING_DATE, 420)
  const peakEnd = addDays(LAST_HALVING_DATE, 570)
  const bottomStart = addDays(LAST_HALVING_DATE, 760)
  const bottomEnd = addDays(LAST_HALVING_DATE, 980)
  const bottomEndDate = new Date(`${bottomEnd}T00:00:00Z`)
  const peakEndDate = new Date(`${peakEnd}T00:00:00Z`)

  if (score === 0) {
    return {
      label: '数据不足',
      dateRange: '等待核心行情源恢复',
      daysText: '暂不可估算',
      confidence: '低',
      rationale: '核心 BTC 历史价格不足，不能给出有效周期拐点。',
    }
  }

  if (daysSinceHalving > 570 && daysSinceHalving <= 980 && score < 65) {
    const daysToWindowEnd = Math.max(0, daysBetween(now, bottomEndDate))
    return {
      label: '回撤/筑底观察窗口',
      dateRange: `${bottomStart} 至 ${bottomEnd}`,
      daysText: daysToWindowEnd > 0 ? `窗口内，距结束约 ${daysToWindowEnd} 天` : '窗口接近结束',
      confidence: '中',
      rationale: `当前处于减半后第 ${daysSinceHalving} 天，已晚于典型高点窗口 ${peakStart} 至 ${peakEnd}，应优先观察熊市低点或趋势修复。`,
    }
  }

  if (score >= 78) {
    return {
      label: '高温回调拐点',
      dateRange: `${addDays(now, 15)} 至 ${addDays(now, 90)}`,
      daysText: '约 2 周至 3 个月',
      confidence: '中',
      rationale: `热度接近历史高温区，上一轮减半后的高点窗口为 ${peakStart} 至 ${peakEnd}。`,
    }
  }

  if (score >= 55) {
    const windowIsFuture = peakEndDate.getTime() > now.getTime()
    return {
      label: '牛市高温窗口',
      dateRange: windowIsFuture ? `${peakStart} 至 ${peakEnd}` : `${addDays(now, 45)} 至 ${addDays(now, 180)}`,
      daysText: windowIsFuture ? `距窗口结束约 ${Math.max(0, daysBetween(now, new Date(`${peakEnd}T00:00:00Z`)))} 天` : '约 1.5 至 6 个月',
      confidence: '中低',
      rationale: '价格动量仍偏强，但高点窗口需要同时观察 200 日均线、恐惧贪婪指数和成交量。',
    }
  }

  if (score >= 34) {
    return {
      label: '方向确认拐点',
      dateRange: `${addDays(now, 30)} 至 ${addDays(now, 150)}`,
      daysText: '约 1 至 5 个月',
      confidence: '中',
      rationale: `当前处于减半后第 ${daysSinceHalving} 天，历史上熊牛转换常发生在趋势均线重新站稳后。`,
    }
  }

  return {
    label: '筑底/反弹拐点',
    dateRange: `${bottomStart} 至 ${bottomEnd}`,
    daysText: daysToNextHalving > 0 ? '约 0 至 6 个月内优先观察' : '等待下一轮减半重置',
    confidence: '中',
    rationale: '热度偏冷，历史周期中深度回撤后的底部通常伴随极端恐惧、成交萎缩和 200 周均线附近企稳。',
  }
}

function buildHalvingState(currentHeight: number | null): HalvingState {
  const now = new Date()
  const daysSinceLast = Math.max(0, daysBetween(LAST_HALVING_DATE, now))
  const fallbackCycleDays = 210_000 * AVERAGE_BLOCK_MS / MS_PER_DAY
  const daysToNext = currentHeight
    ? Math.max(0, Math.ceil((NEXT_HALVING_HEIGHT - currentHeight) * AVERAGE_BLOCK_MS / MS_PER_DAY))
    : Math.max(0, Math.ceil(fallbackCycleDays - daysSinceLast))

  return {
    lastDate: LAST_HALVING_DATE,
    nextDate: addDays(now, daysToNext),
    nextHeight: NEXT_HALVING_HEIGHT,
    currentHeight,
    daysSinceLast,
    daysToNext,
    progress: clamp(daysSinceLast / (daysSinceLast + daysToNext || fallbackCycleDays) * 100),
  }
}

function cryptoHistoryFromBtc(points: BtcPoint[]) {
  const prices = points.map((point) => point.price)
  const ma200d = movingAverage(prices, 200)
  const ma200w = movingAverage(prices, 1_400)
  let runningHigh = 0

  return points.map((point, index) => {
    runningHigh = Math.max(runningHigh, point.price)
    const drawdown = runningHigh > 0 ? (point.price / runningHigh - 1) * 100 : 0
    const d200 = distanceToAverage(point.price, ma200d[index])
    const d200w = distanceToAverage(point.price, ma200w[index])
    const heat = clamp(
      45
      + (d200 ?? 0) * 0.7
      + (d200w ?? 0) * 0.2
      + Math.max(drawdown, -80) * 0.35,
    )

    return {
      date: point.date,
      price: point.price,
      ma200d: ma200d[index],
      ma200w: ma200w[index],
      drawdown,
      heat,
    }
  })
}

function buildCryptoIndicators(
  history: CryptoHistoryPoint[],
  btcPoints: BtcPoint[],
  fearGreed: FearGreedPoint[],
  dominance: number | null,
  stablecoins: StablecoinSnapshot | null,
  globalMarket: CryptoGlobalMarket | null,
): SignalIndicator[] {
  const latest = history[history.length - 1]
  const lastBtc = btcPoints[btcPoints.length - 1]
  const prices = btcPoints.map((point) => ({ date: point.date, value: point.price }))
  const marketCaps = btcPoints.filter((point) => point.marketCap).map((point) => point.marketCap as number)
  const volumes = btcPoints.filter((point) => point.volume).map((point) => point.volume as number)
  const return90d = nearestReturn(prices, 90)
  const return180d = nearestReturn(prices, 180)
  const volume30d = mean(volumes.slice(-30))
  const volume180d = mean(volumes.slice(-180))
  const cap365d = marketCaps.length >= 180 ? mean(marketCaps.slice(-365)) : 0
  const capProxy = lastBtc?.marketCap && cap365d > 0 ? lastBtc.marketCap / cap365d : null
  const fearValue = fearGreed[0]?.value ?? null
  const distance200d = latest ? distanceToAverage(latest.price, latest.ma200d) : null
  const distance200w = latest ? distanceToAverage(latest.price, latest.ma200w) : null
  const drawdown = latest?.drawdown ?? null
  const volumeRatio = volume180d > 0 ? volume30d / volume180d : null
  const stablecoinChange30d = stablecoins?.change30d ?? null
  const marketCapChange = globalMarket?.marketCapChange24h ?? null

  return [
    {
      name: 'BTC 相对 200 日均线',
      value: formatPercentValue(distance200d),
      score: clamp(50 + (distance200d ?? 0) * 1.3),
      weight: 1.4,
      summary: distance200d !== null && distance200d >= 0 ? '价格站上中期趋势线' : '价格低于中期趋势线',
    },
    {
      name: 'BTC 相对 200 周均线',
      value: formatPercentValue(distance200w),
      score: clamp(38 + (distance200w ?? 0) * 0.35),
      weight: 1.1,
      summary: '用于观察长期周期底部和过热偏离',
    },
    {
      name: '距历史高点回撤',
      value: formatPercentValue(drawdown),
      score: clamp(92 + (drawdown ?? -40) * 1.25),
      weight: 1.1,
      summary: drawdown !== null && drawdown < -45 ? '深度回撤，熊市或筑底特征更强' : '回撤较浅，风险偏好仍在',
    },
    {
      name: '恐惧贪婪指数',
      value: fearValue === null ? 'N/A' : `${fearValue}`,
      score: fearValue ?? 45,
      weight: 0.9,
      summary: fearValue !== null && fearValue < 25 ? '市场情绪处于极端恐惧' : '情绪未到极端冷区',
    },
    {
      name: '90 日价格动量',
      value: formatPercentValue(return90d),
      score: clamp(50 + (return90d ?? 0) * 0.8),
      weight: 1,
      summary: return90d !== null && return90d > 0 ? '中期动量为正' : '中期动量偏弱',
    },
    {
      name: '180 日价格动量',
      value: formatPercentValue(return180d),
      score: clamp(50 + (return180d ?? 0) * 0.45),
      weight: 0.8,
      summary: '帮助区分反弹和完整牛市趋势',
    },
    {
      name: '成交量活跃度',
      value: volumeRatio === null ? 'N/A' : `${volumeRatio.toFixed(2)}x`,
      score: clamp(45 + ((volumeRatio ?? 1) - 1) * 55),
      weight: 0.7,
      summary: '30 日成交量相对 180 日均值',
    },
    {
      name: '市值均值代理',
      value: capProxy === null ? 'N/A' : `${capProxy.toFixed(2)}x`,
      score: clamp(35 + ((capProxy ?? 1) - 0.8) * 70),
      weight: 0.8,
      summary: '以 BTC 市值相对 365 日均值近似链上估值热度',
    },
    {
      name: '稳定币 30 日供应变化',
      value: formatPercentValue(stablecoinChange30d),
      score: stablecoinChange30d === null ? 45 : clamp(45 + stablecoinChange30d * 5),
      weight: 0.8,
      summary: stablecoinChange30d !== null && stablecoinChange30d < 0 ? '稳定币供应收缩，流动性偏弱' : '稳定币供应扩张或稳定，流动性支撑更强',
    },
    {
      name: '总市值 24H 变化',
      value: formatPercentValue(marketCapChange),
      score: marketCapChange === null ? 45 : clamp(50 + marketCapChange * 4),
      weight: 0.4,
      summary: 'CoinLore 全球市场短期风险偏好代理',
    },
    {
      name: 'BTC 市占率',
      value: dominance === null ? 'N/A' : `${dominance.toFixed(1)}%`,
      score: dominance === null ? 50 : clamp(70 - Math.abs(dominance - 54) * 2.2),
      weight: 0.4,
      summary: '市占率过高偏防御，过低偏山寨季过热',
    },
  ]
}

function parseFearGreed(response: FearGreedResponse | null): FearGreedPoint[] {
  if (!response?.data?.length) return []

  return response.data
    .map((item) => ({
      date: toIsoDate(Number(item.timestamp) * 1000),
      value: Number(item.value),
      label: item.value_classification,
    }))
    .filter((point) => Number.isFinite(point.value))
}

function parseCoinloreGlobal(response: CoinloreGlobalResponse | null): CryptoGlobalMarket | null {
  const global = response?.[0]
  if (!global) return null

  return {
    totalMarketCap: parseNumber(String(global.total_mcap ?? '')),
    totalVolume24h: parseNumber(String(global.total_volume ?? '')),
    marketCapChange24h: parseNumber(global.mcap_change),
    btcDominance: parseNumber(global.btc_d),
    ethDominance: parseNumber(global.eth_d),
  }
}

function parseCoinloreTickers(response: CoinloreTickerResponse | null): Map<string, CryptoAssetQuote> {
  const quotes = new Map<string, CryptoAssetQuote>()
  ;(response ?? []).forEach((item) => {
    const symbol = item.symbol?.toUpperCase()
    if (!symbol) return
    quotes.set(symbol, {
      symbol,
      name: item.name ?? symbol,
      price: parseNumber(item.price_usd) ?? 0,
      change24h: parseNumber(item.percent_change_24h),
      marketCap: parseNumber(item.market_cap_usd),
      volume24h: item.volume24 ?? null,
    })
  })
  return quotes
}

function parseLlamaPrices(response: LlamaPriceResponse | null): Map<string, number> {
  const prices = new Map<string, number>()
  const coins = response?.coins ?? {}
  Object.entries(coins).forEach(([id, quote]) => {
    if (quote.price && Number.isFinite(quote.price)) {
      prices.set(id, quote.price)
      if (quote.symbol) prices.set(quote.symbol.toUpperCase(), quote.price)
    }
  })
  return prices
}

function sumPeggedUsd(value: Record<string, number> | undefined) {
  if (!value) return null
  const total = Object.entries(value)
    .filter(([peg]) => peg === 'peggedUSD')
    .reduce((sum, [, amount]) => sum + amount, 0)
  return Number.isFinite(total) ? total : null
}

function parseStablecoins(response: StablecoinsResponse | null): StablecoinSnapshot | null {
  const assets = response?.peggedAssets ?? []
  if (!assets.length) return null

  const stableTotal = (field: 'circulating' | 'circulatingPrevDay' | 'circulatingPrevWeek' | 'circulatingPrevMonth') => (
    assets.reduce((sum, asset) => sum + (sumPeggedUsd(asset[field]) ?? 0), 0)
  )
  const bySymbol = (symbol: string) => assets.find((asset) => asset.symbol?.toUpperCase() === symbol)
  const chainUsd = (name: string) => {
    const chain = response?.chains?.find((item) => item.name?.toLowerCase() === name.toLowerCase())
    return sumPeggedUsd(chain?.totalCirculatingUSD)
  }

  const totalUsd = stableTotal('circulating')
  const prevDay = stableTotal('circulatingPrevDay')
  const prevWeek = stableTotal('circulatingPrevWeek')
  const prevMonth = stableTotal('circulatingPrevMonth')
  const usdt = bySymbol('USDT')
  const usdc = bySymbol('USDC')
  const usdtUsd = sumPeggedUsd(usdt?.circulating)
  const usdcUsd = sumPeggedUsd(usdc?.circulating)

  return {
    totalUsd,
    change1d: percentageChange(totalUsd, prevDay),
    change7d: percentageChange(totalUsd, prevWeek),
    change30d: percentageChange(totalUsd, prevMonth),
    usdtUsd,
    usdtChange30d: percentageChange(usdtUsd, sumPeggedUsd(usdt?.circulatingPrevMonth)),
    usdcUsd,
    usdcChange30d: percentageChange(usdcUsd, sumPeggedUsd(usdc?.circulatingPrevMonth)),
    ethereumUsd: chainUsd('Ethereum'),
    solanaUsd: chainUsd('Solana'),
    updatedAt: new Date().toISOString(),
  }
}

function buildCryptoAssets(
  simplePrice: CoingeckoSimplePrice | null,
  btcPoints: BtcPoint[],
  blockchainStats: BlockchainStatsResponse | null,
  coinloreTickers: Map<string, CryptoAssetQuote>,
  llamaPrices: Map<string, number>,
): CryptoAssetQuote[] {
  const fallbackBtc = btcPoints[btcPoints.length - 1]?.price ?? 0
  const previousBtc = btcPoints.length > 1 ? btcPoints[btcPoints.length - 2]?.price : null
  const fallbackBtcChange24h = previousBtc && previousBtc > 0 ? (fallbackBtc / previousBtc - 1) * 100 : null
  const btcSupply = blockchainStats?.totalbc ? blockchainStats.totalbc / 100_000_000 : null
  const definitions = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
    { id: 'solana', symbol: 'SOL', name: 'Solana' },
  ]

  return definitions.map((asset) => {
    const quote = simplePrice?.[asset.id]
    const coinlore = coinloreTickers.get(asset.symbol)
    const llamaPrice = llamaPrices.get(asset.symbol) ?? llamaPrices.get(`coingecko:${asset.id}`)
    if (asset.symbol === 'BTC' && blockchainStats?.market_price_usd) {
      return {
        symbol: asset.symbol,
        name: asset.name,
        price: blockchainStats.market_price_usd,
        change24h: quote?.usd_24h_change ?? fallbackBtcChange24h,
        marketCap: btcSupply ? blockchainStats.market_price_usd * btcSupply : quote?.usd_market_cap ?? null,
        volume24h: blockchainStats.trade_volume_usd ?? quote?.usd_24h_vol ?? null,
      }
    }

    return {
      symbol: asset.symbol,
      name: asset.name,
      price: quote?.usd ?? coinlore?.price ?? llamaPrice ?? (asset.symbol === 'BTC' ? fallbackBtc : 0),
      change24h: quote?.usd_24h_change ?? coinlore?.change24h ?? null,
      marketCap: quote?.usd_market_cap ?? coinlore?.marketCap ?? null,
      volume24h: quote?.usd_24h_vol ?? coinlore?.volume24h ?? null,
    }
  })
}

export async function getCryptoCycleData(): Promise<CryptoCycleData> {
  const [blockchainPrice, blockchainVolume, blockchainStats, coinloreGlobal, coinloreTickers, llamaPrices, stablecoinsResult, fearGreed, height] = await Promise.all([
    capture('Blockchain.com BTC market price', () => fetchJson<BlockchainChartResponse>(`${BLOCKCHAIN_BASE}/charts/market-price?timespan=5years&format=json`, 10_000), 'BTC 日度平均美元价格，5 年历史'),
    capture('Blockchain.com BTC trade volume', () => fetchJson<BlockchainChartResponse>(`${BLOCKCHAIN_BASE}/charts/trade-volume?timespan=5years&format=json`, 10_000), 'BTC 主要交易所美元成交量，5 年历史'),
    capture('Blockchain.com BTC stats', () => fetchJson<BlockchainStatsResponse>(`${BLOCKCHAIN_BASE}/stats`, 8_000), 'BTC 当前价格、成交量、区块和供给统计'),
    capture('CoinLore global market', () => fetchJson<CoinloreGlobalResponse>(`${COINLORE_BASE}/api/global/`, 8_000), '全球加密总市值、成交量和 BTC/ETH 市占率'),
    capture('CoinLore ETH/SOL quotes', () => fetchJson<CoinloreTickerResponse>(`${COINLORE_BASE}/api/ticker/?id=80,48543`, 8_000), 'ETH/SOL 即时报价、市值和成交量'),
    capture('DefiLlama coin prices', () => fetchJson<LlamaPriceResponse>(`${LLAMA_PRICES_BASE}/prices/current/coingecko:bitcoin,coingecko:ethereum,coingecko:solana`, 8_000), 'BTC/ETH/SOL 备用 spot 价格'),
    capture('DefiLlama stablecoins', () => fetchJson<StablecoinsResponse>(`${DEFILLAMA_STABLE_BASE}/stablecoins`, 10_000), '稳定币供应、USDT/USDC 和链上分布'),
    capture('Alternative.me Fear and Greed', () => fetchJson<FearGreedResponse>(`${ALTERNATIVE_BASE}/fng/?limit=90`, 8_000), '恐惧贪婪指数 90 日历史'),
    capture('mempool.space block height', () => fetchText(`${MEMPOOL_BASE}/blocks/tip/height`, 6_000), 'BTC 最新区块高度'),
  ])

  const liveBtcPoints = parseBlockchainBtcPoints(blockchainPrice.data, blockchainVolume.data, blockchainStats.data)
  const fearGreedPoints = parseFearGreed(fearGreed.data)
  const currentHeight = height.data ? Number(height.data) : blockchainStats.data?.n_blocks_total ?? null
  const halving = buildHalvingState(Number.isFinite(currentHeight) ? currentHeight : null)
  const history = cryptoHistoryFromBtc(liveBtcPoints).slice(-1_600)
  const parsedGlobal = parseCoinloreGlobal(coinloreGlobal.data)
  const stablecoins = parseStablecoins(stablecoinsResult.data)
  const dominance = parsedGlobal?.btcDominance ?? null
  const hasEnoughHistory = history.length >= 365
  const indicators = hasEnoughHistory ? buildCryptoIndicators(history, liveBtcPoints, fearGreedPoints, dominance, stablecoins, parsedGlobal) : []
  const heatScore = indicators.length ? Math.round(weightedAverage(indicators)) : 0
  const regime = hasEnoughHistory ? classifyCryptoHeat(heatScore) : { marketRegime: '数据不足', regimeTone: 'neutral' as const }
  const sources = [
    blockchainPrice.source,
    blockchainVolume.source,
    blockchainStats.source,
    coinloreGlobal.source,
    coinloreTickers.source,
    llamaPrices.source,
    stablecoinsResult.source,
    fearGreed.source,
    height.source,
  ]
  const usedFallbackHistory = liveBtcPoints.length < 365 || sources.some((source) => source.status !== 'live')
  const nextTurn = cryptoTurnEstimate(heatScore, halving.daysSinceLast, halving.daysToNext)

  return {
    asOf: new Date().toISOString(),
    isFallback: usedFallbackHistory,
    ...regime,
    heatScore,
    nextTurn,
    assets: buildCryptoAssets(
      null,
      liveBtcPoints,
      blockchainStats.data,
      parseCoinloreTickers(coinloreTickers.data),
      parseLlamaPrices(llamaPrices.data),
    ),
    indicators,
    history,
    fearGreedHistory: fearGreedPoints,
    halving,
    bitcoinDominance: dominance,
    ethDominance: parsedGlobal?.ethDominance ?? null,
    globalMarket: parsedGlobal,
    stablecoins,
    sources,
  }
}

function parseNumber(value: string | undefined) {
  if (!value || value === '--') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseSinaQuotes(text: string | null): Map<string, EquityQuote> {
  const quotes = new Map<string, EquityQuote>()
  if (!text) return quotes

  const regex = /var hq_str_gb_([a-z0-9]+)="([^"]*)";/g
  let match = regex.exec(text)
  while (match) {
    const symbol = match[1].toUpperCase()
    const fields = match[2].split(',')
    quotes.set(symbol, {
      symbol,
      name: AI_NAMES[symbol] ?? symbol,
      regularMarketPrice: parseNumber(fields[1]),
      regularMarketChangePercent: parseNumber(fields[2]),
      marketCap: parseNumber(fields[12]),
      trailingPE: parseNumber(fields[14]),
      priceToSalesTrailing12Months: null,
      fiftyTwoWeekHigh: parseNumber(fields[8]),
      fiftyTwoWeekLow: parseNumber(fields[9]),
      updatedAt: fields[3] || null,
    })
    match = regex.exec(text)
  }

  return quotes
}

function parseSinaDailySeries(text: string | null): DailyPoint[] {
  if (!text) return []

  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start < 0 || end <= start) return []

  try {
    const rows = JSON.parse(text.slice(start, end + 1)) as SinaKLinePoint[]
    return rows
      .map((row) => ({
        date: row.d,
        value: Number(row.c),
      }))
      .filter((point) => point.date && Number.isFinite(point.value) && point.value > 0)
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch {
    return []
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function nestedValue(root: unknown, path: string[]) {
  let current: unknown = root
  for (const key of path) {
    const record = asRecord(current)
    if (!record || !(key in record)) return null
    current = record[key]
  }
  return current
}

function rawNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  const record = asRecord(value)
  if (!record) return null
  return rawNumber(record.raw ?? record.fmt)
}

interface SecFactEntry {
  val: number
  start: string | null
  end: string | null
  filed: string | null
  form: string | null
  fp: string | null
  fy: number | null
}

function secCompanyFactsUrl(symbol: string) {
  const cik = AI_SEC_CIKS[symbol]
  return `${SEC_DATA_BASE}/api/xbrl/companyfacts/CIK${cik.padStart(10, '0')}.json`
}

function secFactEntries(data: unknown, concepts: string[], unit = 'USD'): SecFactEntry[] {
  const facts = asRecord(nestedValue(data, ['facts']))
  if (!facts) return []

  const taxonomies = ['us-gaap', 'ifrs-full']
  return taxonomies.flatMap((taxonomy) => {
    const taxonomyFacts = asRecord(facts[taxonomy])
    if (!taxonomyFacts) return []

    return concepts.flatMap((concept) => {
      const conceptRecord = asRecord(taxonomyFacts[concept])
      const units = asRecord(conceptRecord?.units)
      const unitRows = Array.isArray(units?.[unit]) ? units[unit] as unknown[] : []
      return unitRows.map((row) => {
        const record = asRecord(row)
        const val = rawNumber(record?.val)
        return val === null ? null : {
          val,
          start: typeof record?.start === 'string' ? record.start : null,
          end: typeof record?.end === 'string' ? record.end : null,
          filed: typeof record?.filed === 'string' ? record.filed : null,
          form: typeof record?.form === 'string' ? record.form : null,
          fp: typeof record?.fp === 'string' ? record.fp : null,
          fy: typeof record?.fy === 'number' ? record.fy : null,
        }
      }).filter((row): row is SecFactEntry => row !== null)
    })
  })
}

function secDateValue(value: string | null) {
  return value ? new Date(`${value}T00:00:00Z`).getTime() : 0
}

function secDurationDays(entry: SecFactEntry) {
  if (!entry.start || !entry.end) return null
  const duration = (secDateValue(entry.end) - secDateValue(entry.start)) / MS_PER_DAY
  return Number.isFinite(duration) && duration >= 0 ? duration : null
}

function pickLatestSecFact(entries: SecFactEntry[], options: { minDuration?: number; maxDuration?: number; instant?: boolean } = {}) {
  const acceptedForms = new Set(['10-K', '10-Q', '20-F', '40-F', '6-K'])
  const filtered = entries.filter((entry) => {
    if (!entry.end || !Number.isFinite(entry.val)) return false
    if (entry.form && !acceptedForms.has(entry.form)) return false
    const duration = secDurationDays(entry)
    if (options.instant) return duration === null || duration <= 2
    if (options.minDuration !== undefined && (duration === null || duration < options.minDuration)) return false
    if (options.maxDuration !== undefined && (duration === null || duration > options.maxDuration)) return false
    return true
  })

  return filtered.sort((a, b) => (
    secDateValue(a.end) - secDateValue(b.end)
    || secDateValue(a.filed) - secDateValue(b.filed)
  ))[filtered.length - 1] ?? null
}

function latestSecInstant(data: unknown, concepts: string[]) {
  return pickLatestSecFact(secFactEntries(data, concepts), { instant: true })
}

function latestSecFlow(data: unknown, concepts: string[], minDuration = 60, maxDuration = 420) {
  return pickLatestSecFact(secFactEntries(data, concepts), { minDuration, maxDuration })
}

function previousComparableFact(entries: SecFactEntry[], latest: SecFactEntry | null) {
  if (!latest?.end) return null
  const latestDuration = secDurationDays(latest)
  const targetEnd = secDateValue(latest.end) - 365 * MS_PER_DAY

  const candidates = entries.filter((entry) => {
    if (!entry.end || !Number.isFinite(entry.val)) return false
    const endDiff = Math.abs(secDateValue(entry.end) - targetEnd) / MS_PER_DAY
    const duration = secDurationDays(entry)
    const durationDiff = latestDuration !== null && duration !== null ? Math.abs(duration - latestDuration) : 0
    return endDiff <= 45 && durationDiff <= 45
  })

  return candidates.sort((a, b) => (
    Math.abs(secDateValue(b.end) - targetEnd) - Math.abs(secDateValue(a.end) - targetEnd)
    || secDateValue(a.filed) - secDateValue(b.filed)
  ))[candidates.length - 1] ?? null
}

function latestSecValue(data: unknown, concepts: string[]) {
  return latestSecInstant(data, concepts)?.val ?? null
}

function secDebtValue(data: unknown) {
  const currentDebt = latestSecValue(data, [
    'ShortTermBorrowings',
    'ShortTermDebt',
    'LongTermDebtCurrent',
    'LongTermDebtAndFinanceLeaseObligationsCurrent',
    'OperatingLeaseLiabilityCurrent',
  ])
  const noncurrentDebt = latestSecValue(data, [
    'LongTermDebtNoncurrent',
    'LongTermDebtAndFinanceLeaseObligationsNoncurrent',
    'LongTermFinanceLeaseLiability',
    'OperatingLeaseLiabilityNoncurrent',
  ])

  if (currentDebt !== null || noncurrentDebt !== null) {
    return (currentDebt ?? 0) + (noncurrentDebt ?? 0)
  }

  return latestSecValue(data, [
    'LongTermDebt',
    'LongTermDebtAndFinanceLeaseObligations',
    'Borrowings',
    'NoncurrentBorrowings',
  ])
}

function parseSecFinancialSnapshot(symbol: string, data: unknown): AiFinancialSnapshot {
  const cashFact = latestSecInstant(data, [
    'CashAndCashEquivalentsAtCarryingValue',
    'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents',
    'CashCashEquivalentsAndShortTermInvestments',
    'CashAndCashEquivalents',
  ])
  const revenueEntries = secFactEntries(data, [
    'RevenueFromContractWithCustomerExcludingAssessedTax',
    'Revenues',
    'SalesRevenueNet',
    'Revenue',
  ])
  const revenueFact = pickLatestSecFact(revenueEntries, { minDuration: 60, maxDuration: 420 })
  const priorRevenueFact = previousComparableFact(revenueEntries, revenueFact)
  const grossProfitFact = latestSecFlow(data, ['GrossProfit'])
  const costRevenueFact = latestSecFlow(data, ['CostOfRevenue', 'CostOfGoodsAndServicesSold'])
  const operatingCashflowFact = latestSecFlow(data, [
    'NetCashProvidedByUsedInOperatingActivities',
    'NetCashProvidedByUsedInOperatingActivitiesContinuingOperations',
    'NetCashFlowsFromUsedInOperatingActivities',
  ])
  const capexFact = latestSecFlow(data, [
    'PaymentsToAcquirePropertyPlantAndEquipment',
    'PaymentsToAcquireProductiveAssets',
    'PurchaseOfPropertyPlantAndEquipmentClassifiedAsInvestingActivities',
  ])
  const equity = latestSecValue(data, [
    'StockholdersEquity',
    'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest',
    'Equity',
  ])
  const currentAssets = latestSecValue(data, ['AssetsCurrent', 'CurrentAssets'])
  const currentLiabilities = latestSecValue(data, ['LiabilitiesCurrent', 'CurrentLiabilities'])
  const totalCash = cashFact?.val ?? null
  const totalDebt = secDebtValue(data)
  const operatingCashflow = operatingCashflowFact?.val ?? null
  const capitalExpenditure = capexFact?.val === undefined ? null : Math.abs(capexFact.val)
  const freeCashflow = operatingCashflow !== null && capitalExpenditure !== null
    ? operatingCashflow - capitalExpenditure
    : null
  const revenueGrowth = revenueFact && priorRevenueFact && priorRevenueFact.val > 0
    ? revenueFact.val / priorRevenueFact.val - 1
    : null
  const grossMargin = revenueFact && revenueFact.val > 0
    ? grossProfitFact
      ? grossProfitFact.val / revenueFact.val
      : costRevenueFact
        ? (revenueFact.val - Math.abs(costRevenueFact.val)) / revenueFact.val
        : null
    : null
  const debtToEquity = totalDebt !== null && equity !== null && equity > 0 ? totalDebt / equity * 100 : null
  const currentRatio = currentAssets !== null && currentLiabilities !== null && currentLiabilities > 0 ? currentAssets / currentLiabilities : null
  const filedDates = [
    cashFact,
    revenueFact,
    grossProfitFact,
    costRevenueFact,
    operatingCashflowFact,
    capexFact,
  ]
    .map((entry) => entry?.filed ?? null)
    .filter((value): value is string => value !== null)
    .sort()
  const latestFiled = filedDates[filedDates.length - 1] ?? null
  const usableFields = [
    totalCash,
    totalDebt,
    freeCashflow,
    operatingCashflow,
    capitalExpenditure,
    revenueGrowth,
    grossMargin,
    debtToEquity,
    currentRatio,
  ].filter((value) => value !== null).length

  return {
    symbol,
    name: AI_NAMES[symbol] ?? symbol,
    totalCash,
    totalDebt,
    netCash: totalCash !== null && totalDebt !== null ? totalCash - totalDebt : null,
    operatingCashflow,
    freeCashflow,
    capitalExpenditure,
    revenueGrowth,
    grossMargin,
    ebitdaMargin: null,
    debtToEquity,
    currentRatio,
    trailingPe: null,
    forwardPe: null,
    priceToSales: null,
    dataQuality: usableFields >= 5 ? 'live' : usableFields > 0 ? 'partial' : 'missing',
    updatedAt: latestFiled,
  }
}

function mergeLatestQuote(series: DailyPoint[], quote: EquityQuote | null) {
  if (!quote?.regularMarketPrice || !quote.updatedAt) return series

  const dateMatch = quote.updatedAt.match(/\d{4}-\d{2}-\d{2}/)
  if (!dateMatch) return series

  const date = dateMatch[0]
  const nextSeries = [...series]
  const existingIndex = nextSeries.findIndex((point) => point.date === date)
  if (existingIndex >= 0) {
    nextSeries[existingIndex] = {
      date,
      value: quote.regularMarketPrice,
    }
  } else {
    nextSeries.push({
      date,
      value: quote.regularMarketPrice,
    })
  }

  return nextSeries.sort((a, b) => a.date.localeCompare(b.date))
}

function normalizeSeries(series: DailyPoint[], baseDate: string | null = null) {
  const usable = baseDate ? series.filter((point) => point.date >= baseDate) : series
  const first = usable.find((point) => point.value > 0)
  if (!first) return []

  return usable.map((point) => ({
    date: point.date,
    value: point.value / first.value * 100,
  }))
}

function alignSeriesByDate(primary: DailyPoint[], qqq: DailyPoint[], sp500: DailyPoint[]): AiBasketPoint[] {
  const qqqMap = new Map(qqq.map((point) => [point.date, point.value]))
  const sp500Map = new Map(sp500.map((point) => [point.date, point.value]))

  return primary.map((point) => ({
    date: point.date,
    aiBasket: point.value,
    qqq: qqqMap.get(point.date) ?? null,
    sp500: sp500Map.get(point.date) ?? null,
  }))
}

function calculateTickerMetric(symbol: string, series: DailyPoint[], quote: EquityQuote | null): AiTickerMetric {
  const values = series.map((point) => point.value)
  const latest = values[values.length - 1] ?? quote?.regularMarketPrice ?? 0
  const ma200Series = movingAverage(values, 200)
  const ma200 = ma200Series[ma200Series.length - 1] ?? null
  const distance200d = distanceToAverage(latest, ma200)
  const return1m = nearestReturn(series, 21)
  const return3m = nearestReturn(series, 63)
  const return1y = nearestReturn(series, 252)
  const drawdown52w = drawdownFromWindowHigh(series, 252)
  const rsi14 = calculateRsi(values)
  const volatility60d = calculateAnnualizedVolatility(values)
  const hasEnoughHistory = values.length >= 253
  const heatScore = hasEnoughHistory
    ? Math.round(clamp(
      35
      + (return1y ?? 0) * 0.35
      + (return3m ?? 0) * 0.45
      + (distance200d ?? 0) * 0.65
      + ((rsi14 ?? 50) - 50) * 0.45
      + Math.max((drawdown52w ?? -20) + 20, 0) * 0.35,
    ))
    : 0

  return {
    symbol,
    name: quote?.name ?? AI_NAMES[symbol] ?? symbol,
    price: quote?.regularMarketPrice ?? latest,
    change1d: quote?.regularMarketChangePercent ?? nearestReturn(series, 1),
    return1m,
    return3m,
    return1y,
    drawdown52w,
    distance200d,
    rsi14,
    volatility60d,
    marketCap: quote?.marketCap ?? null,
    trailingPe: quote?.trailingPE ?? null,
    forwardPe: null,
    priceToSales: quote?.priceToSalesTrailing12Months ?? null,
    heatScore,
  }
}

function findBaseDate(seriesMap: Map<string, DailyPoint[]>) {
  const allSeries = [...AI_PRICE_SYMBOLS, ...BENCHMARK_SYMBOLS]
    .map((symbol) => seriesMap.get(symbol) ?? [])
    .filter((series) => series.length > 0)

  if (allSeries.length === 0) return null

  const starts = allSeries.map((series) => series[0].date).sort()
  return starts[starts.length - 1]
}

function buildAiBasket(seriesMap: Map<string, DailyPoint[]>): AiBasketPoint[] {
  const baseDate = findBaseDate(seriesMap)
  const normalizedAi = AI_PRICE_SYMBOLS
    .map((symbol) => normalizeSeries(seriesMap.get(symbol) ?? [], baseDate))
    .filter((series) => series.length > 0)

  if (!normalizedAi.length) return []

  const aiMaps = normalizedAi.map((series) => new Map(series.map((point) => [point.date, point.value])))
  const dates = normalizedAi
    .map((series) => new Set(series.map((point) => point.date)))
    .reduce<string[]>((common, dateSet, index) => {
      if (index === 0) return [...dateSet]
      return common.filter((date) => dateSet.has(date))
    }, [])
    .sort()

  const basket = dates.map((date) => {
    const values = aiMaps.map((series) => series.get(date)).filter((value): value is number => Number.isFinite(value))
    return {
      date,
      value: mean(values),
    }
  })

  const qqq = normalizeSeries(seriesMap.get('QQQ') ?? [], baseDate)
  const sp500 = normalizeSeries(seriesMap.get('SPY') ?? [], baseDate)

  return alignSeriesByDate(basket, qqq, sp500)
}

function buildAiIndicators(tickers: AiTickerMetric[], basketHistory: AiBasketPoint[]): SignalIndicator[] {
  const aiSeries = basketHistory.map((point) => ({ date: point.date, value: point.aiBasket }))
  const qqqSeries = basketHistory.filter((point) => point.qqq !== null).map((point) => ({ date: point.date, value: point.qqq as number }))
  const spSeries = basketHistory.filter((point) => point.sp500 !== null).map((point) => ({ date: point.date, value: point.sp500 as number }))
  const ai1y = nearestReturn(aiSeries, 252)
  const qqq1y = nearestReturn(qqqSeries, 252)
  const sp1y = nearestReturn(spSeries, 252)
  const excessVsSp = ai1y !== null && sp1y !== null ? ai1y - sp1y : null
  const excessVsQqq = ai1y !== null && qqq1y !== null ? ai1y - qqq1y : null
  const avgDistance200d = nullableMean(tickers.map((ticker) => ticker.distance200d))
  const avgRsi = nullableMean(tickers.map((ticker) => ticker.rsi14))
  const avgPe = nullableMean(tickers.map((ticker) => ticker.forwardPe ?? ticker.trailingPe))
  const scoredTickers = tickers.filter((ticker) => ticker.heatScore > 0)
  const hotTickerShare = scoredTickers.filter((ticker) => ticker.heatScore >= 70).length / Math.max(1, scoredTickers.length) * 100
  const avgDrawdownAbs = Math.abs(nullableMean(tickers.map((ticker) => ticker.drawdown52w)) ?? 0)
  const marketCaps = tickers.map((ticker) => ticker.marketCap).filter((value): value is number => value !== null && Number.isFinite(value) && value > 0)
  const totalMarketCap = marketCaps.reduce((sum, value) => sum + value, 0)
  const top3MarketCapShare = totalMarketCap > 0
    ? marketCaps.sort((a, b) => b - a).slice(0, 3).reduce((sum, value) => sum + value, 0) / totalMarketCap * 100
    : null

  return [
    {
      name: 'AI 篮子 1 年涨幅',
      value: formatPercentValue(ai1y),
      score: ai1y === null ? 0 : clamp(35 + ai1y * 0.55),
      weight: 1.3,
      summary: '泡沫常伴随板块整体快速上涨',
    },
    {
      name: '相对 SPY 超额收益',
      value: formatPercentValue(excessVsSp),
      score: excessVsSp === null ? 0 : clamp(45 + excessVsSp * 0.75),
      weight: 1,
      summary: '观察 AI 交易是否明显脱离标普 500 ETF 代理',
    },
    {
      name: '相对 QQQ 超额收益',
      value: formatPercentValue(excessVsQqq),
      score: excessVsQqq === null ? 0 : clamp(45 + excessVsQqq * 0.9),
      weight: 0.8,
      summary: '剔除科技股整体 beta 后的板块热度',
    },
    {
      name: '平均偏离 200 日线',
      value: formatPercentValue(avgDistance200d),
      score: avgDistance200d === null ? 0 : clamp(45 + avgDistance200d * 1.5),
      weight: 1.1,
      summary: avgDistance200d !== null && avgDistance200d > 20 ? '多数 AI 标的显著高于趋势线' : '趋势偏离未到极端',
    },
    {
      name: '平均 RSI',
      value: avgRsi === null ? 'N/A' : avgRsi.toFixed(1),
      score: avgRsi === null ? 0 : clamp(30 + (avgRsi - 45) * 1.6),
      weight: 0.8,
      summary: '衡量短期追涨强度和拥挤度',
    },
    {
      name: '高热股票占比',
      value: `${hotTickerShare.toFixed(0)}%`,
      score: clamp(20 + hotTickerShare),
      weight: 0.8,
      summary: '热度从个别龙头扩散到全板块时风险上升',
    },
    {
      name: '平均远期/动态 PE',
      value: avgPe === null ? 'N/A' : `${avgPe.toFixed(1)}x`,
      score: avgPe === null ? 0 : clamp(25 + (avgPe - 20) * 1.4),
      weight: 0.7,
      summary: '估值越依赖远期增长，泡沫敏感度越高',
    },
    {
      name: '前三大市值占比',
      value: top3MarketCapShare === null ? 'N/A' : `${top3MarketCapShare.toFixed(0)}%`,
      score: top3MarketCapShare === null ? 0 : clamp(25 + (top3MarketCapShare - 40) * 1.5),
      weight: 0.6,
      summary: '泡沫交易常由少数龙头先集中抬升，再向二线扩散',
    },
    {
      name: '52 周回撤缓冲',
      value: avgDrawdownAbs ? `-${avgDrawdownAbs.toFixed(1)}%` : 'N/A',
      score: avgDrawdownAbs ? clamp(82 - avgDrawdownAbs * 2.1) : 0,
      weight: 0.7,
      summary: '回撤越浅，市场越可能仍处在拥挤交易中',
    },
  ]
}

function buildMacroSignalIndicators(macroSignals: MacroSignal[]): SignalIndicator[] {
  const weights: Record<string, number> = {
    DGS10: 0.35,
    DFII10: 0.35,
    NFCI: 0.3,
    BAMLH0A0HYM2: 0.35,
    BAMLC0A0CM: 0.25,
    DTWEXBGS: 0.2,
  }

  return macroSignals
    .filter((signal) => signal.value !== null && weights[signal.id])
    .map((signal) => ({
      name: signal.name,
      value: signal.unit === 'percent' ? `${signal.value?.toFixed(2)}%` : `${signal.value?.toFixed(2)}`,
      score: signal.score,
      weight: weights[signal.id],
      summary: 'FRED 宏观/信用风险因子，作为 AI 泡沫脆弱性加权项。',
    }))
}

function classifyAiBubble(score: number): Pick<AiBubbleData, 'stage' | 'stageTone'> {
  if (score >= 82) return { stage: '狂热泡沫', stageTone: 'bubble' }
  if (score >= 68) return { stage: '泡沫预警', stageTone: 'hot' }
  if (score >= 50) return { stage: '升温扩张', stageTone: 'warm' }
  if (score >= 32) return { stage: '正常偏热', stageTone: 'normal' }
  return { stage: '冷却修复', stageTone: 'normal' }
}

function aiTurnEstimate(score: number): TurnEstimate {
  const now = new Date()

  if (score >= 82) {
    return {
      label: '高波动/估值压缩拐点',
      dateRange: `${addDays(now, 10)} 至 ${addDays(now, 90)}`,
      daysText: '约 10 天至 3 个月',
      confidence: '中',
      rationale: '泡沫分数进入狂热区，短期业绩、利率或龙头指引变化都可能触发再定价。',
    }
  }

  if (score >= 68) {
    return {
      label: '泡沫验证窗口',
      dateRange: `${addDays(now, 30)} 至 ${addDays(now, 180)}`,
      daysText: '约 1 至 6 个月',
      confidence: '中',
      rationale: '板块趋势仍强，但扩散度和估值已进入需要用盈利兑现验证的阶段。',
    }
  }

  if (score >= 50) {
    return {
      label: '加速或降温分界',
      dateRange: `${addDays(now, 60)} 至 ${addDays(now, 270)}`,
      daysText: '约 2 至 9 个月',
      confidence: '中低',
      rationale: '热度处于扩张阶段，下一拐点取决于龙头财报和资金是否继续外溢到二线 AI 标的。',
    }
  }

  return {
    label: '重新升温观察点',
    dateRange: `${addDays(now, 90)} 至 ${addDays(now, 360)}`,
    daysText: '约 3 至 12 个月',
    confidence: '中低',
    rationale: '板块未处在泡沫高温区，需要等待价格重新站上长期均线且超额收益扩大。',
  }
}

export async function getAiBubbleData(): Promise<AiBubbleData> {
  const trackedSymbols = [...AI_PRICE_SYMBOLS, ...BENCHMARK_SYMBOLS]
  const quoteSymbols = [...AI_SYMBOLS, ...BENCHMARK_SYMBOLS]
  const sinaQuoteSymbols = quoteSymbols.map((symbol) => `gb_${symbol.toLowerCase()}`).join(',')
  const [quoteResult, chartResults, fredResults] = await Promise.all([
    capture(
      'Sina US stock quotes',
      () => fetchText(`${SINA_HQ_BASE}/list=${sinaQuoteSymbols}`, 8_000),
      'AI 股票、QQQ、SPY 当前行情快照',
    ),
    mapConcurrent(
      trackedSymbols,
      12,
      (symbol) => capture(
        `Sina daily K ${symbol}`,
        () => fetchText(`${SINA_STOCK_BASE}/usstock/api/jsonp.php/var%20_${symbol}=/US_MinKService.getDailyK?symbol=${symbol}&___qn=3n`, 6_000),
        `${symbol} 日线历史价格`,
      ),
    ),
    mapConcurrent(
      FRED_SERIES,
      8,
      (series) => capture(
        `FRED ${series.id}`,
        () => fetchText(recentFredCsvUrl(series.id), 8_000),
        `${series.name} 历史序列`,
      ),
    ),
  ])
  const seriesMap = new Map<string, DailyPoint[]>()
  const quoteMap = parseSinaQuotes(quoteResult.data)
  const financials: AiFinancialSnapshot[] = []
  let liveChartCount = 0

  chartResults.forEach((result, index) => {
    const symbol = trackedSymbols[index]
    const series = mergeLatestQuote(parseSinaDailySeries(result.data), quoteMap.get(symbol) ?? null).slice(-560)
    if (series.length > 260) {
      liveChartCount += 1
      seriesMap.set(symbol, series)
    }
  })

  const tickers = AI_SYMBOLS.map((symbol) => calculateTickerMetric(
    symbol,
    seriesMap.get(symbol) ?? [],
    quoteMap.get(symbol) ?? null,
  )).sort((a, b) => b.heatScore - a.heatScore)
  const basketHistory = buildAiBasket(seriesMap)
  const macroSignals = FRED_SERIES.map((series, index) => fredSignal(series, fredResults[index].data))
  const indicators = [
    ...buildAiIndicators(tickers, basketHistory),
    ...buildMacroSignalIndicators(macroSignals),
  ]
  const hasEnoughPriceHistory = basketHistory.length >= 253 && tickers.filter((ticker) => ticker.heatScore > 0).length >= Math.ceil(AI_PRICE_SYMBOLS.length * 0.75)
  const usableIndicatorCount = indicators.filter((indicator) => indicator.value !== 'N/A' && indicator.weight > 0).length
  const bubbleScore = usableIndicatorCount > 0 ? Math.round(weightedAverage(indicators)) : 0
  const stage = usableIndicatorCount > 0 ? classifyAiBubble(bubbleScore) : { stage: '数据不足', stageTone: 'normal' as const }
  const sources = [quoteResult.source, ...chartResults.map((result) => result.source), ...fredResults.map((result) => result.source)]
  const isFallback = !hasEnoughPriceHistory || liveChartCount < trackedSymbols.length || sources.some((source) => source.status !== 'live')

  return {
    asOf: new Date().toISOString(),
    isFallback,
    ...stage,
    bubbleScore,
    nextTurn: aiTurnEstimate(bubbleScore),
    indicators,
    basketHistory,
    tickers,
    financials,
    macroSignals,
    sources,
  }
}

export async function getAiFinancialData(): Promise<AiFinancialData> {
  const financialResults = await mapConcurrent(
    AI_FINANCIAL_SYMBOLS,
    4,
    (symbol) => capture(
      `SEC companyfacts ${symbol}`,
      () => fetchJson<unknown>(secCompanyFactsUrl(symbol), 15_000),
      `${symbol} SEC XBRL 财报、现金、负债、现金流和资本开支事实`,
    ),
  )
  const financials = AI_FINANCIAL_SYMBOLS.map((symbol, index) => parseSecFinancialSnapshot(symbol, financialResults[index].data))
  const financialLiveCount = financials.filter((snapshot) => snapshot.dataQuality !== 'missing').length

  return {
    asOf: new Date().toISOString(),
    financials,
    source: {
      name: 'SEC companyfacts',
      status: financialLiveCount === AI_FINANCIAL_SYMBOLS.length ? 'live' : financialLiveCount > 0 ? 'fallback' : 'failed',
      detail: `${financialLiveCount}/${AI_FINANCIAL_SYMBOLS.length} 家 AI 上下游公司 SEC 财报/现金流事实可用`,
      updatedAt: financialLiveCount > 0 ? new Date().toISOString() : undefined,
    },
  }
}

export const marketSignalFormatters = {
  compact: formatCompact,
  percent: formatPercentValue,
}
