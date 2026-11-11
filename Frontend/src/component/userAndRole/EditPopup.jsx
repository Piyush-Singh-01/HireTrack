import React, { useEffect, useState, useRef } from "react";
import popupCancel from "../../assets/userAndRole/popupCancel.png";
import { useUpdateUser } from "../../hooks/useUserAndRole";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";

function EditPopup({ isOpen, onClose, selectedUserId, getusers }) {
  const queryClient = useQueryClient();

  const updateItemuser = useUpdateUser();
  const user = getusers?.find((s) => s._id === selectedUserId);
  const uniquePositions = [...new Set((getusers || []).map(u => u.Position).filter(Boolean))];

  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
  const positionDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (positionDropdownRef.current && !positionDropdownRef.current.contains(event.target)) {
        setIsPositionDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.Name || "");
      setDepartment(user.Role || "");
      setPosition(user.Position || "");
      setNumber(user.ContactNumber || "");
      setEmail(user.Email || "");
      setPassword(""); // Don't pre-fill hashed password
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    updateItemuser.mutate(
      {
        _id: selectedUserId,
        Name: name,
        Role: department,
        Position: position,
        ContactNumber: number,
        Email: email,
        password: password, // Send lowercase 'password'
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="h-130
          relative w-full
          max-w-80
          sm:max-w-80
          md:max-w-80
          lg:max-w-90
          bg-white rounded-2xl
          p-5 sm:p-6 md:p-7
        "
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#617589] hover:text-black cursor-pointer"
        >
          <img src={popupCancel} alt="" className="w-3" />
        </button>

        {/* Form */}
        <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              placeholder="Peter"
              className="
                w-full rounded-lg border border-[#DBE0E6]
                px-3 py-2 text-[12px]
                focus:outline-none 
              "
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Position */}
          <div className="mb-3 relative" ref={positionDropdownRef}>
            <label className="block text-sm font-medium mb-1">Position</label>
            <div className="relative">
              <input
                type="text"
                placeholder="UI/UX"
                autoComplete="off"
                className="
                  w-full rounded-lg border border-[#DBE0E6]
                  px-3 py-2 text-[12px]
                  focus:outline-none 
                "
                value={position}
                onChange={(e) => {
                  setPosition(e.target.value);
                  setIsPositionDropdownOpen(true);
                }}
                onFocus={() => setIsPositionDropdownOpen(true)}
              />
              <div 
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            {isPositionDropdownOpen && uniquePositions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {uniquePositions
                  .filter(pos => pos.toLowerCase().includes(position.toLowerCase()))
                  .map(pos => (
                  <div 
                    key={pos} 
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setPosition(pos);
                      setIsPositionDropdownOpen(false);
                    }}
                  >
                    {pos}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              className="
                w-full rounded-lg border border-[#DBE0E6]
                px-3 py-2 text-[12px]
                focus:outline-none text-[#617589]
              "
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {/* <option>HR</option> */}
              <option>Admin</option>
              <option>Interviewer</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Number</label>
            <input
              type="tel"
              placeholder="Number"
              name="ContactNumber"
              className="
                w-full rounded-lg border border-[#DBE0E6]
                px-3 py-2 text-[12px]
                focus:outline-none 
              "
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              maxLength={10} // optional
              inputMode="numeric"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Email"
              name="Email"
              className="
                w-full rounded-lg border border-[#DBE0E6]
                px-3 py-2 text-[12px]
                focus:outline-none 
              "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="******"
                name="password"
                className="
                  w-full rounded-lg border border-[#DBE0E6]
                  px-3 py-2 text-[12px]
                  focus:outline-none 
                "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2 mt-2">
            <button
              type="submit"
              className="
                bg-blue text-white
                text-sm px-5 py-2
                rounded-md hover:bg-[#16204A]
              "
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPopup;
