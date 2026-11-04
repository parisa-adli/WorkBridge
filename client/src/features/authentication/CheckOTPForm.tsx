import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { checkOtp } from "../../services/authService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowRight, SquarePen } from "lucide-react";
import Loading from "../../ui/Loading";
import Button from "../../ui/Button";
import Field from "../../ui/Field";
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
  const { t } = useTranslation();

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
        toast(t("auth.profilePending"), { icon: "💫" });
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
      <Button variant="outline" size="icon" onClick={onBack} aria-label={t("common.back")} className="mb-4">
        <ArrowRight className="ltr:-scale-x-100" />
      </Button>
      {otpResponse && (
        <p className="flex justify-center items-center gap-x-2 my-4 text-muted-foreground">
          <span> {otpResponse?.message}</span>
          <Button variant="ghost" size="icon" onClick={onBack} aria-label={t("auth.editPhone")}>
            <SquarePen />
          </Button>
        </p>
      )}
      <div className="mb-6 flex justify-center text-sm text-muted-foreground">
        {time > 0 ? (
          <p>{t("auth.resendIn", { time })}</p>
        ) : (
          <Button variant="link" onClick={onResendOtp}>
            {t("auth.resend")}
          </Button>
        )}
      </div>
      <form className="space-y-10" onSubmit={handleSubmit(checkOtpHandler)}>
        <Field label={t("auth.enterOtp")} error={errors.otp?.message}>
          {(ids) => (
            <Controller
              name="otp"
              control={control}
              render={({ field: { value, onChange } }) => (
                // the code reads left to right in both languages
                <div dir="ltr" className="flex justify-center">
                  <InputOTP maxLength={LIMITS.OTP_MAX} value={value} onChange={onChange} {...ids}>
                    <InputOTPGroup>
                      {Array.from({ length: LIMITS.OTP_MAX }, (_, i) => (
                        <InputOTPSlot key={i} index={i} aria-invalid={ids["aria-invalid"]} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              )}
            />
          )}
        </Field>
        {isPending ? (
          <Loading />
        ) : (
          <Button type="submit" className="w-full">
            {t("common.confirm")}
          </Button>
        )}
      </form>
    </div>
  );
}

export default CheckOTPForm;
