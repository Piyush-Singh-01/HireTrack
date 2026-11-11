import React, { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import FilterResults from "../../component/schedule/FilterResults";

/**
 * FilterResultsPage Controller
 * Route: /schedule/filters
 * Displays filtered interviews by date range and position/status filters.
 */
const FilterResultsPage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const position = searchParams.get("position") || location.state?.position;
  const status = searchParams.get("status") || location.state?.status;
  const from = searchParams.get("from") || location.state?.from;
  const to = searchParams.get("to") || location.state?.to;

  useEffect(() => {
    document.title = "Filtered Schedule Results | Talent OS";
  }, []);

  const handleBack = () => {
    navigate("/schedule");
  };

  return (
    <FilterResults
      position={position}
      status={status}
      from={from}
      to={to}
      onBack={handleBack}
      {...props}
    />
  );
};

export default FilterResultsPage;
