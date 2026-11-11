import { useCallback } from "react";
import InputWithLabel from "./InputWithLable";
import { CiCirclePlus } from "react-icons/ci";
import DropdownWithLabel from "./DropdownWithLabel";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";

const Questions = ({ applicationDetails, setApplicationDetails }) => {
  const navigate = useNavigate();

  const handleChangeQuestion = useCallback(
    (field, value) => {
      setApplicationDetails((prev) => ({
        ...prev,
        Questions: {
          ...prev.Questions,
          [field]: value,
        },
      }));
    },
    [setApplicationDetails]
  );

  const handleAddQuestions = () => {
    
  }

  return (
    <div className="sm:ml-2 space-y-2 md:ml-5">
      <h3 className="text-[#324371] font-bold text-[14px] sm:text-[22px] lg:text-[28px]  mb-5">
        Screening Questions
      </h3>

        <InputWithLabel
          label="Screening Questions"
          value={applicationDetails.Questions.questions}
          onChange={(value) => handleChangeQuestion("questions", value)}
          placeholder="e.g. What is your experience with React and Redux?"
        />
        <button onClick={handleAddQuestions} className=" flex items-center gap-1 text-xs md:text-base border px-1 rounded-md text-[#324371] border-[#324371]  cursor-pointer">
          <CiCirclePlus /> Add Questions
        </button>

        <DropdownWithLabel
          label=" No Of Rounds"
          value={applicationDetails.description.rounds}
          onChange={(value) => handleChangeQuestion("rounds", value)}
        />
        {/* round 1 */}
        <DropdownWithLabel
          label=" Round 1"
          value={applicationDetails.Questions.round1}
          onChange={(value) => handleChangeQuestion("round1", value)}
        />

        <button className=" flex items-center gap-1 text-xs md:text-base border px-1 rounded-md text-[#324371] border-[#324371]  cursor-pointer">
          <RxCross2 /> Aptitude Questions
        </button>

        {/* round 2 */}

        <DropdownWithLabel
          label="Round 2"
          value={applicationDetails.Questions.round2}
          onChange={(value) => handleChangeQuestion("round2", value)}
        />
        <button
          onClick={() => {
            navigate("/createtask");
          }}
          className=" flex items-center gap-1 border text-xs md:text-base px-1 rounded-md text-[#324371] border-[#324371]  cursor-pointer"
        >
          <CiCirclePlus /> Add Task
        </button>
     
    </div>
  );
};
export default Questions;
