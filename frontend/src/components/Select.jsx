import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react'

export default function Select({ value, onChange, options, placeholder = 'Select', className = '', openUp = false }) {
  const selected = options.find((o) => o.value === value)

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={`relative ${className}`}>
        <ListboxButton className="flex w-full items-center justify-between rounded-lg border border-mauve-300 bg-white px-3 py-2 text-left text-sm text-mauve-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 data-open:border-brand data-open:ring-2 data-open:ring-brand/15">
          <span className={`truncate ${selected ? '' : 'text-mauve-400'}`}>{selected?.label ?? placeholder}</span>
          <svg className="ml-2 h-4 w-4 shrink-0 text-mauve-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </ListboxButton>

        <ListboxOptions
          className={`absolute left-0 right-0 z-50 max-h-60 overflow-auto rounded-lg border border-mauve-200 bg-white p-1 shadow-lg focus:outline-none ${
            openUp ? 'bottom-full mb-1' : 'mt-1'
          }`}
        >
          {options.map((o) => (
            <ListboxOption
              key={o.value}
              value={o.value}
              className="cursor-pointer rounded-md px-3 py-2 text-sm text-mauve-800 data-focus:bg-mauve-100 data-selected:font-medium data-selected:text-brand"
            >
              {o.label}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}