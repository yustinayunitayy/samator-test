export const GAS_TYPES = ['Oxygen', 'Nitrogen', 'Argon', 'Carbon Dioxide', 'Acetylene', 'Hydrogen']

export const STATUSES = ['Empty', 'Filled', 'Delivered', 'InMaintenance', 'Retired']

export const ALLOWED_TRANSITIONS = {
  Empty: ['Filled', 'InMaintenance', 'Retired'],
  Filled: ['Delivered', 'InMaintenance', 'Retired'],
  Delivered: ['Empty'],
  InMaintenance: ['Empty', 'Retired'],
  Retired: [],
}

export const STATUS_LABELS = {
  Empty: 'Empty',
  Filled: 'Filled',
  Delivered: 'Delivered',
  InMaintenance: 'In Maintenance',
  Retired: 'Retired',
}

export const STATUS_STYLES = {
  Empty: 'bg-mauve-100 text-mauve-700 ring-mauve-300/60',
  Filled: 'bg-brand-soft/70 text-brand ring-brand/15',
  Delivered: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  InMaintenance: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  Retired: 'bg-rose-50 text-rose-800 ring-rose-600/20',
}

export const STATUS_COLORS = {
  Empty: '#8e8a94',
  Filled: '#5b5b9e',
  Delivered: '#3f8f74',
  InMaintenance: '#c98a3a',
  Retired: '#b6555c',
}

export const SERIAL_PATTERN = /^CYL-[0-9]{6}$/i
export const CUSTOMER_NAME_MAX = 120
export const PAGE_SIZES = [10, 25, 50]
export const IDLE_DAYS = 30