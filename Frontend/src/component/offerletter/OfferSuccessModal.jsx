import React from "react";
import { X } from "lucide-react";
import successImg from "../../assets/offerletterimg/mailsentrafiki.png";

const OfferSuccessModal = ({
  isOpen = false,
  onClose,
  onAction,
  actionLabel = "Go back to Hired Candidates",
  title = "Offer Letter Sent Successfully",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white w-[90vw] md:w-[45vw] h-auto p-[4vh] rounded-3xl shadow-2xl flex flex-col items-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-[2vh] right-[2vw] p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-[3vh] h-[3vh] text-gray-500" />
        </button>

        <h2 className="text-[2.5vh] md:text-[3.5vh] font-bold text-black text-center mt-[2vh] mb-[3vh]">
          {title}
        </h2>

        <img
          src={successImg}
          alt="Mail Sent"
          className="w-[30vw] md:w-[15vw] h-auto object-contain mb-[4vh]"
        />

        <button
          type="button"
          onClick={onAction}
          className="bg-[#3b4c6b] text-white text-[1.8vh] font-semibold px-[4vw] py-[1.5vh] rounded-xl hover:bg-[#2d3a52] transition-colors shadow-md cursor-pointer"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default OfferSuccessModal;
