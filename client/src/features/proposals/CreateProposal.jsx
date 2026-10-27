import { useForm } from "react-hook-form";
import Textfield from "../../ui/Textfield";
import Loading from "../../ui/Loading";
import useCreateProposal from "./useCreateProposal";

function CreateProposal({ onClose, projectId }) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const { isCreating, createProposal } = useCreateProposal();

  const onSubmit = (data) => {
    console.log(data);
    createProposal(
      { ...data, projectId },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <div>
      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        <Textfield
          label="توضیحات"
          name="description"
          register={register}
          required
          validationSchema={{
            required: "عنوان ضروری است",
            minLength: {
              value: 10,
              message: "حداقل 10 کاراکتر را وارد کنید",
            },
          }}
          errors={errors}
        />
        <Textfield
          label="قیمت"
          name="price"
          type="number"
          register={register}
          required
          validationSchema={{
            required: "قیمت ضروری است",
            min: {
              value: 10000,
              message: "مبلغ وارد شده نامعتبر است",
            },
            max: {
              value: 1000000000,
              message: "مبلغ وارد شده نامعتبر است",
            },
          }}
          errors={errors}
        />
        <Textfield
          label="مدت زمان"
          name="duration"
          type="number"
          register={register}
          required
          validationSchema={{
            required: "مدت زمان ضروری است",
            min: {
              value: 1,
              message: "مدت زمان مجاز نمی باشد",
            },
            max: {
              value: 365,
              message: "مدت زمان مجاز نمی باشد",
            },
          }}
          errors={errors}
        />
        <div className="!mt-8">
          {0 ? (
            <Loading />
          ) : (
            <button type="submit" className="btn btn--primary w-full">
              تایید
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
export default CreateProposal;
