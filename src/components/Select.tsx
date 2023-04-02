import { ChangeEventHandler } from "react"

type SelectProps = {
  label: string
  options?: string[]
  defaultOption: string
  handleChange: ChangeEventHandler<HTMLSelectElement>
}

const Select = (props: SelectProps) => {
  const { label, options, defaultOption, handleChange } = props

  return (
    <div>
      <label
        htmlFor="select"
        className="block mb-2 text-sm font-medium text-gray-900 "
      >
        {label}
      </label>
      {options && (
        <select
          onChange={handleChange}
          id="select"
          defaultValue={defaultOption}
          className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-1.5 "
        >
          {options.map((option) => {
            return <option key={option}>{option}</option>
          })}
        </select>
      )}
    </div>
  )
}

export { Select }
