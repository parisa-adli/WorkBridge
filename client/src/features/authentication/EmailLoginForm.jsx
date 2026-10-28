import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Textfield from "../../ui/Textfield";
import RadioInputGroup from "../../ui/RadioInputGroup";
import Loading from "../../ui/Loading";
import { loginApi } from "../../services/authService";
import { DEMO_USERS, ROLES } from "../../constants";
import redirectByRole from "../../utils/redirectByRole";

function EmailLoginForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { role: ROLES.OWNER, ...DEMO_USERS[ROLES.OWNER] } });

  const { isPending, mutateAsync } = useMutation({ mutationFn: loginApi });

  const onSubmit = async ({ email, password }) => {
    try {
      const { user, message } = await mutateAsync({ email, password });
      toast.success(message);
      redirectByRole(navigate, user.role);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  // picking a role swaps in that role's demo account
  const fillDemoUser = (e) => {
    const { email, password } = DEMO_USERS[e.target.value];
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
            { value: ROLES.OWNER, label: "کارفرما" },
            { value: ROLES.FREELANCER, label: "فریلنسر" },
          ],
        }}
      />
      <Textfield
        label="ایمیل"
        name="email"
        type="email"
        register={register}
        required
        validationSchema={{ required: "ایمیل ضروری است" }}
        errors={errors}
      />
      <Textfield
        label="رمز عبور"
        name="password"
        type="password"
        register={register}
        required
        validationSchema={{ required: "رمز عبور ضروری است" }}
        errors={errors}
      />
      {isPending ? (
        <Loading />
      ) : (
        <button type="submit" className="btn btn--primary w-full">
          ورود
        </button>
      )}
    </form>
  );
}

export default EmailLoginForm;
