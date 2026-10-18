import { useState } from 'react'
import Modal from './Modal'
import Field from './TextField'
import Select from './Select'
import { GAS_TYPES, SERIAL_PATTERN } from '../utils/constant'
import { createCylinder, updateCylinder } from '../utils/api'
import { confirmAction, showError, showToast } from '../utils/alerts'

const inputCls = 'w-full rounded-lg border border-mauve-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15'

export default function FormModal({ cylinder, onClose, onSaved }) {
  const isEdit = cylinder !== null
  const [serialNumber, setSerialNumber] = useState(cylinder?.serialNumber ?? '')
  const [gasType, setGasType] = useState(cylinder?.gasType ?? '')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function validate() {
    const next = {}
    const serial = serialNumber.trim()

    if (!serial) next.serialNumber = 'Serial number is required.'
    else if (!SERIAL_PATTERN.test(serial)) next.serialNumber = 'Format must be CYL- followed by 6 digits.'
    if (!gasType) next.gasType = 'Please select a gas type.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function confirmText() {
    const serial = serialNumber.trim().toUpperCase()
    if (!isEdit) return `Create cylinder <b>${serial}</b> (${gasType})?`
    const changes = []
    if (serial !== cylinder.serialNumber) changes.push(`Serial: ${cylinder.serialNumber} → <b>${serial}</b>`)
    if (gasType !== cylinder.gasType) changes.push(`Gas: ${cylinder.gasType} → <b>${gasType}</b>`)
    return `Save changes to <b>${cylinder.serialNumber}</b>?<br><small>${changes.join('<br>') || 'No changes found'}</small>`
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    if (!(await confirmAction(confirmText(), isEdit ? 'Yes, Save' : 'Yes, Create'))) return

    setSaving(true)
    try {
      const body = { serialNumber: serialNumber.trim(), gasType }
      if (isEdit) await updateCylinder(cylinder.id, body)
      else await createCylinder(body)
      showToast(isEdit ? 'Data updated' : 'New Data Added')
      onSaved()
      onClose()
    } catch (err) {
      showError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={isEdit ? 'Edit Cylinder Data' : 'Add New Cylinder Data'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Serial number *" error={errors.serialNumber}>
          <input
            className={`${inputCls} uppercase`}
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="CYL-000123"
            autoFocus
          />
        </Field>

        <Field label="Gas type *" error={errors.gasType} hint={!isEdit ? 'New cylinders always start as Empty.' : null}>
          <Select
            className="w-full"
            value={gasType}
            onChange={setGasType}
            placeholder="Select gas type"
            options={GAS_TYPES.map((g) => ({ value: g, label: g }))}
          />
        </Field>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-mauve-300 bg-white px-3.5 py-2 text-sm font-medium text-mauve-800 hover:bg-mauve-50">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-50">
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add cylinder'}
          </button>
        </div>
      </form>
    </Modal>
  )
}