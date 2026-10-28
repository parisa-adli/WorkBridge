import { useTranslation } from "react-i18next";
import type { FormEventHandler } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import Textfield from "../../ui/Textfield";
import Loading from "../../ui/Loading";
import type { SendOtpValues } from "../../schemas/auth";

type SendOTPFormProps = {
  onSubmit: FormEventHandler<HTMLFormElement>;
  isSendingOtp: boolean;
  register: UseFormRegister<SendOtpValues>;
  errors: FieldErrors<SendOtpValues>;
};

function SendOTPForm({ onSubmit, isSendingOtp, register, errors }: SendOTPFormProps) {
  const { t } = useTranslation();
  return (
    <div>
      <form className="space-y-8" onSubmit={onSubmit}>
        <Textfield
          label={t("auth.phoneNumber")}
          name="phoneNumber"
          register={register}
          errors={errors}
        />
        {isSendingOtp ? (
          <Loading />
        ) : (
          <button type="submit" className="btn btn--primary w-full">
            {t("auth.sendOtp")}
          </button>
        )}
      </form>
    </div>
  );
}

export default SendOTPForm;
