import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import OTPInput from "react-otp-input";
import { checkOtp } from "../../services/authService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";
import { FiEdit } from "react-icons/fi";
import Loading from "../../ui/Loading";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LIMITS, STATUS } from "../../constants";
import { checkOtpSchema, type CheckOtpValues } from "../../schemas/auth";
import type { AxiosError } from "axios";
import type { ApiErrorResponse, MessageData } from "../../types/api";
import redirectByRole from "../../utils/redirectByRole";

const RESEND_TIME = 90;

type CheckOTPFormProps = {
  phoneNumber: string;
  onBack: () => void;
  onResendOtp: () => void;
  otpResponse?: MessageData;
};

function CheckOTPForm({ phoneNumber, onBack, onResendOtp, otpResponse }: CheckOTPFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckOtpValues>({ resolver: zodResolver(checkOtpSchema), defaultValues: { otp: "" } });
  const [time, setTime] = useState(RESEND_TIME);
  const navigate = useNavigate();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: checkOtp,
  });

  const checkOtpHandler = async ({ otp }: CheckOtpValues) => {
    try {
      const { user, message } = await mutateAsync({ phoneNumber, otp });
      toast.success(message);
      if (!user.isActive) return navigate("/complete-profile");
      if (+user.status !== STATUS.ACCEPTED) {
        navigate("/");
        toast("پروفایل شما در انتظار تایید است", { icon: "💫" });
        return;
      }
      redirectByRole(navigate, user.role);
    } catch (error) {
      toast.error((error as AxiosError<ApiErrorResponse>)?.response?.data?.message ?? null);
    }
  };

  useEffect(() => {
    const timer = time > 0 && setInterval(() => setTime((t) => t - 1), 1000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [time]);

  return (
    <div>
      <button onClick={onBack} className="bg-primary-600 p-1 rounded-lg mb-4">
        <HiArrowRight className="w-6 h-6 text-secondary-50" />
      </button>
      {otpResponse && (
        <p className="flex justify-center items-center gap-x-2 my-4 text-secondary-700">
          <span> {otpResponse?.message}</span>
          <button onClick={onBack}>
            <FiEdit className="w-6 h-6 text-primary-700" />
          </button>
        </p>
      )}
      <div className="mb-6 flex justify-center text-secondary-500">
        {time > 0 ? (
          <p>{time} ثانیه تا ارسال مجدد کد</p>
        ) : (
          <button onClick={onResendOtp} className="text-primary-900">
            ارسال مجدد کد تایید
          </button>
        )}
      </div>
      <form className="space-y-10" onSubmit={handleSubmit(checkOtpHandler)}>
        <p className="font-bold text-secondary-800">کد تایید را وارد کنید</p>
        <div>
          <Controller
            name="otp"
            control={control}
            render={({ field: { value, onChange } }) => (
              <OTPInput
                value={value}
                onChange={onChange}
                numInputs={LIMITS.OTP_MAX}
                renderSeparator={<span className="text-secondary-900">-</span>}
                renderInput={(props) => <input {...props} />}
                containerStyle="flex flex-row-reverse gap-x-2 justify-center"
                inputStyle={{
                  width: "2.5rem",
                  padding: "0.5rem 0.2rem",
                  border: "1px solid rgb(var(--color-primary-300))",
                  borderRadius: "0.5rem",
                }}
              />
            )}
          />
          {errors.otp && (
            <span className="text-error block text-sm mt-2">{errors.otp.message}</span>
          )}
        </div>
        {isPending ? (
          <Loading />
        ) : (
          <button className="btn btn--primary w-full">تایید</button>
        )}
      </form>
    </div>
  );
}

export default CheckOTPForm;
