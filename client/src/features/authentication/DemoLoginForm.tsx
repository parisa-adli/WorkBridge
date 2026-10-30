import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import Input from "../../ui/Input";
import RadioInputGroup from "../../ui/RadioInputGroup";
import Loading from "../../ui/Loading";
import { demoLoginApi } from "../../services/authService";
import { DEMO_USERS, ROLES } from "../../constants";
import { demoLoginSchema, type DemoLoginValues } from "../../schemas/auth";
import type { ApiErrorResponse } from "../../types/api";
import redirectByRole from "../../utils/redirectByRole";

function DemoLoginForm() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DemoLoginValues>({
    resolver: zodResolver(demoLoginSchema),
    defaultValues: { role: ROLES.OWNER, ...DEMO_USERS[ROLES.OWNER] },
  });

  const { isPending, mutateAsync } = useMutation({ mutationFn: demoLoginApi });

  const onSubmit = async ({ username, password }: DemoLoginValues) => {
    try {
      const { user, message } = await mutateAsync({ username, password });
      toast.success(message);
      redirectByRole(navigate, user.role);
    } catch (error) {
      toast.error((error as AxiosError<ApiErrorResponse>)?.response?.data?.message ?? null);
    }
  };

  // picking a role swaps in that role's demo account
  const fillDemoUser = (role: string) => {
    const { username, password } = DEMO_USERS[role as DemoLoginValues["role"]];
    setValue("username", username);
    setValue("password", password);
  };

  const shown = DEMO_USERS[watch("role")];

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      <RadioInputGroup
        label={t("user.role")}
        control={control}
        name="role"
        onValueChange={fillDemoUser}
        options={[
          { value: ROLES.OWNER, label: t("roles.owner") },
          { value: ROLES.FREELANCER, label: t("roles.freelancer") },
          { value: ROLES.ADMIN, label: t("roles.admin") },
        ]}
      />
      <Input label={t("auth.username")} required error={errors.username?.message} {...register("username")} />
      <Input label={t("auth.password")} type="password" required error={errors.password?.message} {...register("password")} />
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-text-muted">
        <dt>{t("auth.username")}</dt>
        <dd className="font-mono"><bdi>{shown.username}</bdi></dd>
        <dt>{t("auth.password")}</dt>
        <dd className="font-mono"><bdi>{shown.password}</bdi></dd>
      </dl>
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

export default DemoLoginForm;
