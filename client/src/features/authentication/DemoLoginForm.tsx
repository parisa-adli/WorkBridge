import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import Input from "../../ui/Input";
import RadioInputGroup from "../../ui/RadioInputGroup";
import Loading from "../../ui/Loading";
import Button from "../../ui/Button";
import { demoLoginApi } from "../../services/authService";
import { DEMO_USERS } from "../../constants";
import { demoLoginSchema, type DemoLoginValues } from "../../schemas/auth";
import type { ApiErrorResponse } from "../../types/api";
import redirectByRole from "../../utils/redirectByRole";

type Role = DemoLoginValues["role"];

// Email + password; `roles` are the demo accounts it offers to pre-fill (the role picker shows when there are several).
function DemoLoginForm({ roles }: { roles: Role[] }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DemoLoginValues>({
    resolver: zodResolver(demoLoginSchema),
    defaultValues: { role: roles[0], ...DEMO_USERS[roles[0]] },
  });

  const { isPending, mutateAsync } = useMutation({ mutationFn: demoLoginApi });

  const onSubmit = async ({ email, password }: DemoLoginValues) => {
    try {
      const { user, message } = await mutateAsync({ email, password });
      toast.success(message);
      redirectByRole(navigate, user.role);
    } catch (error) {
      toast.error((error as AxiosError<ApiErrorResponse>)?.response?.data?.message ?? null);
    }
  };

  // picking a role swaps in that role's demo account
  const fillDemoUser = (role: string) => {
    const { email, password } = DEMO_USERS[role as Role];
    setValue("email", email);
    setValue("password", password);
  };

  const shown = DEMO_USERS[useWatch({ control, name: "role" })];

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      {roles.length > 1 && (
        <RadioInputGroup
          label={t("user.role")}
          control={control}
          name="role"
          onValueChange={fillDemoUser}
          options={roles.map((role) => ({ value: role, label: t(`roles.${role.toLowerCase()}`) }))}
        />
      )}
      <Input label={t("auth.email")} type="email" dir="ltr" required error={errors.email?.message} {...register("email")} />
      <Input label={t("auth.password")} type="password" required error={errors.password?.message} {...register("password")} />
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <dt>{t("auth.email")}</dt>
        <dd className="font-mono"><bdi>{shown.email}</bdi></dd>
        <dt>{t("auth.password")}</dt>
        <dd className="font-mono"><bdi>{shown.password}</bdi></dd>
      </dl>
      {isPending ? (
        <Loading />
      ) : (
        <Button type="submit" className="w-full">
          {t("auth.login")}
        </Button>
      )}
    </form>
  );
}

export default DemoLoginForm;
