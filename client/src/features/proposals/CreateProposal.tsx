import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../../ui/Input";
import Loading from "../../ui/Loading";
import useCreateProposal from "./useCreateProposal";
import { proposalSchema, type ProposalInput, type ProposalValues } from "../../schemas/proposal";

function CreateProposal({ onClose, projectId }: { onClose: () => void; projectId: string }) {
  const { t } = useTranslation();
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
        <Input label={t("common.description")} required error={errors.description?.message} {...register("description")} />
        <Input label={t("proposal.price")} type="number" required error={errors.price?.message} {...register("price")} />
        <Input label={t("proposal.duration")} type="number" required error={errors.duration?.message} {...register("duration")} />
        <div className="mt-8!">
          {isCreating ? (
            <Loading />
          ) : (
            <button type="submit" className="btn btn--primary w-full">
              {t("common.confirm")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
export default CreateProposal;
