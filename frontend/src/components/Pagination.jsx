import { PAGE_SIZES } from '../utils/constant'
import Select from './Select'

const navBtn = 'rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40'

export default function Pagination({ page, pageSize, totalCount, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)

  return (
    <div className="mt-3 flex items-center justify-between text-sm text-mauve-600">
      <div className="flex items-center gap-2">
        <span>Showing {from}–{to} of {totalCount}</span>
        <Select
          className="w-28"
          value={String(pageSize)}
          onChange={(v) => onPageSizeChange(Number(v))}
          options={PAGE_SIZES.map((n) => ({ value: String(n), label: `${n} / page` }))}
          openUp
        />
      </div>

      <div className="flex items-center gap-2">
        <button className={navBtn} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>‹ Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button className={navBtn} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next ›</button>
      </div>
    </div>
  )
}