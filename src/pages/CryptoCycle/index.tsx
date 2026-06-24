import { useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getCryptoCycleData, marketSignalFormatters } from '../../api/marketSignals'
import type { CryptoCycleData, DataSourceStatus, SignalIndicator } from '../../api/marketSignals'

const regimeStyles: Record<CryptoCycleData['regimeTone'], string> = {
  bull: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  bear: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  neutral: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  risk: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
}

const indicatorColors = ['#38bdf8', '#34d399', '#f59e0b', '#f43f5e']

function scoreColor(score: number) {
  if (score >= 75) return '#f59e0b'
  if (score >= 55) return '#34d399'
  if (score >= 35) return '#38bdf8'
  return '#f43f5e'
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusText(source: DataSourceStatus) {
  if (source.status === 'live') return 'Live'
  if (source.status === 'fallback') return 'Fallback'
  return 'Failed'
}

function statusClass(source: DataSourceStatus) {
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

function HeatGauge({ score }: { score: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">周期热度</div>
          <div className="text-5xl font-bold tabular-nums text-gray-100 dark:text-gray-100 light:text-gray-900">{score}</div>
        </div>
        <div className="text-right text-xs text-gray-500 dark:text-gray-500 light:text-gray-600">
          <div>0 熊市压力</div>
          <div>100 过热风险</div>
        </div>
      </div>
      <div className="h-3 rounded-full bg-dark-700 dark:bg-dark-700 light:bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, #f43f5e 0%, #38bdf8 42%, #34d399 64%, #f59e0b 100%)`,
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
            <span className={`rounded-md border px-2 py-1 text-xs font-medium ${statusClass(source)}`}>
              {statusText(source)}
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

export function CryptoCycle() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['crypto-cycle'],
    queryFn: getCryptoCycleData,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  })

  if (isLoading || !data) {
    return (
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="card p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <div className="text-gray-400 mt-4">正在拉取加密市场周期数据...</div>
        </div>
      </div>
    )
  }

  const btc = data.assets.find((asset) => asset.symbol === 'BTC')
  const latestHistory = data.history[data.history.length - 1]
  const latestFear = data.fearGreedHistory[0]

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-100 dark:text-gray-100 light:text-gray-900">加密货币周期仪表盘</h1>
              <span className={`rounded-md border px-3 py-1 text-sm font-medium ${regimeStyles[data.regimeTone]}`}>
                {data.marketRegime}
              </span>
              {data.isFallback && (
                <span className="rounded-md border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-sm font-medium text-amber-300">
                  数据不完整
                </span>
              )}
            </div>
            <p className="mt-2 max-w-4xl text-gray-400 dark:text-gray-400 light:text-gray-600">
              综合 BTC 均线偏离、历史回撤、恐惧贪婪指数、成交量、减半时间和市占率，判断当前更接近熊市、筑底、牛市确认还是过热阶段。
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
            <HeatGauge score={data.heatScore} />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <KpiCard
                label="BTC 现价"
                value={marketSignalFormatters.compact(btc?.price ?? null, '$')}
                detail={`24h ${marketSignalFormatters.percent(btc?.change24h ?? null)}`}
                accent="text-sky-300"
              />
              <KpiCard
                label="距历史高点回撤"
                value={marketSignalFormatters.percent(latestHistory?.drawdown ?? null)}
                detail="使用可用历史价格滚动高点计算"
                accent={latestHistory?.drawdown < -45 ? 'text-rose-300' : 'text-emerald-300'}
              />
              <KpiCard
                label="恐惧贪婪"
                value={latestFear ? `${latestFear.value}` : 'N/A'}
                detail={latestFear?.label ?? '暂无实时情绪数据'}
                accent={latestFear && latestFear.value < 25 ? 'text-rose-300' : 'text-amber-300'}
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="上次 BTC 减半"
            value={data.halving.lastDate}
            detail={`已经过去 ${data.halving.daysSinceLast} 天`}
          />
          <KpiCard
            label="下次 BTC 减半估计"
            value={data.halving.nextDate}
            detail={`约 ${data.halving.daysToNext} 天后，目标高度 ${data.halving.nextHeight.toLocaleString('en-US')}`}
          />
          <KpiCard
            label="当前区块高度"
            value={data.halving.currentHeight ? data.halving.currentHeight.toLocaleString('en-US') : 'N/A'}
            detail={`周期进度 ${data.halving.progress.toFixed(1)}%`}
          />
          <KpiCard
            label="BTC 市占率"
            value={data.bitcoinDominance === null ? 'N/A' : `${data.bitcoinDominance.toFixed(1)}%`}
            detail="过高偏防御，过低偏风险偏好扩散"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-6">
          <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">BTC 价格与周期均线</h2>
                <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">200 日均线用于趋势确认，200 周均线用于长期周期底部观察。</p>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 light:text-gray-500">更新 {formatDateTime(data.asOf)}</div>
            </div>
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={data.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#273244" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} minTickGap={48} />
                <YAxis
                  yAxisId="price"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(value) => marketSignalFormatters.compact(Number(value), '$')}
                />
                <YAxis
                  yAxisId="heat"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb' }}
                  formatter={(value, name) => {
                    if (name === 'price' || name === 'ma200d' || name === 'ma200w') {
                      return [marketSignalFormatters.compact(Number(value), '$'), name]
                    }
                    return [Number(value).toFixed(0), name]
                  }}
                />
                <Line yAxisId="price" type="monotone" dataKey="price" name="BTC" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
                <Line yAxisId="price" type="monotone" dataKey="ma200d" name="200D" stroke="#34d399" strokeWidth={2} dot={false} connectNulls />
                <Line yAxisId="price" type="monotone" dataKey="ma200w" name="200W" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
                <Line yAxisId="heat" type="monotone" dataKey="heat" name="Heat" stroke="#f43f5e" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">情绪指数</h2>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">Alternative.me Fear & Greed，越低越恐惧。</p>
            <ResponsiveContainer width="100%" height={330}>
              <AreaChart data={[...data.fearGreedHistory].reverse()}>
                <defs>
                  <linearGradient id="fearGreedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#273244" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} minTickGap={34} />
                <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb' }} />
                <ReferenceLine y={25} stroke="#f43f5e" strokeDasharray="4 4" />
                <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2.5} fill="url(#fearGreedFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">周期指标贡献</h2>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">分数越高越偏牛市/过热，越低越偏熊市/筑底。</p>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={330}>
                <BarChart data={data.indicators}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#273244" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} interval={0} angle={-24} textAnchor="end" height={90} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb' }} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {data.indicators.map((indicator, index) => (
                      <Cell key={indicator.name} fill={indicatorColors[index % indicatorColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">指标解释</h2>
            <div className="mt-4 max-h-[420px] overflow-y-auto pr-1">
              <IndicatorList indicators={data.indicators} />
            </div>
          </div>
        </div>

        <div className="bg-dark-800 dark:bg-dark-800 light:bg-white rounded-lg border border-dark-700 dark:border-dark-700 light:border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">核心币种数据</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <thead>
                <tr className="border-b border-dark-700 dark:border-dark-700 light:border-gray-200 text-left text-xs uppercase text-gray-500 dark:text-gray-500 light:text-gray-600">
                  <th className="py-3 pr-4 font-medium">资产</th>
                  <th className="py-3 pr-4 text-right font-medium">价格</th>
                  <th className="py-3 pr-4 text-right font-medium">24h</th>
                  <th className="py-3 pr-4 text-right font-medium">市值</th>
                  <th className="py-3 text-right font-medium">24h 成交量</th>
                </tr>
              </thead>
              <tbody>
                {data.assets.map((asset) => (
                  <tr key={asset.symbol} className="border-b border-dark-700/70 dark:border-dark-700/70 light:border-gray-100">
                    <td className="py-4 pr-4">
                      <div className="font-semibold text-gray-100 dark:text-gray-100 light:text-gray-900">{asset.symbol}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-500 light:text-gray-600">{asset.name}</div>
                    </td>
                    <td className="py-4 pr-4 text-right font-mono text-gray-100 dark:text-gray-100 light:text-gray-900">
                      {asset.price > 0 ? marketSignalFormatters.compact(asset.price, '$') : 'N/A'}
                    </td>
                    <td className={`py-4 pr-4 text-right font-mono ${(asset.change24h ?? 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {marketSignalFormatters.percent(asset.change24h)}
                    </td>
                    <td className="py-4 pr-4 text-right font-mono text-gray-300 dark:text-gray-300 light:text-gray-700">
                      {marketSignalFormatters.compact(asset.marketCap, '$')}
                    </td>
                    <td className="py-4 text-right font-mono text-gray-300 dark:text-gray-300 light:text-gray-700">
                      {marketSignalFormatters.compact(asset.volume24h, '$')}
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
            Live 表示本次成功拉取，Failed 表示该源不可用；不可用源不会用模拟数据补分。模型输出仅用于周期监控，不构成投资建议。
          </p>
          <div className="mt-4">
            <SourceStatusList sources={data.sources} />
          </div>
        </div>
      </div>
    </div>
  )
}
