"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Alert, AlertDescription, AlertTitle, Button, Checkbox, Input, Label } from "@roadmaps-faciles/ui";
import { Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { config } from "@/config";

import { createTenantForUser } from "./actions";

interface AdminOrg {
  id: number;
  name: string;
  slug: string;
}

export const NewTenantForm = ({ adminOrgs = [] }: { adminOrgs?: AdminOrg[] }) => {
  const t = useTranslations("tenant");
  const tv = useTranslations("validation");
  const [error, setError] = useState<null | string>(null);
  const [pending, setPending] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, tv("nameRequired")),
    organizationId: z.number().optional(),
    organizationName: z.string().optional(),
    organizationSlug: z.string().optional(),
    seedDefaultData: z.boolean(),
    subdomain: z
      .string()
      .min(1, tv("subdomainRequired"))
      .regex(/^[a-z0-9-]+$/, tv("subdomainRegex")),
  });

  type FormType = z.infer<typeof formSchema>;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormType>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      name: "",
      subdomain: "",
      seedDefaultData: true,
      organizationId: undefined,
      organizationName: "",
      organizationSlug: "",
    },
  });

  const selectedOrgId = useWatch({ control, name: "organizationId" });
  const subdomain = useWatch({ control, name: "subdomain" });
  const seedDefaultData = useWatch({ control, name: "seedDefaultData" });
  const isStandalone = !selectedOrgId;

  // Track manually edited fields to avoid overwriting user input
  const [dirtyFields, setDirtyFields] = useState<Record<string, boolean>>({});
  const markDirty = (field: string) => setDirtyFields(prev => ({ ...prev, [field]: true }));
  const isDirty = (field: string) => !!dirtyFields[field];

  const onSubmit = async (data: FormType) => {
    setPending(true);
    setError(null);

    const result = await createTenantForUser({
      ...data,
      organizationName: isStandalone ? data.organizationName || data.name : undefined,
      organizationSlug: isStandalone ? data.organizationSlug || data.subdomain : undefined,
    });
    if (result.ok) {
      window.location.href = result.data.redirectUrl;
    } else {
      setError(result.error);
      setPending(false);
    }
  };

  return (
    <form noValidate onSubmit={e => void handleSubmit(onSubmit)(e)} className="mb-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>{t("createError")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Org selection (if user has admin orgs) */}
      {adminOrgs.length > 0 && (
        <div className="mb-6 space-y-2">
          <Label htmlFor="organizationId">{t("creationMode")}</Label>
          <select
            id="organizationId"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={selectedOrgId ?? ""}
            onChange={e => setValue("organizationId", e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">{t("standalone")}</option>
            {adminOrgs.map(org => (
              <option key={org.id} value={org.id}>
                {t("inOrg", { name: org.name })}
              </option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground">{selectedOrgId ? t("inOrgHint") : t("standaloneHint")}</p>
        </div>
      )}

      {/* Tenant fields */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{t("nameLabel2")}</Label>
          <Input
            id="name"
            placeholder="Mon espace"
            aria-invalid={!!errors.name}
            {...register("name", {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const slug = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "-")
                  .replace(/-+/g, "-")
                  .replace(/^-|-$/g, "");
                if (!isDirty("subdomain")) setValue("subdomain", slug);
                if (isStandalone) {
                  if (!isDirty("organizationName")) setValue("organizationName", e.target.value);
                  if (!isDirty("organizationSlug")) setValue("organizationSlug", slug);
                }
              },
            })}
          />
          <p className="text-sm text-muted-foreground">{t("nameHint2")}</p>
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="subdomain">{t("subdomain")}</Label>
          <Input
            id="subdomain"
            placeholder={t("subdomainPlaceholder")}
            aria-invalid={!!errors.subdomain}
            {...register("subdomain", {
              onChange: () => markDirty("subdomain"),
            })}
          />
          <p className="text-sm text-muted-foreground">
            {subdomain ? t("subdomainPreview", { url: `${subdomain}.${config.rootDomain}` }) : t("subdomainHint")}
          </p>
          {errors.subdomain && <p className="text-sm text-destructive">{errors.subdomain.message}</p>}
        </div>
      </div>

      {/* Organization details (standalone mode only) */}
      {isStandalone && (
        <div className="mt-6 rounded-lg border border-dashed p-4">
          <div className="mb-3 flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t("orgSection")}</span>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">{t("orgSectionHint")}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="organizationName">{t("orgName")}</Label>
              <Input
                id="organizationName"
                placeholder="Mon organisation"
                {...register("organizationName", {
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    markDirty("organizationName");
                    if (!isDirty("organizationSlug")) {
                      setValue(
                        "organizationSlug",
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-")
                          .replace(/-+/g, "-")
                          .replace(/^-|-$/g, ""),
                      );
                    }
                  },
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationSlug">{t("orgSlug")}</Label>
              <Input
                id="organizationSlug"
                placeholder="mon-org"
                {...register("organizationSlug", {
                  onChange: () => markDirty("organizationSlug"),
                })}
              />
              <p className="text-xs text-muted-foreground">{t("orgSlugHint")}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Checkbox
          id="seedDefaultData"
          checked={seedDefaultData}
          onCheckedChange={checked => setValue("seedDefaultData", !!checked)}
        />
        <Label htmlFor="seedDefaultData" className="cursor-pointer">
          {t("seedDefaultDataLabel")}
        </Label>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{t("seedDefaultDataHint")}</p>

      <Button type="submit" disabled={pending} className="mt-6">
        {pending ? t("creating") : t("createTenant")}
      </Button>
    </form>
  );
};
