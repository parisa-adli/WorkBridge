import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordSchema, profileSchema, type PasswordValues, type ProfileValues } from "../../schemas/auth";
import type { User } from "../../types/api";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";
import Button from "../../ui/Button";
import { Avatar } from "./UserAvatar";
import { X } from "lucide-react";
import { useChangePassword, useRemoveAvatar, useUpdateAvatar, useUpdateProfile } from "./useUpdateProfile";

function ProfileForm({ user }: { user: User }) {
  const { t } = useTranslation();
  const { isUpdating, updateProfile } = useUpdateProfile();
  const { isUploading, updateAvatar } = useUpdateAvatar();
  const { isRemoving, removeAvatar } = useRemoveAvatar();
  const fileInput = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? "",
      email: user.email ?? "",
      biography: user.biography ?? "",
      phoneNumber: user.phoneNumber ?? "",
    },
  });

  return (
    <div className="max-w-xl space-y-6">
      <Card className="flex-row items-center gap-4">
        <div className="relative shrink-0">
          <Avatar user={user} className="size-20 text-2xl" />
          {user.avatarUrl && (
            <button
              type="button"
              onClick={() => removeAvatar()}
              disabled={isRemoving}
              aria-label={t("profile.removeAvatar")}
              title={t("profile.removeAvatar")}
              className="absolute -top-1 -end-1 flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          )}
        </div>
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
        <form
          className="space-y-5"
          // the server accepts a number only while none is registered
          onSubmit={handleSubmit(({ phoneNumber, ...data }) =>
            updateProfile({ ...data, ...(!user.phoneNumber && phoneNumber && { phoneNumber }) })
          )}
        >
          <Input label={t("auth.fullName")} required dir="auto" error={errors.name?.message} {...register("name")} />
          <Input label={t("auth.email")} required dir="ltr" error={errors.email?.message} {...register("email")} />
          <Input
            label={t("auth.phoneNumber")}
            dir="ltr"
            disabled={!!user.phoneNumber}
            error={errors.phoneNumber?.message}
            {...register("phoneNumber")}
          />
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
      <PasswordForm hasPassword={!!user.hasPassword} />
    </div>
  );
}

function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const { t } = useTranslation();
  const { isChangingPassword, changePassword } = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  return (
    <Card>
      <form
        className="space-y-5"
        onSubmit={handleSubmit(({ currentPassword, newPassword }) =>
          changePassword({ newPassword, ...(hasPassword && { currentPassword }) }, { onSuccess: () => reset() })
        )}
      >
        <h2 className="font-bold">{t(hasPassword ? "profile.changePassword" : "profile.setPassword")}</h2>
        {hasPassword && (
          <Input
            label={t("profile.currentPassword")}
            type="password"
            dir="ltr"
            autoComplete="current-password"
            required
            {...register("currentPassword")}
          />
        )}
        <Input
          label={t("profile.newPassword")}
          type="password"
          dir="ltr"
          autoComplete="new-password"
          required
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <Button type="submit" disabled={isChangingPassword}>
          {t("profile.savePassword")}
        </Button>
      </form>
    </Card>
  );
}
export default ProfileForm;
