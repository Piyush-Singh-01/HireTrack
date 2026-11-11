import { createSlice } from "@reduxjs/toolkit";

const ScreeningQuestionSlice = createSlice({
  name: "screeningQuestion",
  initialState: {
    questions: [],   
  },
  reducers: {
    setQuestions: (state, action) => {
      state.questions = action.payload;
      state.status = "succeeded";
    },   
  },
});

export const {
  setQuestions,
  
} = ScreeningQuestionSlice.actions;

export default ScreeningQuestionSlice.reducer;
