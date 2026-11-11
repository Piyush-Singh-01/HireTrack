import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaCalendarAlt, FaClock, FaRegBell } from "react-icons/fa";
import image from "../../assets/userAndRole/resImg.png";
import { useRescheduleInterview } from "../../hooks/userAndRole/useRechedule";

const ReschedulePopup = ({ isOpen, interview, onClose }) => {
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("01");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");
  const [duration, setDuration] = useState(30);
  const [sendNotification, setSendNotification] = useState(false);

  const { mutate: rescheduleInterview } = useRescheduleInterview();
  const { username } = useSelector((state) => state.auth);

  const parseTimeSegments = (value) => {
    if (!value) return { h: "01", m: "00", p: "AM" };
    const ampmMatch = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (ampmMatch) {
      return { h: ampmMatch[1].padStart(2, "0"), m: ampmMatch[2], p: ampmMatch[3].toUpperCase() };
    }
    const parts = value.split(":");
    if (parts.length >= 2) {
      let h24 = parseInt(parts[0], 10);
      const m = parts[1].slice(0, 2);
      const p = h24 >= 12 ? "PM" : "AM";
      let h12 = h24 % 12;
      h12 = h12 === 0 ? 12 : h12;
      return { h: String(h12).padStart(2, "0"), m, p };
    }
    return { h: "01", m: "00", p: "AM" };
  };

  useEffect(() => {
    if (interview && isOpen) {
      setDate(interview.date || "");
      const { h, m, p } = parseTimeSegments(interview.time);
      setHour(h);
      setMinute(m);
      setPeriod(p);
      setDuration(30);
      setSendNotification(false);
    }
  }, [interview, isOpen]);

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutesList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  if (!isOpen || !interview) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!date) {
      alert("Please select date");
      return;
    }
    const combinedTime = `${hour}:${minute} ${period}`;

    rescheduleInterview({
      jobId: interview.jobId,
      payload: {
        scheduleId: interview.scheduleId,
        candidateDetailsId: interview.candidateDetailsId,
        candidateId: interview.candidateId,
        applicant: interview.name,
        newDate: date,
        newTime: combinedTime,
        durationMinutes: Number(duration),
        sendNotification,
        reason: "Interview rescheduled",
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">

      {/* POPUP CARD */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col rounded-2xl shadow-lg w-full max-w-5xl bg-white p-4 sm:p-6 md:p-8 relative"
      >
        <div className="flex flex-col md:flex-row flex-1">

          {/* LEFT SIDE (Same as Reschedule.jsx) */}
          <div className="flex-1 md:pr-6 lg:pr-10">
            <h2 className="font-bold text-lg sm:text-xl mb-2">Rescheduling</h2>

            <div className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-900">
              <div className="mb-2">
                <div>
                  <span className="font-bold">Candidate:</span>{" "}
                  {interview?.name || "-"}
                </div>
                <div>
                  <span className="font-bold">Position:</span>{" "}
                  {interview?.position || "-"}
                </div>
                <div>
                  <span className="font-bold">Recruiter Name:</span>{" "}
                  {interview?.recruiter && interview.recruiter !== "Unknown" ? interview.recruiter : (username || "HR")}
                </div>
              </div>
            </div>

            <div className="font-semibold mb-2">Date & Time</div>

            {/* DATE */}
            <div className="flex flex-col gap-3 mb-4 w-full max-w-md">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue">
                  <FaCalendarAlt />
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-xl bg-gray-100 border border-gray-200 
                  focus:outline-none focus:ring-2 focus:ring-blue text-gray-700 font-medium"
                />
              </div>

              {/* TIME */}
              <div className="flex items-center border border-gray-100 rounded-xl px-2 py-2 sm:py-3 bg-gray-100 border border-gray-200">
                <FaClock className="text-blue ml-2" />
                <div className="flex items-center gap-1 w-full justify-center">
                  <select
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    className="bg-transparent outline-none font-medium text-xs sm:text-sm px-1 cursor-pointer"
                  >
                    {hours.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <span>:</span>
                  <select
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    className="bg-transparent outline-none font-medium text-xs sm:text-sm px-1 cursor-pointer"
                  >
                    {minutesList.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="bg-transparent outline-none font-medium text-xs sm:text-sm px-1 cursor-pointer"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* DURATION */}
            <div className="flex flex-wrap md:flex-nowrap items-center mb-4 gap-2">
              <span className="flex items-center justify-center h-10 sm:h-12 w-10 sm:w-12 rounded-xl 
                bg-gray-100 border border-gray-200 text-blue">
                <FaRegBell />
              </span>

              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="flex-1 md:flex-none w-20 h-10 sm:h-12 text-center rounded-xl bg-gray-100 
                border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue font-medium"
              />

              <span className="flex items-center justify-center h-10 sm:h-12 px-3 sm:px-4 rounded-xl 
                bg-gray-100 border border-gray-200 font-medium text-sm sm:text-base">
                Minutes
              </span>
            </div>

            {/* NOTIFICATION */}
            <div className="flex items-center mb-6 font-bold text-sm sm:text-base">
              <input
                type="checkbox"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
                className="mr-2"
              />
              <span>
                <span className="font-bold">Send</span> Notification
              </span>
            </div>
          </div>

          {/* RIGHT IMAGE (Same as Reschedule.jsx) */}
          <div className="flex items-center justify-center">
            <img
              src={image}
              alt="Calendar"
              className="w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] max-[550px]:hidden object-contain"
            />
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-center md:justify-end gap-3 sm:gap-4 sm:mt-6">
          <button
            type="submit"
            className="bg-blue text-white rounded-lg px-5 sm:px-8 py-2 text-sm sm:text-base 
            font-medium hover:bg-blue transition-colors w-full sm:w-auto"
          >
            Save
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-white text-blue border border-blue rounded-lg px-5 sm:px-8 py-2 
            text-sm sm:text-base font-medium hover:bg-gray-100 transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReschedulePopup;
