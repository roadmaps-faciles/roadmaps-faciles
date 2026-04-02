"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Alert, AlertDescription, AlertTitle, Badge, Button, Input, Label } from "@roadmaps-faciles/ui";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { config } from "@/config";
import { type UserEmailSearchResult } from "@/lib/repo/IUserRepo";

import { searchUsers } from "../../../actions";
import { type CreateTenantResult, createTenant } from "./actions";

const EmailAutocompleteInput = ({
  disabled,
  label,
  onSelectAction,
  placeholder,
  searchAction,
}: {
  disabled?: boolean;
  label: string;
  onSelectAction: (email: string) => void;
  placeholder: string;
  searchAction: (query: string) => Promise<UserEmailSearchResult[]>;
}) => {
  const [options, setOptions] = useState<UserEmailSearchResult[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<null | ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value.length < 2) {
        setOptions([]);
        setIsOpen(false);
        return;
      }
      debounceRef.current = setTimeout(() => {
        void searchAction(value).then(results => {
          setOptions(results);
          setIsOpen(results.length > 0);
        });
      }, 300);
    },
    [searchAction],
  );

  const handleSelect = (email: string) => {
    onSelectAction(email);
    setInputValue("");
    setOptions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      handleSelect(inputValue.trim());
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Label>{label}</Label>
      <Input
        disabled={disabled}
        value={inputValue}
        onChange={e => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => options.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
      />
      {isOpen && options.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
          {options.map(option => (
            <li key={option.email}>
              <button
                type="button"
                className="w-full cursor-pointer rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleSelect(option.email)}
              >
                {option.name ? `${option.name} (${option.email})` : option.email}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const CreateTenantForm = () => {
  const router = useRouter();
  const t = useTranslations("adminTenants");
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const [error, setError] = useState<null | string>(null);
  const [pending, setPending] = useState(false);
  const [ownerEmails, setOwnerEmails] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<null | string>(null);
  const [successResult, setSuccessResult] = useState<CreateTenantResult | null>(null);

  const formSchema = z.object({
    name: z.string().min(1, tv("nameRequired")),
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
    formState: { errors },
  } = useForm<FormType>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      name: "",
      subdomain: "",
    },
  });

  const subdomain = useWatch({ control, name: "subdomain" });

  const handleAddEmail = (email: string) => {
    setEmailError(null);
    if (ownerEmails.includes(email)) {
      setEmailError(t("emailAlreadyAdded"));
      return;
    }
    setOwnerEmails(prev => [...prev, email]);
  };

  const handleRemoveEmail = (email: string) => {
    setOwnerEmails(prev => prev.filter(e => e !== email));
  };

  const onSubmit = async (data: FormType) => {
    if (ownerEmails.length === 0) {
      setEmailError(t("minOneOwnerRequired"));
      return;
    }

    setPending(true);
    setError(null);

    const result = await createTenant({
      name: data.name,
      subdomain: data.subdomain,
      ownerEmails,
    });

    if (result.ok) {
      if (result.data.failedInvitations?.length) {
        setPending(false);
        setSuccessResult(result.data);
        return;
      }
      router.push("/admin/tenants");
      return;
    }

    setError(result.error);
    setPending(false);
  };

  if (successResult?.failedInvitations?.length) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTitle>{t("createdTitle")}</AlertTitle>
          <AlertDescription>{t("createdDescription")}</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTitle>{t("failedInvitationsTitle")}</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-disc pl-4">
              {successResult.failedInvitations.map(f => (
                <li key={f.email}>
                  <strong>{f.email}</strong> : {f.reason}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/admin/tenants">{t("backToList")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={e => void handleSubmit(onSubmit)(e)}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>{tc("error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{t("nameLabel")}</Label>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          <p className="text-sm text-muted-foreground">{t("nameHint")}</p>
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="subdomain">{t("subdomainLabel")}</Label>
          <Input id="subdomain" aria-invalid={!!errors.subdomain} {...register("subdomain")} />
          <p className="text-sm text-muted-foreground">
            {subdomain
              ? t.rich("subdomainPreview", {
                  url: `${subdomain}.${config.rootDomain}`,
                  strong: chunks => <strong>{chunks}</strong>,
                })
              : t("subdomainHint")}
          </p>
          {errors.subdomain && <p className="text-sm text-destructive">{errors.subdomain.message}</p>}
        </div>
      </div>

      <fieldset className="mb-6 space-y-4 border-0 p-0">
        <legend className="mb-2">
          <h3 className="text-lg font-medium">{t("ownersLegend")}</h3>
        </legend>
        {emailError && <p className="text-sm text-destructive">{emailError}</p>}

        <EmailAutocompleteInput
          label={t("addOwnerLabel")}
          placeholder={t("emailSearchPlaceholder")}
          searchAction={searchUsers}
          onSelectAction={handleAddEmail}
        />

        {ownerEmails.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ownerEmails.map(email => (
              <Badge key={email} variant="secondary" className="gap-1 pl-3 pr-1">
                {email}
                <button
                  type="button"
                  className="ml-1 rounded-full p-0.5 hover:bg-muted"
                  onClick={() => handleRemoveEmail(email)}
                >
                  <X className="size-3" />
                  <span className="sr-only">{t("removeEmail", { email })}</span>
                </button>
              </Badge>
            ))}
          </div>
        )}
      </fieldset>

      <Button type="submit" disabled={pending}>
        {pending ? t("creating") : t("createButton")}
      </Button>
    </form>
  );
};
