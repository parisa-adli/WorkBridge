import { HiArrowRight } from "react-icons/hi";
import useMoveBack from "../hooks/useMoveBack";

function NotFound() {
  const moveBack = useMoveBack();

  return (
    <div className="h-screen bg-secondary-0 p-10">
      <div className="container xl:max-w-screen-xl">
        <div className="sm:max-w-sm flex justify-center">
          <div>
            <h1 className="text-xl font-bold text-secondary-700 mb-8">
              صفحه ای که دنبالش بودید، پیدا نشد
            </h1>
            <button
              onClick={moveBack}
              className="flex items-center gap-x-2 bg-primary-600 py-2 px-4 rounded-lg mb-4 text-secondary-50 "
            >
              <HiArrowRight className="w-6 h-6 text-secondary-50" />
              برگشت
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default NotFound;
