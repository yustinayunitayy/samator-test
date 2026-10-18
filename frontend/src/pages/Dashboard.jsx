import { Link } from 'react-router-dom'
import Chart from 'react-apexcharts'
import { getSummary } from '../utils/api'
import { useQuery } from '../utils/useQuery'
import { IDLE_DAYS, STATUSES, STATUS_COLORS, STATUS_LABELS } from '../utils/constant'
import StatusBadge from '../components/StatusBadge'

const card = 'rounded-xl border border-mauve-200 bg-white'
const stateBox = `${card} p-9 text-center text-mauve-600`
const retryBtn = 'rounded-md border border-brand-soft bg-white px-2.5 py-1 text-sm hover:bg-mauve-50'

function Tile({ label, value, sub, to, tone = 'border-mauve-200 bg-white hover:border-mauve-300' }) {
  return (
    <Link to={to} className={`block rounded-xl border p-4 transition hover:shadow-sm ${tone}`}>
      <div className="text-xs font-medium text-mauve-500">{label}</div>
      <div className="mt-3 text-2xl font-semibold tabular-nums text-mauve-900">{value}</div>
      <div className="mt-0.5 text-xs text-mauve-500">{sub}</div>
    </Link>
  )
}

export default function Dashboard() {
  const { data: s, loading, error, refresh } = useQuery(getSummary)

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-14">
        <div className={`${stateBox} border-red-200 bg-red-50`}>
          <h3 className="mb-1 font-semibold text-mauve-900">Failed to load dashboard</h3>
          <p className="mb-3">{error.message}</p>
          <button onClick={refresh} className={retryBtn}>Retry</button>
        </div>
      </div>
    )
  }

  if (loading && !s) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className={stateBox}>Fetching dashboard...</div>
      </div>
    )
  }

  const delivered = s.byStatus.Delivered ?? 0
  const filled = s.byStatus.Filled ?? 0
  const maintenance = s.byStatus.InMaintenance ?? 0
  const retired = s.byStatus.Retired ?? 0

  // Cylinders Status
  const donutOptions = {
    chart: { type: 'donut', fontFamily: 'Montserrat, sans-serif', animations: { speed: 400 } },
    labels: STATUSES.map((k) => STATUS_LABELS[k]),
    colors: STATUSES.map((k) => STATUS_COLORS[k]),
    stroke: { width: 3, colors: ['#fff'] },
    legend: { show: false },
    dataLabels: { enabled: false },
    states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: '60%',
          labels: {
            show: true,
            name: { show: true, fontSize: '12px', color: '#6f6e77', offsetY: 18 },
            value: { show: true, fontSize: '26px', fontWeight: 600, color: '#211f26', offsetY: -10 },
            total: { show: true, label: 'cylinders', fontSize: '12px', color: '#6f6e77' },
          },
        },
      },
    },
    tooltip: { y: { formatter: (v) => `${v} cylinders` } },
  }

  // Cylinders Activity
  const months = Object.keys(s.movementByMonth).map((k) =>
    new Date(k + '-01T00:00:00').toLocaleDateString('en-GB', { month: 'short' }),
  )
  const areaOptions = {
    chart: { type: 'area', fontFamily: 'Montserrat, sans-serif', toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#313178'],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.18, opacityTo: 0.02, stops: [0, 100] } },
    markers: { size: 3, strokeWidth: 2, strokeColors: '#fff', hover: { size: 5 } },
    dataLabels: { enabled: false },
    grid: { borderColor: '#ebeaee', strokeDashArray: 4, xaxis: { lines: { show: false } }, padding: { left: 8, right: 8 } },
    xaxis: { categories: months, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: '#8e8a94', fontSize: '11px' } } },
    yaxis: { min: 0, forceNiceScale: true, labels: { style: { colors: '#8e8a94', fontSize: '11px' }, formatter: (v) => Math.round(v) } },
    tooltip: { y: { formatter: (v) => `${v} cylinders` } },
  }

  return (
    <div className={`mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-14 ${loading ? 'opacity-60' : ''}`}>
      <h1 className="text-xl font-bold">Dashboard</h1>
      <p className="mb-5 mt-1 text-mauve-600">Fleet overview - {s.total} cylinders</p>

      {/* Data Tiles */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <Tile label="Total cylinders" value={s.total} sub={`${s.active} active, ${retired} retired`} to="/cylinders" />
        <Tile label="Delivered" value={delivered} sub={`${s.activeCustomers} customers`} to="/cylinders?status=Delivered" />
        <Tile label="Filled" value={filled} sub="ready for delivery" to="/cylinders?status=Filled" />
        <Tile label="In maintenance" value={maintenance} sub="not available" tone="border-red-200 bg-red-50 hover:border-red-300" to="/cylinders?status=InMaintenance" />
        <Tile label={`Idle ${IDLE_DAYS}+ days`} value={s.idleCount} sub="need attention" tone="border-orange-200 bg-orange-50 hover:border-orange-300" to="/cylinders?idle=1" />
      </div>
      {/* Charts */}
      <div className="mb-4 grid gap-3 lg:grid-cols-2">
        <div className={`${card} p-5`}>
          <h3 className="text-sm font-semibold">Status overview</h3>
          <p className="mb-2 text-xs text-mauve-500">Click a status to open the list</p>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="w-full max-w-55 shrink-0">
              <Chart type="donut" height={220} options={donutOptions} series={STATUSES.map((k) => s.byStatus[k] ?? 0)} />
            </div>
            <ul className="w-full min-w-0 flex-1 divide-y divide-mauve-100 text-sm">
              {STATUSES.map((k) => (
                <li key={k}>
                  <Link to={`/cylinders?status=${k}`} className="flex items-center gap-2.5 py-2 hover:text-brand">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: STATUS_COLORS[k] }} />
                    <span className="flex-1 whitespace-nowrap text-mauve-700">{STATUS_LABELS[k]}</span>
                    <span className="font-medium tabular-nums">{s.byStatus[k] ?? 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`${card} p-5`}>
          <h3 className="text-sm font-semibold">Updates per month</h3>
          <p className="mb-2 text-xs text-mauve-500">Cylinders by last updated date, last 6 months</p>
          <Chart type="area" height={236} options={areaOptions} series={[{ name: 'Cylinders', data: Object.values(s.movementByMonth) }]} />
        </div>
      </div>

      {/* Idle cylinders */}
      <div className={`${card} p-5`}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Idle cylinders</h3>
            <p className="text-xs text-mauve-500">Not updated for {IDLE_DAYS}+ days, retired excluded</p>
          </div>
          {s.idleCount > 0 && (
            <Link
              to="/cylinders?idle=1"
              className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100"
            >
              See all {s.idleCount} idle
            </Link>
          )}
        </div>
        {s.idleCylinders.length === 0 ? (
          <p className="text-sm text-mauve-500">No idle cylinders.</p>
        ) : (
          <table className="w-full text-sm text-center">
            <thead className="text-xs font-semibold tracking-wide text-mauve-500 uppercase">
              <tr>
                <th className="py-2">Serial no.</th>
                <th className="py-2">Status</th>
                <th className="py-2">Last updated</th>
                <th className="py-2">Idle for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mauve-100">
              {s.idleCylinders.map((c) => (
                <tr key={c.id}>
                  <td className="py-2.5">
                    <Link to={`/cylinders?search=${c.serialNumber}`} className="font-medium tabular-nums hover:text-brand">
                      {c.serialNumber}
                    </Link>
                  </td>
                  <td className="py-2.5"><StatusBadge status={c.status} /></td>
                  <td className="py-2.5 tabular-nums">{new Date(c.lastUpdated).toLocaleDateString()}</td>
                  <td className="py-2.5 font-semibold text-red-600 tabular-nums">{c.idleDays} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}