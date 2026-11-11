import { createSlice } from "@reduxjs/toolkit";

const JobPostSlice = createSlice({
  name: "jobPost",
  initialState: {
    post: [],
    status: "loading",
    isNewTemplate: true,
    template: "",
  },
  reducers: {
    setPost: (state, action) => {
      state.post = action.payload;
    },

    setIsNewTemplate: (state, action) => {
      state.isNewTemplate = action.payload;
    },

    setTemplate: (state, action) => {
      state.template = action.payload;
    },
    createPost: (state, action) => {
      state.post.push(action.payload);
    },
    updatePost: (state, action) => {
      const { jobId, updatedData } = action.payload;
      state.post = state.post.map((job) =>
        job._id === jobId ? { ...job, ...updatedData } : job
      );
    },
  },
});

export const { setPost, setIsNewTemplate, setTemplate, createPost, updatePost } = JobPostSlice.actions;
export default JobPostSlice.reducer;
