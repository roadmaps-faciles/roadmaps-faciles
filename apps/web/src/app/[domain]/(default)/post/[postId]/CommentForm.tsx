"use client";

import { cn } from "@roadmaps-faciles/ui";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";

import { UIAlert, UIButton, UIMarkdownEditor, type UIMarkdownEditorProps } from "@/ui/bridge";

import { sendComment } from "./_timeline/actions";

interface CommentFormProps {
  postId: number;
  tenantId: number;
  uploadImageAction: UIMarkdownEditorProps["uploadImageAction"];
  userId?: string;
}

export const CommentForm = ({ postId, tenantId, userId, uploadImageAction }: CommentFormProps) => {
  const t = useTranslations("post");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<null | string>(null);
  const bodyRef = useRef("");
  const [editorKey, setEditorKey] = useState(0);

  const handleChange = useCallback((value: string) => {
    bodyRef.current = value;
  }, []);

  const handleSubmit = () => {
    const body = bodyRef.current.trim();
    if (!body || !userId) return;

    setError(null);
    startTransition(async () => {
      const result = await sendComment({ postId, body, tenantId });
      if (result.ok) {
        bodyRef.current = "";
        setEditorKey(k => k + 1);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  if (!userId) {
    return (
      <div className="mt-4">
        <UIAlert
          variant="default"
          description={
            <>
              {t.rich("loginToComment", {
                link: chunks => <Link href="/login">{chunks}</Link>,
              })}
            </>
          }
        />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <UIMarkdownEditor
        key={editorKey}
        label={t("addComment")}
        onChangeAction={handleChange}
        uploadImageAction={uploadImageAction}
        disabled={isPending}
      />
      {error && <UIAlert variant="destructive" description={error} className="mt-2" />}
      <div className={cn("mt-2 flex justify-end")}>
        <UIButton type="button" size="sm" disabled={isPending} onClick={handleSubmit}>
          <Send className="mr-1 size-4" />
          {t("submitComment")}
        </UIButton>
      </div>
    </div>
  );
};
