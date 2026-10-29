import { useTranslation } from "react-i18next";
import Input from "../../ui/Input";
import { useMutation } from "@tanstack/react-query";
import { completeProfile } from "../../services/authService";
import Loading from "../../ui/Loading";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { completeProfileSchema, type CompleteProfileValues } from "../../schemas/auth";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../types/api";
import RadioInputGroup from "../../ui/RadioInputGroup";
import { ROLES, STATUS } from "../../constants";
import redirectByRole from "../../utils/redirectByRole";

function CompleteProfileForm() {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<CompleteProfileValues>({ resolver: zodResolver(completeProfileSchema) });
  // const [name, setName] = useState("");
  // const [email, setEmail] = useState("");
  // const [role, setRole] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: completeProfile,
  });

  const onSubmit = async (data: CompleteProfileValues) => {
    try {
      const { user, message } = await mutateAsync(data);
      toast.success(message);

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

  return (
    <div className="flex justify-center pt-10">
      <div className="w-full sm:max-w-sm">
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <Input label={t("auth.fullName")} required error={errors.name?.message} {...register("name")} />
          <Input label={t("auth.email")} required error={errors.email?.message} {...register("email")} />
          <RadioInputGroup
            label={t("user.role")}
            control={control}
            name="role"
            options={[
              { value: ROLES.OWNER, label: t("roles.owner") },
              { value: ROLES.FREELANCER, label: t("roles.freelancer") },
            ]}
          />
          {isPending ? (
            <Loading />
          ) : (
            <button className="btn btn--primary w-full">{t("common.confirm")}</button>
          )}
        </form>
      </div>
    </div>
  );
}
export default CompleteProfileForm;
