"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { cn } from "@roadmaps-faciles/ui";
import { Alert, AlertDescription, AlertTitle } from "@roadmaps-faciles/ui/components/alert";
import { Badge } from "@roadmaps-faciles/ui/components/badge";
import { Button } from "@roadmaps-faciles/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@roadmaps-faciles/ui/components/card";
import { Input } from "@roadmaps-faciles/ui/components/input";
import { Label } from "@roadmaps-faciles/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@roadmaps-faciles/ui/components/select";
import { Switch } from "@roadmaps-faciles/ui/components/switch";
import {
  AlertTriangle,
  Check,
  Globe,
  Lock,
  MessageSquare,
  Palette,
  RefreshCw,
  Settings,
  Shield,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";

import { config } from "@/config";
import { type DNSStatus } from "@/lib/ee/domain-provider/dns";
import { useFeatureFlag } from "@/lib/feature-flags/client";
import { UI_THEME } from "@/lib/model/TenantSettings";
import { type TenantSettings } from "@/prisma/client";
import { WELCOME_DATA_PREVIEW } from "@/workflows/welcomeDataPreview";

import {
  checkDNS,
  deleteTenant,
  purgeTenantData,
  saveTenantSettings,
  seedDefaultData,
  updateTenantDomain,
} from "./actions";

const formSchema = z.object({
  id: z.number(),
  isPrivate: z.boolean(),
  allowAnonymousFeedback: z.boolean(),
  allowPostEdits: z.boolean(),
  allowPostDeletion: z.boolean(),
  showRoadmapInHeader: z.boolean(),
  allowVoting: z.boolean(),
  allowComments: z.boolean(),
  allowAnonymousVoting: z.boolean(),
  requirePostApproval: z.boolean(),
  allowEmbedding: z.boolean(),
  allowIndexing: z.boolean(),
  uiTheme: z.enum(UI_THEME),
});

type FormType = z.infer<typeof formSchema>;

type BooleanFormKeys = { [K in keyof FormType]: FormType[K] extends boolean ? K : never }[keyof FormType];

interface SectionToggle {
  disabled?: boolean;
  helperText: string;
  label: string;
  name: BooleanFormKeys;
}

interface Section {
  description?: string;
  icon: React.ReactNode;
  id: string;
  title: string;
  toggles: SectionToggle[];
}

const getSections = (t: ReturnType<typeof useTranslations<"domainAdmin.general">>): Section[] => [
  {
    id: "privacy",
    title: t("privacy"),
    description: t("privacyDescription"),
    icon: <Lock className="size-4" />,
    toggles: [
      { name: "isPrivate", label: t("isPrivate"), helperText: t("isPrivateHelper") },
      {
        name: "allowAnonymousFeedback",
        label: t("allowAnonymousFeedback"),
        helperText: t("allowAnonymousFeedbackHelper"),
      },
    ],
  },
  {
    id: "moderation",
    title: t("moderationTitle"),
    description: t("moderationDescription"),
    icon: <Shield className="size-4" />,
    toggles: [
      {
        name: "allowPostEdits",
        label: t("allowPostEdits"),
        helperText: t("allowPostEditsHelper"),
      },
      {
        name: "allowPostDeletion",
        label: t("allowPostDeletion"),
        helperText: t("allowPostDeletionHelper"),
      },
      {
        name: "requirePostApproval",
        label: t("requirePostApproval"),
        helperText: t("requirePostApprovalHelper"),
      },
    ],
  },
  {
    id: "header",
    title: t("headerTitle"),
    description: t("headerDescription"),
    icon: <Settings className="size-4" />,
    toggles: [
      {
        name: "showRoadmapInHeader",
        label: t("showRoadmapInHeader"),
        helperText: t("showRoadmapInHeaderHelper"),
      },
    ],
  },
  {
    id: "visibility",
    title: t("visibilityTitle"),
    description: t("visibilityDescription"),
    icon: <MessageSquare className="size-4" />,
    toggles: [
      { name: "allowVoting", label: t("allowVoting"), helperText: t("allowVotingHelper") },
      {
        name: "allowComments",
        label: t("allowComments"),
        helperText: t("allowCommentsHelper"),
      },
      {
        name: "allowAnonymousVoting",
        label: t("allowAnonymousVoting"),
        helperText: t("allowAnonymousVotingHelper"),
      },
    ],
  },
  {
    id: "embedding",
    title: t("embeddingTitle"),
    description: t("embeddingDescription"),
    icon: <Globe className="size-4" />,
    toggles: [
      {
        name: "allowEmbedding",
        label: t("allowEmbedding"),
        helperText: t("allowEmbeddingHelper"),
      },
      {
        name: "allowIndexing",
        label: t("allowIndexing"),
        helperText: t("allowIndexingHelper"),
      },
    ],
  },
];

type DomainFormType = {
  customDomain: null | string;
  settingsId: number;
  subdomain: string;
};

/** Quick nav section IDs - must match section `id` fields + extra sections */
const ALL_SECTION_IDS = ["privacy", "moderation", "header", "visibility", "embedding", "ui-theme", "domain", "danger"];

interface GeneralFormProps {
  canUseDsfr: boolean;
  hasData: boolean;
  isOwner: boolean;
  orgDomainsHref: string;
  tenantSettings: TenantSettings;
}

export const GeneralForm = ({ tenantSettings, isOwner, hasData, canUseDsfr, orgDomainsHref }: GeneralFormProps) => {
  const t = useTranslations("domainAdmin.general");
  const te = useTranslations("errors");
  const themeSwitchingEnabled = useFeatureFlag("themeSwitching");
  const showThemeSection = themeSwitchingEnabled || canUseDsfr;
  const SECTIONS = getSections(t);

  const [saveError, setSaveError] = useState<null | string>(null);
  const [saving, setSaving] = useState(false);
  const [savedField, setSavedField] = useState<null | string>(null);
  const [activeSection, setActiveSection] = useState<null | string>(null);
  const visibleSections = useRef(new Set<string>());

  // IntersectionObserver for quick nav highlighting
  useEffect(() => {
    const elements = ALL_SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    visibleSections.current.clear();

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleSections.current.add(entry.target.id);
          } else {
            visibleSections.current.delete(entry.target.id);
          }
        }
        const topmost = ALL_SECTION_IDS.find(id => visibleSections.current.has(id));
        setActiveSection(topmost ?? null);
      },
      { rootMargin: "-10% 0px -60% 0px" },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { control, setValue, getValues, reset } = useForm<FormType>({
    mode: "onChange",
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      id: tenantSettings.id,
      isPrivate: tenantSettings.isPrivate,
      allowAnonymousFeedback: tenantSettings.allowAnonymousFeedback,
      allowPostEdits: tenantSettings.allowPostEdits,
      allowPostDeletion: tenantSettings.allowPostDeletion,
      showRoadmapInHeader: tenantSettings.showRoadmapInHeader,
      allowVoting: tenantSettings.allowVoting,
      allowComments: tenantSettings.allowComments,
      allowAnonymousVoting: tenantSettings.allowAnonymousVoting,
      requirePostApproval: tenantSettings.requirePostApproval,
      allowEmbedding: tenantSettings.allowEmbedding,
      allowIndexing: tenantSettings.allowIndexing,
      uiTheme: tenantSettings.uiTheme,
    },
  });

  const watchedValues = useWatch({ control });

  // Quick-save: called immediately when a field changes
  const quickSave = useCallback(
    (fieldName: string) => {
      void (async () => {
        setSaveError(null);
        setSaving(true);
        setSavedField(null);
        try {
          const data = getValues();
          const response = await saveTenantSettings(data);
          if (!response.ok) {
            setSaveError(response.error);
          } else {
            reset(data);
            setSavedField(fieldName);
            setTimeout(() => setSavedField(null), 1500);
          }
        } catch (err) {
          setSaveError(err instanceof Error ? err.message : String(err));
        } finally {
          setSaving(false);
        }
      })();
    },
    [getValues, reset],
  );

  /** Quick nav labels - matches ALL_SECTION_IDS */
  const quickNavItems = [
    ...SECTIONS.map(s => ({ id: s.id, label: s.title })),
    ...(showThemeSection ? [{ id: "ui-theme", label: t("uiTheme.label") }] : []),
    ...(isOwner
      ? [
          { id: "domain", label: t("domains") },
          { id: "danger", label: t("dangerZone") },
        ]
      : []),
  ];

  return (
    <>
      <SeedSection hasData={hasData} />
      <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
        {/* Main content */}
        <div className="min-w-0 space-y-6">
          <div className="space-y-6">
            {SECTIONS.map(section => (
              <Card id={section.id} key={section.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{section.icon}</span>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  {section.description && <CardDescription>{section.description}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.toggles.map(toggle => (
                    <div key={toggle.name} className="flex items-start gap-3">
                      <Switch
                        id={toggle.name}
                        checked={!!watchedValues[toggle.name as keyof typeof watchedValues]}
                        disabled={toggle.disabled ?? saving}
                        onCheckedChange={(checked: boolean) => {
                          setValue(toggle.name, checked, { shouldDirty: true });
                          void quickSave(toggle.name);
                        }}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={toggle.name} className="cursor-pointer">
                            {toggle.label}
                          </Label>
                          {savedField === toggle.name && <Check className="size-3.5 text-green-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{toggle.helperText}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            {watchedValues.allowEmbedding && watchedValues.isPrivate && (
              <Alert className="mb-4">
                <AlertDescription>{t("allowEmbeddingPrivateWarning")}</AlertDescription>
              </Alert>
            )}

            {showThemeSection && (
              <ThemeSection
                canUseDsfr={canUseDsfr}
                tenantSettings={tenantSettings}
                watchedValues={watchedValues}
                setValue={setValue}
                saving={saving}
                savedField={savedField}
                onChangeAction={quickSave}
              />
            )}

            {saveError && (
              <Alert variant="destructive">
                <AlertTitle>{te("saveError")}</AlertTitle>
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}
          </div>

          {isOwner && (
            <>
              <DomainSection tenantSettings={tenantSettings} orgDomainsHref={orgDomainsHref} />
              <DangerZone />
            </>
          )}
        </div>

        {/* Quick Navigation */}
        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("quickNav")}</p>
            <nav className="space-y-1">
              {quickNavItems.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-sm transition-colors",
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    item.id === "danger" && "text-destructive hover:text-destructive",
                  )}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </>
  );
};

const ThemeSection = ({
  canUseDsfr,
  tenantSettings,
  watchedValues,
  setValue,
  saving,
  savedField,
  onChangeAction,
}: {
  canUseDsfr: boolean;
  onChangeAction: (fieldName: string) => void;
  savedField: null | string;
  saving: boolean;
  setValue: (name: "uiTheme", value: "Default" | "Dsfr", options?: { shouldDirty: boolean }) => void;
  tenantSettings: TenantSettings;
  watchedValues: Partial<FormType>;
}) => {
  const t = useTranslations("domainAdmin.general");
  const hasGouvDomain = !!tenantSettings.customDomain?.endsWith(".gouv.fr");
  const dsfrDisabled = !canUseDsfr || !hasGouvDomain;

  return (
    <Card id="ui-theme">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="size-4 text-muted-foreground" />
          <CardTitle className="text-lg">{t("uiTheme.label")}</CardTitle>
          {savedField === "uiTheme" && <Check className="size-3.5 text-green-500" />}
        </div>
        <CardDescription>{t("uiTheme.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="ui-theme-select">{t("uiTheme.label")}</Label>
          <Select
            value={watchedValues.uiTheme ?? "Default"}
            disabled={saving}
            onValueChange={v => {
              setValue("uiTheme", v as "Default" | "Dsfr", { shouldDirty: true });
              onChangeAction("uiTheme");
            }}
          >
            <SelectTrigger id="ui-theme-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Default">{t("uiTheme.options.Default")}</SelectItem>
              <SelectItem value="Dsfr" disabled={dsfrDisabled}>
                {t("uiTheme.options.Dsfr")}
              </SelectItem>
            </SelectContent>
          </Select>
          {!canUseDsfr ? (
            <p className="text-sm text-muted-foreground mt-1">{t("uiTheme.licenseRequired")}</p>
          ) : !hasGouvDomain ? (
            <p className="text-sm text-muted-foreground mt-1">{t("uiTheme.gouvRequired")}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

const SeedSection = ({ hasData }: { hasData: boolean }) => {
  const t = useTranslations("domainAdmin.general");
  const tc = useTranslations("common");
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState<null | string>(null);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedError(null);
    const result = await seedDefaultData();
    if (result.ok) {
      setSeedSuccess(true);
      window.location.reload();
    } else if (!result.ok) {
      setSeedError(result.error);
      setSeeding(false);
    }
  };

  if (hasData && !seedSuccess) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t("seedTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        {seedSuccess ? (
          <Alert>
            <AlertTitle>{t("seedSuccess")}</AlertTitle>
          </Alert>
        ) : (
          <>
            <p className="mb-4">{t("seedEmpty")}</p>
            <div className="mb-4">
              <p className="font-bold mb-2">{t("seedPreview")}</p>
              <ul className="mb-2 list-disc pl-5">
                {WELCOME_DATA_PREVIEW.boards.map(board => (
                  <li key={board.name}>
                    {t.rich("seedBoard", {
                      name: board.name,
                      description: board.description,
                      strong: chunks => <strong>{chunks}</strong>,
                    })}
                  </li>
                ))}
              </ul>
              <ul className="mb-2 list-disc pl-5">
                {WELCOME_DATA_PREVIEW.statuses.map(status => (
                  <li key={status.name}>
                    {t.rich("seedStatus", { name: status.name, strong: chunks => <strong>{chunks}</strong> })}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground">{WELCOME_DATA_PREVIEW.extras}</p>
            </div>
            {seedError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>{tc("error")}</AlertTitle>
                <AlertDescription>{seedError}</AlertDescription>
              </Alert>
            )}
            <Button disabled={seeding} onClick={() => void handleSeed()}>
              {seeding ? t("seeding") : t("seedButton")}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const DNS_STATUS_VARIANT: Record<DNSStatus, "default" | "destructive" | "outline" | "secondary"> = {
  valid: "default",
  invalid: "secondary",
  error: "destructive",
};

const DNS_STATUS_KEY: Record<DNSStatus, "dnsError" | "dnsInvalid" | "dnsValid"> = {
  valid: "dnsValid",
  invalid: "dnsInvalid",
  error: "dnsError",
};

const DNS_POLL_INTERVAL = 30_000;

const DomainSection = ({
  tenantSettings,
  orgDomainsHref,
}: {
  orgDomainsHref: string;
  tenantSettings: TenantSettings;
}) => {
  const t = useTranslations("domainAdmin.general");
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const [error, setError] = useState<null | string>(null);
  const [domainPending, setDomainPending] = useState(false);
  const [domainSuccess, setDomainSuccess] = useState(false);

  const [dnsStatus, setDnsStatus] = useState<DNSStatus | null>(null);
  const [dnsExpected, setDnsExpected] = useState<null | string>(null);
  const [dnsChecking, setDnsChecking] = useState(false);
  const dnsStatusRef = useRef(dnsStatus);
  useEffect(() => {
    dnsStatusRef.current = dnsStatus;
  }, [dnsStatus]);

  const domainSchema = z.object({
    settingsId: z.number(),
    subdomain: z
      .string()
      .min(1, tv("subdomainRequired"))
      .regex(/^[a-z0-9-]+$/, tv("subdomainRegex")),
    customDomain: z
      .string()
      .transform(v => (v === "" ? null : v))
      .nullable(),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors: domainErrors, isDirty: isDomainDirty },
  } = useForm<DomainFormType>({
    resolver: standardSchemaResolver(domainSchema),
    defaultValues: {
      settingsId: tenantSettings.id,
      subdomain: tenantSettings.subdomain,
      customDomain: tenantSettings.customDomain ?? null,
    },
  });

  const subdomain = useWatch({ control, name: "subdomain" });

  const [savedCustomDomain, setSavedCustomDomain] = useState(tenantSettings.customDomain);

  const runDNSCheck = useCallback(async () => {
    if (!savedCustomDomain) return;
    setDnsChecking(true);
    const result = await checkDNS(savedCustomDomain);
    if (result.ok) {
      setDnsStatus(result.data.status);
      setDnsExpected(result.data.expected);
    } else {
      setDnsStatus("error");
    }
    setDnsChecking(false);
  }, [savedCustomDomain]);

  useEffect(() => {
    if (!savedCustomDomain) return;

    let cancelled = false;

    const doCheck = async () => {
      if (cancelled) return;
      setDnsChecking(true);
      const result = await checkDNS(savedCustomDomain);
      if (cancelled) return;
      if (result.ok) {
        setDnsStatus(result.data.status);
        setDnsExpected(result.data.expected);
      } else {
        setDnsStatus("error");
      }
      setDnsChecking(false);
    };

    const initialTimeout = setTimeout(() => void doCheck(), 0);

    const interval = setInterval(() => {
      if (dnsStatusRef.current === "valid") return;
      void doCheck();
    }, DNS_POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [savedCustomDomain]);

  const onDomainSubmit = async (data: DomainFormType) => {
    setError(null);
    setDomainPending(true);
    const result = await updateTenantDomain(data);
    if (result.ok) {
      reset(data);
      setSavedCustomDomain(data.customDomain);
      setDnsStatus(null);
      setDomainSuccess(true);
      setTimeout(() => setDomainSuccess(false), 5000);
    } else if (!result.ok) {
      setError(result.error);
    }
    setDomainPending(false);
  };

  const showDnsStatus = savedCustomDomain && !isDomainDirty && dnsStatus;

  return (
    <Card id="domain">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-muted-foreground" />
          <CardTitle className="text-lg">{t("domains")}</CardTitle>
        </div>
        <CardDescription>{t("domainsDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={e => void handleSubmit(onDomainSubmit)(e)} className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="subdomain">{t("subdomainLabel")}</Label>
            <Input id="subdomain" {...register("subdomain")} />
            {subdomain && (
              <p className="text-sm text-muted-foreground">
                URL : <strong>{`${subdomain}.${config.rootDomain}`}</strong>
              </p>
            )}
            {domainErrors.subdomain && <p className="text-sm text-destructive">{domainErrors.subdomain.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-domain">{t("customDomain")}</Label>
            <Input id="custom-domain" {...register("customDomain")} placeholder="feedback.example.com" />
            <p className="text-sm text-muted-foreground">{t("customDomainHint")}</p>
            {savedCustomDomain && !isDomainDirty && tenantSettings.customDomainVerifiedAt && (
              <Badge variant="success" className="gap-1">
                <Check className="size-3.5" />
                {t("customDomainVerified")}
              </Badge>
            )}
            <p className="text-sm text-muted-foreground">
              {t.rich("customDomainOwnershipHint", {
                link: chunks => (
                  <a className="underline" href={orgDomainsHref}>
                    {chunks}
                  </a>
                ),
              })}
            </p>
            {domainErrors.customDomain && (
              <p className="text-sm text-destructive">{domainErrors.customDomain.message}</p>
            )}
          </div>

          {showDnsStatus && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={DNS_STATUS_VARIANT[dnsStatus]}>{t(DNS_STATUS_KEY[dnsStatus])}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={dnsChecking}
                  onClick={() => void runDNSCheck()}
                >
                  <RefreshCw className={cn("mr-1 size-4", dnsChecking && "animate-spin")} />
                  {dnsChecking ? t("dnsChecking") : t("checkDns")}
                </Button>
              </div>
              {dnsStatus === "invalid" && dnsExpected && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    {t.rich("dnsInvalidHint", { domain: savedCustomDomain, code: chunks => <code>{chunks}</code> })}
                  </p>
                  <p>
                    <code>
                      {savedCustomDomain} CNAME {dnsExpected}
                    </code>
                  </p>
                </div>
              )}
              {dnsStatus === "error" && dnsExpected && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{t.rich("dnsErrorHint", { domain: savedCustomDomain, code: chunks => <code>{chunks}</code> })}</p>
                  <p>
                    <code>
                      {savedCustomDomain} CNAME {dnsExpected}
                    </code>
                  </p>
                  <p>
                    {t.rich("dnsErrorAlternative", {
                      expected: dnsExpected ?? "",
                      strong: chunks => <strong>{chunks}</strong>,
                      code: chunks => <code>{chunks}</code>,
                    })}
                  </p>
                </div>
              )}
              {dnsStatus === "valid" && (
                <p className="text-sm text-muted-foreground">
                  {t.rich("dnsValidHint", {
                    domain: savedCustomDomain,
                    expected: dnsExpected ?? "",
                    code: chunks => <code>{chunks}</code>,
                  })}
                </p>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>{tc("error")}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {domainSuccess && (
            <Alert>
              <AlertTitle>{t("domainsUpdated")}</AlertTitle>
            </Alert>
          )}

          <Button type="submit" disabled={domainPending || !isDomainDirty}>
            {t("updateDomains")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const DangerZone = () => {
  const t = useTranslations("domainAdmin.general");
  const tc = useTranslations("common");
  const [error, setError] = useState<null | string>(null);
  const [purging, setPurging] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handlePurge = async () => {
    if (!confirm(t("purgeConfirm"))) return;
    setPurging(true);
    setError(null);
    const result = await purgeTenantData();
    if (result.ok) {
      window.location.reload();
    } else if (!result.ok) {
      setError(result.error);
      setPurging(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("deleteConfirm"))) return;
    setDeleting(true);
    setError(null);
    const result = await deleteTenant();
    if (result.ok) {
      window.location.href = config.host;
    } else if (!result.ok) {
      setError(result.error);
      setDeleting(false);
    }
  };

  return (
    <Card id="danger" className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-destructive" />
          <CardTitle className="text-lg text-destructive">{t("dangerZone")}</CardTitle>
        </div>
        <CardDescription className="text-destructive/80">{t("dangerZoneDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>{tc("error")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex gap-4">
          <Button variant="destructive" size="sm" disabled={purging || deleting} onClick={() => void handlePurge()}>
            <Trash2 className="mr-2 size-4" />
            {purging ? t("purging") : t("purgeData")}
          </Button>
          <Button variant="destructive" size="sm" disabled={purging || deleting} onClick={() => void handleDelete()}>
            <Trash2 className="mr-2 size-4" />
            {deleting ? t("deleting") : t("deleteTenant")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
