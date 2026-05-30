"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { UIButton, UIModal } from "@/ui/bridge";

interface AvatarCropDialogProps {
  imageSrc: string;
  onCancel: () => void;
  onConfirmAction: (blob: Blob) => Promise<void> | void;
  /** Type MIME du blob de sortie. Défaut : image/jpeg (compression efficace pour avatar). */
  outputType?: string;
  pending?: boolean;
}

/**
 * Charge un dataURL/objectURL dans un `<canvas>` pour pouvoir extraire un crop.
 * Wrap dans une Promise pour pouvoir await dans le handler de save.
 */
const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const cropToBlob = async (imageSrc: string, area: Area, outputType: string): Promise<Blob> => {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = area.width;
  canvas.height = area.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error("Canvas toBlob returned null"))), outputType, 0.92);
  });
};

export const AvatarCropDialog = ({
  imageSrc,
  onCancel,
  onConfirmAction,
  outputType = "image/jpeg",
  pending,
}: AvatarCropDialogProps) => {
  const t = useTranslations("profile");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setArea(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!area) return;
    const blob = await cropToBlob(imageSrc, area, outputType);
    await onConfirmAction(blob);
  };

  return (
    <UIModal
      open
      onClose={pending ? undefined : onCancel}
      title={t("avatarCropTitle")}
      footer={
        <>
          <UIButton type="button" variant="ghost" disabled={pending} onClick={onCancel}>
            {t("avatarCropCancel")}
          </UIButton>
          <UIButton type="button" disabled={pending || !area} onClick={() => void handleConfirm()}>
            {t("avatarCropConfirm")}
          </UIButton>
        </>
      }
    >
      <div className="relative h-64 w-full overflow-hidden rounded-md bg-muted">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>
      <div className="mt-4 space-y-1">
        <label htmlFor="avatar-zoom" className="text-sm font-medium">
          {t("avatarCropZoom")}
        </label>
        <input
          id="avatar-zoom"
          type="range"
          min={1}
          max={4}
          step={0.05}
          value={zoom}
          disabled={pending}
          onChange={e => setZoom(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </UIModal>
  );
};
