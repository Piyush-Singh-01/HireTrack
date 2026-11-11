import { useDispatch, useStore } from "react-redux";
import { useToast } from "../utils/ToastContext";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";
import { resetForm } from "../store/slice/FormSlice";

const typeMap = {
  short: "short",
  paragraph: "paragraph",
  choice: "choice",
  multipleChoice: "multipleChoice",
  textOnly: "textOnly",
  text: "short",
  textarea: "paragraph",
  radio: "choice",
  checkbox: "multipleChoice",
};

const flattenModulesToFields = (modules) => {
  return Object.entries(modules).flatMap(([module, fields]) =>
    fields.map((field) => ({
      ...field,
      fieldId: field.fieldId || field.id || `f-${crypto.randomUUID()}`,
      label: field.label || "Untitled Question",
      type: typeMap[field.type] || field.type || "text",
      meta: {
        ...field.meta,
        module,
        isScreening: true,
      },
    }))
  );
};


const useForm = () => {
  const dispatch = useDispatch()
  const { showToast } = useToast()
  const store = useStore();
  
  const createFormMutation = useMutation({
    mutationFn: async (manualPayload) => {
      // Use manualPayload if provided, otherwise fallback to store
      const state = store.getState();
      const form = state.form;
      
      const payload = manualPayload || {
        jobId: form.jobId,
        title: form.title,
        description: form.description,
        fields: flattenModulesToFields(form.modules)
      };
      if (!payload.jobId) {
        throw new Error("Missing jobId for form creation");
      }
      const res = await axiosInstance.post(ApiRoutes.FORM.CREATE, payload);
      return res.data;
    },
    onSuccess: (data) => {
      const isDuplicate = data?.message?.includes("already exists");
      showToast(isDuplicate ? "Using existing form" : "Form created successfully", "success");
      dispatch(resetForm());
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "";
      // Suppress toast if form already exists (handled programmatically in recovery flows)
      if (message.includes("Active form already exists")) {
        return;
      }
      showToast(message || "Failed to create form", "error");
    }
  });
  return {
    createForm: createFormMutation.mutateAsync, 
    isCreating:createFormMutation.isLoading,
  }
}

export default useForm;
