import { axiosInstance } from "../utils/AxiosInstance";
import ApiRoutes from "../utils/ApiRoutes";

const createForm = async (formData) => {
  const res = await axiosInstance.post(ApiRoutes.FORM.CREATE, formData);
  return res.data;
};

const getFormById = async (id) => {
  const res = await axiosInstance.get(ApiRoutes.FORM.GET_BY_ID(id));
  return res.data;
};

const updateForm = async (id, data) => {
  const res = await axiosInstance.put(ApiRoutes.FORM.EDIT_FORM(id), data);
  return res.data;
};

const deleteForm = async (id) => {
  const res = await axiosInstance.delete(ApiRoutes.FORM.DELETE_FORM(id));
  return res.data;
};

const FormService = {
  createForm,
  getFormById,
  updateForm,
  deleteForm,
};

export default FormService;
