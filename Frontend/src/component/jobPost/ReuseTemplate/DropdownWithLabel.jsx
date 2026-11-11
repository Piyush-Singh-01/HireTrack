import { useCallback } from "react";

const DropdownWithLabel = ({ label, value, onChange }) => {
  const handleChangeValue = useCallback(
    (event) => {
      onChange(event.target.value);
    },
    [onChange]
  );
  return (
    <div className="">
      <div className=" my-2">
        <div className="my-2">
          <label className="text-blue text-xs md:text-base lg:font-semibold ">
            {label}
          </label>
        </div>
        <div>
          <select
            name=""
            id=""
            type="text"
            value={value}
            onChange={handleChangeValue}
            className=" bg-gray-100 md:w-1/3 text-xs md:text-base w-full rounded-lg focus:outline-none px-2  py-2  "
          >
            <option value="" className="w-[20px]">
              select
            </option>
            <option value="Aptitude" className="w-[20px]">
              Aptitude
            </option>
            <option value="Technical" className="w-[20px]">
              Technical
            </option>
            <option value="Non_Technical" className="w-[20px]">
              Non_Technical
            </option>
            <option value="Interview" className="w-[20px]">
              {" "}
              Interview
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};
export default DropdownWithLabel;
