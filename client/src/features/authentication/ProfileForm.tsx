import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileValues } from "../../schemas/auth";
import type { User } from "../../types/api";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";
import Button from "../../ui/Button";
import { Avatar } from "./UserAvatar";
import { useUpdateAvatar, useUpdateProfile } from "./useUpdateProfile";

function ProfileForm({ user }: { user: User }) {
  const { t } = useTranslation();
  const { isUpdating, updateProfile } = useUpdateProfile();
  const { isUploading, updateAvatar } = useUpdateAvatar();
  const fileInput = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name ?? "", email: user.email ?? "", biography: user.biography ?? "" },
  });

  return (
    <div className="max-w-xl space-y-6">
      <Card className="flex-row items-center gap-4">
        <Avatar user={user} className="size-20 text-2xl" />
        <div className="space-y-2">
          <Button variant="outline" size="sm" disabled={isUploading} onClick={() => fileInput.current?.click()}>
            {t("profile.changeAvatar")}
          </Button>
          <p className="text-sm text-muted-foreground">{t("profile.avatarHint")}</p>
          {/* the server checks the type and size again */}
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) updateAvatar(file);
              e.target.value = ""; // so picking the same file again still fires onChange
            }}
          />
        </div>
      </Card>
      <Card>
        <form className="space-y-5" onSubmit={handleSubmit((data) => updateProfile(data))}>
          <Input label={t("auth.fullName")} required dir="auto" error={errors.name?.message} {...register("name")} />
          <Input label={t("auth.email")} required dir="ltr" error={errors.email?.message} {...register("email")} />
          <Input label={t("auth.phoneNumber")} dir="ltr" value={user.phoneNumber} readOnly disabled />
          <Textarea
            label={t("profile.biography")}
            dir="auto"
            error={errors.biography?.message}
            {...register("biography")}
          />
          <Button type="submit" disabled={isUpdating}>
            {t("profile.save")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
export default ProfileForm;
