"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { UserAvatar } from "@/components/img/UserAvatar";
import { UIAlert, UIButton } from "@/ui/bridge";

import { removeAvatar, uploadAvatar } from "./actions";
import { AvatarCropDialog } from "./AvatarCropDialog";

interface AvatarUploadSectionProps {
  initialImage: null | string;
  maxFileSizeMb: number;
  userName: string;
}

const PREVIEW_SIZE = 128;

export const AvatarUploadSection = ({ initialImage, maxFileSizeMb, userName }: AvatarUploadSectionProps) => {
  const t = useTranslations("profile");
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<null | string>(initialImage);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [cropSrc, setCropSrc] = useState<null | string>(null);

  // Révoque l'objectURL du crop quand on quitte le dialog (évite la fuite mémoire).
  useEffect(
    () => () => {
      if (cropSrc) URL.revokeObjectURL(cropSrc);
    },
    [cropSrc],
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);

    // Garde-fou client : on prévient avant d'ouvrir le crop si déjà trop gros.
    // Le serveur revalide de toute façon.
    const maxBytes = maxFileSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(t("avatarTooLarge", { max: maxFileSizeMb }));
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setCropSrc(URL.createObjectURL(file));
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleCropConfirm = async (blob: Blob) => {
    setPending(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("file", new File([blob], "avatar.jpg", { type: blob.type || "image/jpeg" }));
      const result = await uploadAvatar(form);
      if (result.ok) {
        setImage(result.data.url);
        setCropSrc(null);
        // Hard reload pour rafraîchir l'avatar dans le header (lu depuis le JWT session,
        // qui n'est pas auto-refresh sans naviguer ailleurs).
        window.location.reload();
      } else {
        setError(result.error);
      }
    } finally {
      setPending(false);
    }
  };

  const handleCropCancel = () => {
    if (pending) return;
    setCropSrc(null);
  };

  const handleRemove = async () => {
    setPending(true);
    setError(null);
    try {
      const result = await removeAvatar();
      if (result.ok) {
        setImage(null);
        window.location.reload();
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
        <UserAvatar name={userName} image={image} size={PREVIEW_SIZE} className="size-32 text-2xl" />
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
      <p className="text-xs text-muted-foreground">{t("avatarHint", { max: maxFileSizeMb })}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/gif,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <UIAlert variant="destructive" description={error} />}
      {cropSrc && (
        <AvatarCropDialog
          imageSrc={cropSrc}
          pending={pending}
          onCancel={handleCropCancel}
          onConfirmAction={handleCropConfirm}
        />
      )}
    </div>
  );
};
