"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { UserAvatar } from "@/components/img/UserAvatar";
import { UIAlert, UIButton } from "@/ui/bridge";

import { removeAvatar, uploadAvatar } from "./actions";

interface AvatarUploadSectionProps {
  initialImage: null | string;
  userName: string;
}

export const AvatarUploadSection = ({ initialImage, userName }: AvatarUploadSectionProps) => {
  const t = useTranslations("profile");
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<null | string>(initialImage);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPending(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("file", file);
      const result = await uploadAvatar(form);
      if (result.ok) {
        // Cache-bust : nouvelle URL (UUID différent) suffit, mais on garantit le rerender.
        setImage(result.data.url);
      } else {
        setError(result.error);
      }
    } finally {
      setPending(false);
      // Reset le input pour autoriser un re-upload du même fichier après une erreur.
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    setPending(true);
    setError(null);
    try {
      const result = await removeAvatar();
      if (result.ok) {
        setImage(null);
      } else {
        setError(result.error);
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <UserAvatar name={userName} image={image} className="size-16 text-xl" />
        <div className="flex flex-wrap gap-2">
          <UIButton
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            {image ? t("avatarChange") : t("avatarUpload")}
          </UIButton>
          {image && (
            <UIButton type="button" size="sm" variant="ghost" disabled={pending} onClick={() => void handleRemove()}>
              {t("avatarRemove")}
            </UIButton>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t("avatarHint")}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/gif,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => void handleFileChange(e)}
      />
      {error && <UIAlert variant="destructive" description={error} />}
    </div>
  );
};
