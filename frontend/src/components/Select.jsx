import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react'

export default function Select({ value, onChange, options, placeholder = 'Select', className = '', openUp = false }) {
    const selected = options.find((o) => o.value === value)

    return (
        <Listbox value={value} onChange={onChange}>
            <div className={`relative ${className}`}>
                <ListboxButton className="flex w-full items-center justify-between rounded-lg border border-brand-soft bg-white px-3 py-2 text-left outline-none focus:border-brand data-open:border-brand">
                    <span className={`whitespace-nowrap ${selected ? '' : 'text-mauve-400'}`}>{selected?.label ?? placeholder}</span>
                    <svg className="ml-2 h-4 w-4 text-mauve-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                    </svg>
                </ListboxButton>

                <ListboxOptions
                    className={`absolute left-0 right-0 z-50 max-h-60 overflow-auto rounded-lg border border-mauve-200 bg-white p-1 shadow-lg focus:outline-none ${openUp ? 'bottom-full mb-1' : 'mt-1'
                        }`}
                >
                    {options.map((o) => (
                        <ListboxOption
                            key={o.value}
                            value={o.value}
                            className="cursor-pointer rounded px-3 py-2 text-sm data-focus:bg-brand-soft/20 data-selected:font-medium data-selected:text-brand"
                        >
                            {o.label}
                        </ListboxOption>
                    ))}
                </ListboxOptions>
            </div>
        </Listbox>
    )
}