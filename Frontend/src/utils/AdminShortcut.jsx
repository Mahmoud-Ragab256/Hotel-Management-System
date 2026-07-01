import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAdminShortcut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const keys = new Set();

    const handleKeyDown = (e) => {
      keys.add(e.key);
      if (keys.has("Control") && keys.has("Shift") && keys.has("Z")) {
        navigate("/dashboard");
      }
    };

    const handleKeyUp = (e) => {
      keys.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [navigate]);
};

export default useAdminShortcut;