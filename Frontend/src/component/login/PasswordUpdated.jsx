import React from "react";
import emailsent from "../../assets/login/emailsent.png";
import { useNavigate } from "react-router-dom";

const PasswordUpdated = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-between px-4 py-8 text-center">
      <div className="flex justify-center mb-6">
        <img
          src={emailsent}
          alt="Password Reset Email Sent"
          className="w-[120px] h-[70px] md:w-[150px] md:h-[80px]"
        />
      </div>
      <h2 className="text-base md:text-lg font-medium">
        Your password has been reset.
      </h2>
      <h2 className="text-base md:text-lg font-medium">
        You may now log in with your new Password.
      </h2>
      <div>
        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-blue text-white px-8 md:px-12 py-1 rounded-lg shadow hover:shadow-xl hover:cursor-pointer transition"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default PasswordUpdated;
