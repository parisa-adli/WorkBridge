import { useEffect, useState } from "react";

export default function useShowSidebar() {
  const [isShowSidebar, setIsShowSidebar] = useState(false);
  const toggleSidebar = () => setIsShowSidebar(!isShowSidebar);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleResize = (e) => {
      if (e.matches) {
        setIsShowSidebar(true);
      } else {
        setIsShowSidebar(false);
      }
    };
    handleResize(mediaQuery);
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  return { isShowSidebar, toggleSidebar };
}
