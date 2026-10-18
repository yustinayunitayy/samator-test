import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCylinders } from '../utils/api'
import { useQuery } from '../utils/useQuery'
import { IDLE_DAYS, STATUSES, STATUS_LABELS } from '../utils/constant'
import TableData from '../components/TableData'
import Pagination from '../components/Pagination'
import FormModal from '../components/FormModal'
import StatusChangeModal from '../components/StatusChangeModal'
import Select from '../components/Select'

export default function Database() {
  const [searchParams, setSearchParams] = useSearchParams()

  // filters (status, search, and idle can come from dashboard links)
  const idleOnly = searchParams.get('idle') === '1'
  const [keyword, setKeyword] = useState(searchParams.get('search') ?? '')
  const [search, setSearch] = useState(keyword)
  const [status, setStatus] = useState(searchParams.get('status') ?? '')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // data
  const [modal, setModal] = useState(null)
  const fetchList = useCallback(
    () => getCylinders({ search, status, page, pageSize, idleOnly }),
    [search, status, page, pageSize, idleOnly],
  )
  const list = useQuery(fetchList)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(keyword)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [keyword])

  function handleStatusChange(value) {
    setStatus(value)
    setPage(1)
  }

  function handlePageSizeChange(size) {
    setPageSize(size)
    setPage(1)
  }

  function clearIdle() {
    const next = new URLSearchParams(searchParams)
    next.delete('idle')
    setSearchParams(next, { replace: true })
    setPage(1)
  }

  const closeModal = () => setModal(null)
  const totalCount = list.data?.totalCount ?? 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-14">
      <h1 className="text-xl font-bold">Database Cylinders</h1>
      <p className="mb-5 mt-1 text-mauve-600 text-base">Manage the data and update the status here</p>

      <div className="mb-4 flex gap-2.5 text-sm">
        <input
          className="flex-1 rounded-lg border border-brand-soft bg-white px-3 py-2 outline-none focus:border-brand"
          placeholder="Search serial number or customer..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Select
          className="w-44"
          value={status}
          onChange={handleStatusChange}
          options={[{ value: '', label: 'All statuses' }, ...STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))]}
        />
        <button
          onClick={() => setModal({ type: 'form', cylinder: null })}
          className="rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-soft hover:text-brand"
        >
          + Add cylinder
        </button>
      </div>

      {idleOnly && (
        <div className="mb-3 text-xs">
          <button
            type="button"
            onClick={clearIdle}
            title="Remove this filter"
            className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-800 hover:bg-amber-100"
          >
            Idle over {IDLE_DAYS} days x
          </button>
        </div>
      )}

      <TableData
        data={list.data}
        loading={list.loading}
        error={list.error}
        onRetry={list.refresh}
        onEdit={(c) => setModal({ type: 'form', cylinder: c })}
        onStatus={(c) => setModal({ type: 'status', cylinder: c })}
      />

      {list.data && !list.error && totalCount > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {modal?.type === 'form' && (
        <FormModal cylinder={modal.cylinder} onClose={closeModal} onSaved={list.refresh} />
      )}
      {modal?.type === 'status' && (
        <StatusChangeModal cylinder={modal.cylinder} onClose={closeModal} onSaved={list.refresh} />
      )}
    </div>
  )
}