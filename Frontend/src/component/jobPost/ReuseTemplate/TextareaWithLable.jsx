import { useCallback, useRef } from "react";

const TextareaWithLabel = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder = "",
  autoNewline = false,
}) => {
  const textareaRef = useRef(null);

  const handleChangeValue = useCallback(
    (event) => {
      let val = event.target.value;
      const selectionStart = event.target.selectionStart;

      if (autoNewline && selectionStart > 1) {
        const lastTwo = val.substring(selectionStart - 2, selectionStart);
        if (lastTwo === ". ") {
          const lastFive = val
            .substring(Math.max(0, selectionStart - 5), selectionStart)
            .toLowerCase();

          if (lastFive !== "e.g. " && lastFive !== "i.e. ") {
            const before = val.substring(0, selectionStart - 1);
            const after = val.substring(selectionStart);
            val = before + "\n• " + after;

            onChange(val);

            // Re-position cursor after state update
            setTimeout(() => {
              if (textareaRef.current) {
                const newPos = selectionStart + 2;
                textareaRef.current.setSelectionRange(newPos, newPos);
              }
            }, 0);
            return;
          }
        }
      }

      onChange(val);
    },
    [onChange, autoNewline]
  );

  const handleKeyDown = (event) => {
    if (autoNewline && event.key === "Enter") {
      event.preventDefault();
      const pos = event.target.selectionStart;
      const before = value.substring(0, pos);
      const after = value.substring(pos);

      const newValue = before + "\n• " + after;
      onChange(newValue);

      // Re-position cursor after state update
      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = pos + 3;
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    }
  };

  const handleBlur = (event) => {
    if (onBlur) {
      onBlur(event.target.value);
    }
  };

  return (
    <div className="my-2 w-full">
      <div className="mb-2">
        <label className="block text-sm font-semibold leading-5 text-slate-700 md:text-[15px]">
          {label}
        </label>
      </div>

      <textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={value}
        onChange={handleChangeValue}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        rows={5}
        className="
          box-border min-h-24 w-full resize-y rounded-xl border border-slate-200
          bg-slate-50 px-3.5 py-3 text-sm leading-6 text-slate-800
          shadow-sm shadow-slate-900/[0.02] outline-none transition duration-200
          placeholder:text-slate-400
          hover:border-slate-300 hover:bg-white
          focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10
          md:text-sm
        "
      />

      {autoNewline && (
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Tip: Press Enter to start a new bullet point.
        </p>
      )}
    </div>
  );
};

export default TextareaWithLabel;
