import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { ChangeEvent } from "react";
import type { AxiosError } from "axios";
import Textfield from "../../ui/Textfield";
import RadioInputGroup from "../../ui/RadioInputGroup";
import Loading from "../../ui/Loading";
import { loginApi } from "../../services/authService";
import { DEMO_USERS, ROLES } from "../../constants";
import { loginSchema, type LoginValues } from "../../schemas/auth";
import type { ApiErrorResponse } from "../../types/api";
import redirectByRole from "../../utils/redirectByRole";

function EmailLoginForm() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: ROLES.OWNER, ...DEMO_USERS[ROLES.OWNER] },
  });

  const { isPending, mutateAsync } = useMutation({ mutationFn: loginApi });

  const onSubmit = async ({ email, password }: LoginValues) => {
    try {
      const { user, message } = await mutateAsync({ email, password });
      toast.success(message);
      redirectByRole(navigate, user.role);
    } catch (error) {
      toast.error((error as AxiosError<ApiErrorResponse>)?.response?.data?.message ?? null);
    }
  };

  // picking a role swaps in that role's demo account
  const fillDemoUser = (e: ChangeEvent<HTMLInputElement>) => {
    const { email, password } = DEMO_USERS[e.target.value as LoginValues["role"]];
    setValue("email", email);
    setValue("password", password);
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      <RadioInputGroup
        errors={errors}
        register={register}
        watch={watch}
        configs={{
          name: "role",
          validationSchema: { onChange: fillDemoUser },
          options: [
            { value: ROLES.OWNER, label: t("roles.owner") },
            { value: ROLES.FREELANCER, label: t("roles.freelancer") },
          ],
        }}
      />
      <Textfield label={t("auth.email")} name="email" type="email" register={register} required errors={errors} />
      <Textfield
        label={t("auth.password")}
        name="password"
        type="password"
        register={register}
        required
        errors={errors}
      />
      {isPending ? (
        <Loading />
      ) : (
        <button type="submit" className="btn btn--primary w-full">
          {t("auth.login")}
        </button>
      )}
    </form>
  );
}

export default EmailLoginForm;
