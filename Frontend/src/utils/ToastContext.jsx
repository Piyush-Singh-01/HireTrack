import { useState } from "react";
import { createContext } from "react";
import Toast from "../component/ui/Toast";
import { useContext } from "react";


const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "",
  })

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" })
    }, 3000)
  }

  return (
    <ToastContext.Provider value={{showToast}}>
      {children}
      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </ToastContext.Provider>
  )

}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider")
  return ctx
}