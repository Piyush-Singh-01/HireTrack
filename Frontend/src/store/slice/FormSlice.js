import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  jobId: null,
  title: "",
  description: "",
  activeModule: "personalInfo",
  
  modules: {
    personalInfo: [],
    education: [],
    experience: [],
    skills: [],
    attachments: [],
    addInfo: [],
    screening:[],
  }
}


const formSlice = createSlice({
  name: "form",
  initialState: initialState,
  reducers: {
    addField: (state, action) => {
      const { module, field } = action.payload
      state.modules[module].push(field)
    },
    updateField: (state, action) => {
      const { module, fieldId,changes } = action.payload
      const idx = state.modules[module].findIndex(f => f.fieldId === fieldId);
      if (idx !== -1) {
        state.modules[module][idx] = {
            ...state.modules[module][idx],
            ...changes,
        }
      }
    },
    deleteField: (state, action) => {
      const { module, fieldId } = action.payload;
      state.modules[module] = state.modules[module].filter((f)=>f.fieldId !== fieldId)
    },
    setActiveModule: (state, action) => {
      state.activeModule = action.payload
    },
    setFormMeta: (state, action) => {
      const { jobId, title, description } = action.payload
      if (jobId !== undefined) state.jobId = jobId;
      if (title !== undefined) state.title = title;
      if (description !== undefined) state.description = description;
    },
    setAllModules: (state, action) => {
        state.modules = action.payload;
    },
    resetForm:()=>initialState,
  }
})

export const {addField,updateField,deleteField,setActiveModule,setFormMeta,setAllModules,resetForm } = formSlice.actions;
export default formSlice.reducer