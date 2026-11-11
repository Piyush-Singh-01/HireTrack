import { useEffect, useState } from "react";

const Toast = ({ message, type = "info" }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const typeStyles = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-gray-300 text-zinc-900 border-zinc-900", 
  };

  return (
    <div
      className={`
        fixed top-10 right-10 z-[100]
        px-4 py-3 rounded-lg text-white text-sm shadow-lg
        transition-all duration-300 ease-out
        ${
          visible
            ? "opacity-100 translate-x-0 translate-y-0"
            : "opacity-0 translate-x-6 translate-y-2"
        }
        ${typeStyles[type] || typeStyles.info}
      `}
    >
      {message}
    </div>
  );
};

export default Toast;
