import { useCallback } from "react";

const InputWithLabel = ({
  label,
  value,
  onChange,
  type = "text",
  min,
  disabled,
  readOnly,
  inputClassName = "",
  inputWidthClass,
  placeholder,
}) => {
  const handleChangeValue = useCallback(
    (event) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <>
      <div className="flex flex-col w-full">
        <label className="mb-1.5 text-sm font-medium text-gray-700">
          {label}
        </label>
        <div>
          <input
            type={type}
            value={value}
            min={min}
            onChange={handleChangeValue}
            className={`w-full ${inputWidthClass || "md:w-1/2"} rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none read-only:bg-gray-50 ${inputClassName}`}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
          />
        </div>
      </div>
    </>
  );
};

export default InputWithLabel;