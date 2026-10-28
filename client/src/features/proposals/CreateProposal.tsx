import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Textfield from "../../ui/Textfield";
import Loading from "../../ui/Loading";
import useCreateProposal from "./useCreateProposal";
import { proposalSchema, type ProposalInput, type ProposalValues } from "../../schemas/proposal";

function CreateProposal({ onClose, projectId }: { onClose: () => void; projectId: string }) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ProposalInput, unknown, ProposalValues>({ resolver: zodResolver(proposalSchema) });

  const { isCreating, createProposal } = useCreateProposal();

  const onSubmit = (data: ProposalValues) => {
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
          errors={errors}
        />
        <Textfield
          label="قیمت"
          name="price"
          type="number"
          register={register}
          required
          errors={errors}
        />
        <Textfield
          label="مدت زمان"
          name="duration"
          type="number"
          register={register}
          required
          errors={errors}
        />
        <div className="!mt-8">
          {isCreating ? (
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
