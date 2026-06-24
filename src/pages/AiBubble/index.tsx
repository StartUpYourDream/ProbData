import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getAiBubbleData, marketSignalFormatters } from '../../api/marketSignals'
import type { AiBubbleData, AiTickerMetric, DataSourceStatus, SignalIndicator } from '../../api/marketSignals'

type SortKey = 'heatScore' | 'return1y' | 'distance200d' | 'forwardPe' | 'marketCap'

const stageStyles: Record<AiBubbleData['stageTone'], string> = {
  normal: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  warm: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  hot: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  bubble: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
}

const barColors = ['#38bdf8', '#34d399', '#f59e0b', '#f43f5e']

function scoreColor(score: number) {
  if (score >= 82) return '#f43f5e'
  if (score >= 68) return '#f59e0b'
  if (score >= 50) return '#34d399'
  return '#38bdf8'
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function nullableNumber(value: number | null) {
  return value === null || !Number.isFinite(value) ? Number.NEGATIVE_INFINITY : value
}

function sourceLabel(source: DataSourceStatus) {
  if (source.status === 'live') return 'Live'
  if (source.status === 'fallback') return 'Fallback'
  return 'Failed'
}

function sourceClass(source: DataSourceStatus) {
  if (source.status === 'live') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  if (source.status === 'fallback') return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  return 'bg-rose-500/15 text-rose-300 border-rose-500/30'
}

function KpiCard({
  label,
  value,
  detail,
  accent = 'text-gray-100',
}: {
  label: string
  value: string
  detail: string
  accent?: string
}) {
  return (
    <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-5">
      <div className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">{label}</div>
      <div className={`mt-2 text-2xl font-bold tabular-nums ${accent}`}>{value}</div>
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-500 light:text-gray-500">{detail}</div>
    </div>
  )
}

function BubbleGauge({ score }: { score: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">AI 泡沫分数</div>
          <div className="text-5xl font-bold tabular-nums text-gray-100 dark:text-gray-100 light:text-gray-900">{score}</div>
        </div>
        <div className="text-right text-xs text-gray-500 dark:text-gray-500 light:text-gray-600">
          <div>0 冷却</div>
          <div>100 狂热</div>
        </div>
      </div>
      <div className="h-3 rounded-full bg-dark-700 dark:bg-dark-700 light:bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            background: 'linear-gradient(90deg, #38bdf8 0%, #34d399 45%, #f59e0b 70%, #f43f5e 100%)',
          }}
        />
      </div>
    </div>
  )
}

