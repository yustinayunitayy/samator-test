import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Chart from 'react-apexcharts'
import { getSummary } from '../utils/api'
import StatusBadge from '../components/StatusBadge'

// Same hues as STATUS_STYLES, so the donut and the badges speak one language
const STATUS_COLORS = {
  Empty: '#908e96',
  Filled: '#313178',
  Delivered: '#16a34a',
  InMaintenance: '#ea580c',
  Retired: '#dc2626',
}

const card = 'rounded-xl bg-white p-5'
const retryBtn = 'rounded-md border border-brand-soft bg-white px-2.5 py-1 text-sm hover:bg-mauve-50'

function Tile({ label, value, sub, to, accent = 'border-brand' }) {
  const body = (
    <div className={`${card} border-l-4 ${accent} transition hover:shadow-md`}>
      <div className="text-xs font-medium text-mauve-600">{label}</div>
      <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-xs text-mauve-500">{sub}</div>}
    </div>
  )
  return to ? <Link to={to}>{body}</Link> : body
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setSummary(await getSummary())
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className={`${card} border border-mauve-200 p-9 text-center text-mauve-600`}>Fetching dashboard…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className={`${card} border border-red-200 bg-red-50 p-9 text-center text-mauve-600`}>
          <h3 className="mb-1 font-semibold text-mauve-900">Failed to load dashboard</h3>
          <p className="mb-3">{error.message}</p>
          <button onClick={load} className={retryBtn}>Retry</button>
        </div>
      </div>
    )
  }

  const s = summary
  const circulationPct = s.active ? Math.round((s.utilization / s.active) * 100) : 0
  const statusLabels = Object.keys(s.byStatus)

  // ---- donut: lifecycle snapshot ----
  const donutOptions = {
    chart: { type: 'donut', fontFamily: 'Montserrat, sans-serif', animations: { speed: 500 } },
    labels: statusLabels,
    colors: statusLabels.map((k) => STATUS_COLORS[k]),
    stroke: { width: 2, colors: ['#fff'] },
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: { show: true, fontSize: '12px', color: '#6f6e77', offsetY: 18 },
            value: { show: true, fontSize: '28px', fontWeight: 600, color: '#211f26', offsetY: -10 },
            total: { show: true, label: 'cylinders', fontSize: '12px', color: '#6f6e77' },
          },
        },
      },
    },
    tooltip: { y: { formatter: (v) => `${v} cylinders` } },
  }

  // ---- area: movement per month ----
  const months = Object.keys(s.movementByMonth).map((k) =>
    new Date(k + '-01').toLocaleDateString('en-GB', { month: 'short' }),
  )
  const areaOptions = {
    chart: { type: 'area', fontFamily: 'Montserrat, sans-serif', toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#313178'],
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] } },
    markers: { size: 4, strokeWidth: 2, strokeColors: '#fff', hover: { size: 6 } },
    dataLabels: { enabled: false },
    grid: { borderColor: '#eeedef', strokeDashArray: 4, xaxis: { lines: { show: false } } },
    xaxis: { categories: months, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: '#898781' } } },
    yaxis: { min: 0, forceNiceScale: true, labels: { style: { colors: '#898781' }, formatter: (v) => Math.round(v) } },
    tooltip: { y: { formatter: (v) => `${v} status changes` } },
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mb-5 mt-1 text-mauve-600">Fleet overview · {s.total} cylinders</p>

      {/* KPI tiles */}
      <div className="mb-4 grid grid-cols-5 gap-3">
        <Tile label="Total cylinders" value={s.total} sub="single source of truth" to="/cylinders" />
        <Tile label="Active customers" value={s.activeCustomers} sub="holding delivered cylinders" to="/cylinders?status=Delivered" accent="border-green-600" />
        <Tile label="In circulation" value={`${circulationPct}%`} sub={`${s.utilization} of ${s.active} active`} to="/cylinders?status=Delivered" accent="border-brand-light" />
        <Tile label="⚠ Idle over 30 days" value={s.idleCount} sub="possible idle or lost assets" accent="border-amber-500" />
        <Tile label="In maintenance" value={s.byStatus.InMaintenance} sub="unavailable for filling" to="/cylinders?status=InMaintenance" accent="border-orange-500" />
      </div>

      {/* charts */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className={card}>
          <h3 className="font-semibold">Lifecycle snapshot</h3>
          <p className="mb-2 text-xs text-mauve-500">Where every cylinder is right now</p>
          <Chart type="donut" height={240} options={donutOptions} series={statusLabels.map((k) => s.byStatus[k])} />
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-mauve-600">
            {statusLabels.map((k) => (
              <Link key={k} to={`/cylinders?status=${k}`} className="flex items-center gap-1.5 hover:text-brand">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: STATUS_COLORS[k] }} />
                {k} <b className="tabular-nums">{s.byStatus[k]}</b>
              </Link>
            ))}
          </div>
        </div>

        <div className={card}>
          <h3 className="font-semibold">Movement per month</h3>
          <p className="mb-2 text-xs text-mauve-500">Status changes recorded, last 6 months</p>
          <Chart type="area" height={260} options={areaOptions} series={[{ name: 'Status changes', data: Object.values(s.movementByMonth) }]} />
        </div>
      </div>

      {/* needs attention */}
      <div className={card}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">⚠ Needs attention</h3>
            <p className="text-xs text-mauve-500">Longest idle cylinders, not retired</p>
          </div>
          <span className="text-sm text-mauve-500">{s.idleCount} total</span>
        </div>
        {s.idleCylinders.length === 0 ? (
          <p className="text-sm text-mauve-500">No idle cylinders. Everything moved within the last 30 days.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {s.idleCylinders.map((c) => (
                <tr key={c.id} className="border-t border-mauve-100">
                  <td className="py-2 tabular-nums">{c.serialNumber}</td>
                  <td className="py-2"><StatusBadge status={c.status} /></td>
                  <td className="py-2 text-right font-semibold tabular-nums text-orange-700">{c.idleDays} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}