import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SendOTPForm from "./SendOTPForm";
import DemoLoginForm from "./DemoLoginForm";
import CheckOTPForm from "./CheckOTPForm";
import { toast } from "sonner";
import { getOtp } from "../../services/authService";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendOtpSchema, type SendOtpValues } from "../../schemas/auth";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../types/api";
import useUser from "./useUser";
import { useNavigate } from "react-router-dom";

function AuthContainer() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors },
  } = useForm<SendOtpValues>({ resolver: zodResolver(sendOtpSchema) });
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

  const sendOtpHandler = async (data: SendOtpValues) => {
    try {
      const { message, otp } = await mutateAsync(data);
      setStep(2);
      // the server returns the code only outside production, where no SMS is sent
      toast.success(otp ? t("auth.otpSentWithCode", { message, otp }) : message);
    } catch (error) {
      toast.error((error as AxiosError<ApiErrorResponse>)?.response?.data?.message ?? null);
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
            register={register}
            errors={errors}
            // phoneNumber={phoneNumber}
            // onChange={(e) => setPhoneNumber(e.target.value)}
          />
        );
      case 2:
        return (
          <CheckOTPForm
            onResendOtp={() => sendOtpHandler(getValues())}
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

  return (
    <Tabs defaultValue="demo" className="w-full sm:max-w-sm gap-8">
      <TabsList className="w-full">
        <TabsTrigger value="demo">{t("auth.demoTab")}</TabsTrigger>
        <TabsTrigger value="phone">{t("auth.phoneTab")}</TabsTrigger>
      </TabsList>
      <TabsContent value="demo">
        <DemoLoginForm />
      </TabsContent>
      <TabsContent value="phone">{renderStep()}</TabsContent>
    </Tabs>
  );
}

export default AuthContainer;
