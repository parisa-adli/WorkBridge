import { useEffect, useState } from "react";
import SendOTPForm from "./SendOTPForm";
import EmailLoginForm from "./EmailLoginForm";
import CheckOTPForm from "./CheckOTPForm";
import toast from "react-hot-toast";
import { getOtp } from "../../services/authService";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import useUser from "./useUser";
import { useNavigate } from "react-router-dom";

function AuthContainer() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("email");
  const [step, setStep] = useState(1);
  const { handleSubmit, register, getValues } = useForm();
  const { user } = useUser();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const {
    isPending: isSendingOtp,
    data: otpResponse,
    mutateAsync,
  } = useMutation({
    mutationFn: getOtp,
  });

  const sendOtpHandler = async (data) => {
    try {
      const { message, code } = await mutateAsync(data);
      setStep(2);
      // the server returns the code only outside production, where no SMS is sent
      toast.success(code ? `${message} - کد تایید: ${code}` : message);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <SendOTPForm
            isSendingOtp={isSendingOtp}
            onSubmit={handleSubmit(sendOtpHandler)}
            //onSubmit={sendOtpHandler}
            setStep={setStep}
            register={register}
            // phoneNumber={phoneNumber}
            // onChange={(e) => setPhoneNumber(e.target.value)}
          />
        );
      case 2:
        return (
          <CheckOTPForm
            onResendOtp={sendOtpHandler}
            phoneNumber={getValues("phoneNumber")}
            // phoneNumber={phoneNumber}
            onBack={() => setStep((s) => s - 1)}
            otpResponse={otpResponse}
          />
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: "email", label: "ورود با ایمیل" },
    { id: "phone", label: "ورود با موبایل" },
  ];

  return (
    <div className="w-full sm:max-w-sm">
      <div role="tablist" className="flex gap-x-2 mb-8 border-b border-secondary-200">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2 -mb-px border-b-2 ${
              tab === id
                ? "border-primary-900 text-primary-900 font-bold"
                : "border-transparent text-secondary-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "email" ? <EmailLoginForm /> : renderStep()}
    </div>
  );
}

export default AuthContainer;
