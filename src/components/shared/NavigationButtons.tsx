import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { Button } from "../ui/button";

const NavigationButtons = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isAtRoot = location.pathname === "/";

  const handleGoBack = () => {
    navigate(-1);
  };
  if (isAtRoot) return null;
  return (
    <div className="flex gap-4 mt-4">
      <Button
        onClick={handleGoBack}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <FaArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </Button>
    </div>
  );
};

export default NavigationButtons;
