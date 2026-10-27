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
  return (
    <div>
      <form className="space-y-8" onSubmit={onSubmit}>
        <Textfield
          label="شماره موبایل"
          name="phoneNumber"
          register={register}
          errors={errors}
        />
        {isSendingOtp ? (
          <Loading />
        ) : (
          <button type="submit" className="btn btn--primary w-full">
            ارسال کد تایید
          </button>
        )}
      </form>
    </div>
  );
}

export default SendOTPForm;
