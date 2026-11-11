import { useDispatch } from "react-redux";
import { setQuestions} from "../store/slice/ScreeningQuestionSlice";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/AxiosInstance";

export const ScreeningQuestion = (enabled) =>{
const dispatch = useDispatch(); 
const screenQuestion = useQuery({
  queryKey: ["screenQuestions"],
  enabled,
  queryFn: async () => {
        const res = await axiosInstance.get("/api/screenings/displayQuestion");
    return res.data;
  },
  onSuccess: (data) => {
    dispatch(setQuestions(data));
  },
  onError: (err) => {
   console.log(err,"error")
  },
});
return {
    ...screenQuestion
  };
}