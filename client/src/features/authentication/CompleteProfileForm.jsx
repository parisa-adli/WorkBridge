import Textfield from "../../ui/Textfield";
import { useMutation } from "@tanstack/react-query";
import { completeProfile } from "../../services/authService";
import Loading from "../../ui/Loading";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import RadioInputGroup from "../../ui/RadioInputGroup";

function CompleteProfileForm() {
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm();
  // const [name, setName] = useState("");
  // const [email, setEmail] = useState("");
  // const [role, setRole] = useState("");
  const navigate = useNavigate();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: completeProfile,
  });

  const onSubmit = async (data) => {
    try {
      const { user, message } = await mutateAsync(data);
      toast.success(message);

      if (+user.status !== 2) {
        navigate("/");
        toast("پروفایل شما در انتظار تایید است", { icon: "💫" });
        return;
      }
      if (user.role === "OWNER") return navigate("/owner");
      if (user.role === "FREELANCER") return navigate("/freelancer");
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="flex justify-center pt-10">
      <div className="w-full sm:max-w-sm">
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <Textfield
            label="نام و نام خانوادگی"
            name="name"
            register={register}
            required
            validationSchema={{
              required: "نام و نام خانوادگی ضروری است",
            }}
            errors={errors}
          />
          <Textfield
            label="ایمیل"
            name="email"
            register={register}
            required
            validationSchema={{
              required: "ایمیل ضروری است",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "ایمیل نامعتبر است",
              },
            }}
            errors={errors}
          />
          <RadioInputGroup
            errors={errors}
            register={register}
            watch={watch}
            configs={{
              name: "role",
              validationSchema: {
                required: "انتخاب نقش ضروری است",
              },
              options: [
                {
                  value: "OWNER",
                  label: "کارفرما",
                },
                {
                  value: "FREELANCER",
                  label: "فریلنسر",
                },
              ],
            }}
          />
          {isPending ? (
            <Loading />
          ) : (
            <button className="btn btn--primary w-full">تایید</button>
          )}
        </form>
      </div>
    </div>
  );
}
export default CompleteProfileForm;
