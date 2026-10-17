export const GAS_TYPES = ['Oxygen', 'Nitrogen', 'Argon', 'Carbon Dioxide', 'Acetylene', 'Hydrogen']

export const STATUSES = ['Empty', 'Filled', 'Delivered', 'InMaintenance', 'Retired']

export const ALLOWED_TRANSITIONS = {
  Empty: ['Filled', 'InMaintenance', 'Retired'],
  Filled: ['Delivered', 'InMaintenance', 'Retired'],
  Delivered: ['Empty'],
  InMaintenance: ['Empty', 'Retired'],
  Retired: [],
}

export const STATUS_STYLES = {
  Empty: 'bg-stone-100 text-stone-600',
  Filled: 'bg-brand-soft/50 text-brand',
  Delivered: 'bg-green-100 text-green-800',
  InMaintenance: 'bg-orange-100 text-orange-800',
  Retired: 'bg-red-100 text-red-800',
}

export const SERIAL_PATTERN = /^CYL-[0-9]{6}$/i
export const CUSTOMER_NAME_MAX = 120
export const PAGE_SIZES = [10, 25, 50]