function IndicatorList({ indicators }: { indicators: SignalIndicator[] }) {
  return (
    <div className="space-y-3">
      {indicators.map((indicator) => (
        <div key={indicator.name} className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-gray-100 dark:text-gray-100 light:text-gray-900">{indicator.name}</div>
              <div className="mt-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">{indicator.summary}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">{indicator.value}</div>
              <div className="mt-1 font-mono text-lg font-semibold" style={{ color: scoreColor(indicator.score) }}>
                {indicator.score.toFixed(0)}
              </div>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-dark-700 dark:bg-dark-700 light:bg-gray-200 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${indicator.score}%`, backgroundColor: scoreColor(indicator.score) }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function SourceStatusList({ sources }: { sources: DataSourceStatus[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {sources.map((source) => (
        <div key={source.name} className="rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium text-gray-100 dark:text-gray-100 light:text-gray-900">{source.name}</div>
            <span className={`rounded-md border px-2 py-1 text-xs font-medium ${sourceClass(source)}`}>
              {sourceLabel(source)}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">{source.detail}</div>
          {source.updatedAt && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500 light:text-gray-500">
              更新 {formatDateTime(source.updatedAt)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function tickerSortValue(ticker: AiTickerMetric, sortKey: SortKey) {
  if (sortKey === 'heatScore') return ticker.heatScore
  if (sortKey === 'return1y') return nullableNumber(ticker.return1y)
  if (sortKey === 'distance200d') return nullableNumber(ticker.distance200d)
  if (sortKey === 'forwardPe') return nullableNumber(ticker.forwardPe ?? ticker.trailingPe)
  return nullableNumber(ticker.marketCap)
}

export function AiBubble() {
  const [sortKey, setSortKey] = useState<SortKey>('heatScore')
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['ai-bubble'],
    queryFn: getAiBubbleData,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  })

  const sortedTickers = useMemo(() => {
    if (!data) return []
    return [...data.tickers].sort((a, b) => tickerSortValue(b, sortKey) - tickerSortValue(a, sortKey))
  }, [data, sortKey])

  if (isLoading || !data) {
    return (
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="card p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <div className="text-gray-400 mt-4">正在拉取 AI 股票泡沫数据...</div>
        </div>
      </div>
    )
  }

  const topTicker = sortedTickers[0]
  const aiReturn1y = data.indicators.find((indicator) => indicator.name === 'AI 篮子 1 年涨幅')
  const avgDistance = data.indicators.find((indicator) => indicator.name === '平均偏离 200 日线')

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-100 dark:text-gray-100 light:text-gray-900">AI 股市泡沫指示器</h1>
              <span className={`rounded-md border px-3 py-1 text-sm font-medium ${stageStyles[data.stageTone]}`}>
                {data.stage}
              </span>
              {data.isFallback && (
                <span className="rounded-md border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-sm font-medium text-amber-300">
                  数据不完整
                </span>
              )}
            </div>
            <p className="mt-2 max-w-4xl text-gray-400 dark:text-gray-400 light:text-gray-600">
              追踪 Nvidia、Microsoft、Alphabet、Amazon、Meta、Broadcom、AMD、TSMC、Palantir 和半导体 ETF，衡量 AI 交易的涨幅、相对收益、估值和技术拥挤度。
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-secondary whitespace-nowrap"
          >
            {isFetching ? '刷新中...' : '刷新数据'}
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
          <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
            <BubbleGauge score={data.bubbleScore} />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <KpiCard
                label="AI 篮子 1 年"
                value={aiReturn1y?.value ?? 'N/A'}
                detail="等权 AI 股票篮子"
                accent="text-emerald-300"
              />
              <KpiCard
                label="平均偏离 200 日线"
                value={avgDistance?.value ?? 'N/A'}
                detail="越高表示趋势拥挤度越强"
                accent="text-amber-300"
              />
              <KpiCard
                label="最热标的"
                value={topTicker?.symbol ?? 'N/A'}
                detail={topTicker ? `热度 ${topTicker.heatScore}，1 年 ${marketSignalFormatters.percent(topTicker.return1y)}` : '暂无数据'}
                accent="text-rose-300"
              />
            </div>
          </div>

          <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
            <div className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">下一次可能拐点</div>
            <div className="mt-2 text-2xl font-bold text-gray-100 dark:text-gray-100 light:text-gray-900">{data.nextTurn.label}</div>
            <div className="mt-3 text-lg font-semibold text-primary">{data.nextTurn.daysText}</div>
            <div className="mt-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">{data.nextTurn.dateRange}</div>
            <div className="mt-4 rounded-lg bg-dark-700 dark:bg-dark-700 light:bg-gray-100 p-4 text-sm text-gray-300 dark:text-gray-300 light:text-gray-700">
              {data.nextTurn.rationale}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-400 dark:text-gray-400 light:text-gray-600">置信度</span>
              <span className="font-medium text-gray-100 dark:text-gray-100 light:text-gray-900">{data.nextTurn.confidence}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-6">
          <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">AI 篮子相对大盘</h2>
                <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">所有序列以共同起点归一化为 100。</p>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 light:text-gray-500">更新 {formatDateTime(data.asOf)}</div>
            </div>
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={data.basketHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#273244" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} minTickGap={48} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `${Number(value).toFixed(0)}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb' }}
                  formatter={(value, name) => [Number(value).toFixed(1), name]}
                />
                <Line type="monotone" dataKey="aiBasket" name="AI Basket" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="qqq" name="QQQ" stroke="#38bdf8" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="sp500" name="SPY" stroke="#34d399" strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">个股热度排行</h2>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">综合动量、均线偏离、RSI 和回撤。</p>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={sortedTickers.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#273244" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis type="category" dataKey="symbol" tick={{ fill: '#9ca3af', fontSize: 12 }} width={56} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb' }} />
                <Bar dataKey="heatScore" radius={[0, 6, 6, 0]}>
                  {sortedTickers.slice(0, 8).map((ticker) => (
                    <Cell key={ticker.symbol} fill={scoreColor(ticker.heatScore)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">泡沫指标贡献</h2>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">分数越高，AI 交易越接近泡沫化或估值压缩风险区。</p>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={data.indicators}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#273244" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} interval={0} angle={-24} textAnchor="end" height={90} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb' }} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {data.indicators.map((indicator, index) => (
                      <Cell key={indicator.name} fill={barColors[index % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">指标解释</h2>
            <div className="mt-4 max-h-[430px] overflow-y-auto pr-1">
              <IndicatorList indicators={data.indicators} />
            </div>
          </div>
        </div>

        <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">AI 股票明细</h2>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">行情、PE、市值和 52 周区间来自新浪美股接口；无 live 数据时不使用模拟快照。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['heatScore', '热度'],
                ['return1y', '1 年涨幅'],
                ['distance200d', '200D 偏离'],
                ['forwardPe', 'PE'],
                ['marketCap', '市值'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSortKey(key as SortKey)}
                  className={`rounded-lg px-3 py-2 text-sm transition-all ${
                    sortKey === key
                      ? 'bg-primary text-white'
                      : 'bg-dark-700 dark:bg-dark-700 light:bg-gray-100 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-dark-600 dark:hover:bg-dark-600 light:hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1120px]">
              <thead>
                <tr className="border-b border-dark-700 dark:border-dark-700 light:border-gray-200 text-left text-xs uppercase text-gray-500 dark:text-gray-500 light:text-gray-600">
                  <th className="py-3 pr-4 font-medium">标的</th>
                  <th className="py-3 pr-4 text-right font-medium">价格</th>
                  <th className="py-3 pr-4 text-right font-medium">1D</th>
                  <th className="py-3 pr-4 text-right font-medium">1M</th>
                  <th className="py-3 pr-4 text-right font-medium">3M</th>
                  <th className="py-3 pr-4 text-right font-medium">1Y</th>
                  <th className="py-3 pr-4 text-right font-medium">52W 回撤</th>
                  <th className="py-3 pr-4 text-right font-medium">200D 偏离</th>
                  <th className="py-3 pr-4 text-right font-medium">RSI</th>
                  <th className="py-3 pr-4 text-right font-medium">市值</th>
                  <th className="py-3 pr-4 text-right font-medium">PE</th>
                  <th className="py-3 text-right font-medium">热度</th>
                </tr>
              </thead>
              <tbody>
                {sortedTickers.map((ticker) => (
                  <tr key={ticker.symbol} className="border-b border-dark-700/70 dark:border-dark-700/70 light:border-gray-100">
                    <td className="py-4 pr-4">
                      <div className="font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">{ticker.symbol}</div>
                      <div className="max-w-[220px] truncate text-sm text-gray-500 dark:text-gray-500 light:text-gray-600">{ticker.name}</div>
                    </td>
                    <td className="py-4 pr-4 text-right font-mono text-gray-100 dark:text-gray-100 light:text-gray-900">
                      {marketSignalFormatters.compact(ticker.price, '$')}
                    </td>
                    {[ticker.change1d, ticker.return1m, ticker.return3m, ticker.return1y, ticker.drawdown52w, ticker.distance200d].map((value, index) => (
                      <td key={index} className={`py-4 pr-4 text-right font-mono ${(value ?? 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {marketSignalFormatters.percent(value)}
                      </td>
                    ))}
                    <td className="py-4 pr-4 text-right font-mono text-gray-300 dark:text-gray-300 light:text-gray-700">
                      {ticker.rsi14 === null ? 'N/A' : ticker.rsi14.toFixed(1)}
                    </td>
                    <td className="py-4 pr-4 text-right font-mono text-gray-300 dark:text-gray-300 light:text-gray-700">
                      {marketSignalFormatters.compact(ticker.marketCap, '$')}
                    </td>
                    <td className="py-4 pr-4 text-right font-mono text-gray-300 dark:text-gray-300 light:text-gray-700">
                      {ticker.forwardPe ?? ticker.trailingPe ? `${(ticker.forwardPe ?? ticker.trailingPe ?? 0).toFixed(1)}x` : 'N/A'}
                    </td>
                    <td className="py-4 text-right">
                      <span
                        className="inline-flex min-w-12 justify-center rounded-md px-2 py-1 font-mono text-sm font-semibold"
                        style={{ color: scoreColor(ticker.heatScore), backgroundColor: `${scoreColor(ticker.heatScore)}22` }}
                      >
                        {ticker.heatScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">数据源状态</h2>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
            Live 表示本次成功拉取，Failed 表示该源不可用；不可用源不会用模拟数据补分。泡沫分数是监控指标，不构成投资建议。
          </p>
          <div className="mt-4">
            <SourceStatusList sources={data.sources} />
          </div>
        </div>
      </div>
    </div>
  )
}
