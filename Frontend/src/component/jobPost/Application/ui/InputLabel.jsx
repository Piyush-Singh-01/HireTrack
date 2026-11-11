const InputLabel = ({
  label,
  required = true,
  className = "",
  container = "",
  error,
  ...inputProps
}) => {
  return (
    <div className={`w-full space-y-1.5 ${container}`}>
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        {...inputProps}
        className={`
          w-full rounded-lg border bg-white px-4 py-2.5
          text-sm text-slate-800
          placeholder:text-sm placeholder:text-slate-400
          shadow-sm transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-indigo-500/20
          ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
              : "border-slate-300 hover:border-slate-400 focus:border-indigo-500"
          }
          disabled:cursor-not-allowed disabled:bg-slate-100
          disabled:text-slate-500
          ${className}
        `}
      />

      {error && (
        <p className="mt-1 text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputLabel;
