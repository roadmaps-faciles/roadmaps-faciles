"use client";

import { Separator } from "@roadmaps-faciles/ui";
import dynamic from "next/dynamic";
import { type ReactNode, useCallback, useEffect, useState } from "react";

import { useUI } from "@/ui";
import { UIAlert } from "@/ui/bridge/UIAlert";
import { UIBadge } from "@/ui/bridge/UIBadge";
import { UIButton } from "@/ui/bridge/UIButton";
import { UIButtonsGroup } from "@/ui/bridge/UIButtonsGroup";
import { UICard } from "@/ui/bridge/UICard";
import { UIInput } from "@/ui/bridge/UIInput";
import { UILabel } from "@/ui/bridge/UILabel";
import { UIModal } from "@/ui/bridge/UIModal";
import { UINotice } from "@/ui/bridge/UINotice";
import { UISeparator } from "@/ui/bridge/UISeparator";
import { UISkeleton } from "@/ui/bridge/UISkeleton";
import { UITable } from "@/ui/bridge/UITable";
import { UITag } from "@/ui/bridge/UITag";
import { UITooltip } from "@/ui/bridge/UITooltip";

const DsfrShell = dynamic(() => import("./DsfrShell").then(m => ({ default: m.DsfrShell })), { ssr: false });

// ---------------------------------------------------------------------------

const Section = ({ title, children }: { children: ReactNode; title: string }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-semibold">{title}</h2>
    {children}
  </section>
);

// ---------------------------------------------------------------------------

const ShowcasePage = () => {
  const theme = useUI();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Read DOM class after mount to avoid hydration mismatch (server=false, client reads actual state)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from DOM on mount, not cascading
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);
  const [modalOpen, setModalOpen] = useState(false);

  const toggleUiTheme = useCallback(() => {
    const next = theme === "Default" ? "Dsfr" : "Default";
    document.cookie = `ui-theme-dev=${next};path=/;max-age=86400`;
    location.reload();
  }, [theme]);

  const toggleDarkMode = useCallback(() => {
    const next = !darkMode;
    // shadcn
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    localStorage.setItem("theme", next ? "dark" : "light");
    // DSFR
    document.documentElement.setAttribute("data-fr-scheme", next ? "dark" : "light");
    document.documentElement.setAttribute("data-fr-theme", next ? "dark" : "light");
    setDarkMode(next);
  }, [darkMode]);

  const content = (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Showcase</h1>
        <span className="rounded-sm bg-muted px-2 py-1 text-xs font-mono">UI: {theme}</span>
        <span className="rounded-sm bg-muted px-2 py-1 text-xs font-mono">{darkMode ? "Dark" : "Light"}</span>
      </div>

      <div className="flex gap-2">
        <button onClick={toggleUiTheme} className="rounded-sm border px-3 py-1.5 text-sm font-medium hover:bg-accent">
          Switch → {theme === "Default" ? "Dsfr" : "Default"}
        </button>
        <button onClick={toggleDarkMode} className="rounded-sm border px-3 py-1.5 text-sm font-medium hover:bg-accent">
          Switch → {darkMode ? "Light" : "Dark"}
        </button>
      </div>

      <Separator />

      {/* UIButton */}
      <Section title="UIButton">
        <div className="flex flex-wrap gap-2">
          <UIButton variant="default">Primary</UIButton>
          <UIButton variant="secondary">Secondary</UIButton>
          <UIButton variant="destructive">Destructive</UIButton>
          <UIButton variant="outline">Outline</UIButton>
          <UIButton variant="ghost">Ghost</UIButton>
          <UIButton variant="link">Link</UIButton>
        </div>
        <div className="flex flex-wrap gap-2">
          <UIButton size="sm">Small</UIButton>
          <UIButton size="default">Default</UIButton>
          <UIButton size="lg">Large</UIButton>
        </div>
        <div className="flex flex-wrap gap-2">
          <UIButton disabled>Disabled</UIButton>
          <UIButton linkProps={{ href: "#" }}>With Link</UIButton>
        </div>
      </Section>

      <Separator />

      {/* UIBadge */}
      <Section title="UIBadge">
        <div className="flex flex-wrap gap-2">
          <UIBadge variant="default">Default</UIBadge>
          <UIBadge variant="secondary">Secondary</UIBadge>
          <UIBadge variant="success">Success</UIBadge>
          <UIBadge variant="warning">Warning</UIBadge>
          <UIBadge variant="destructive">Destructive</UIBadge>
          <UIBadge variant="outline">Outline</UIBadge>
        </div>
        <h3 className="text-sm font-medium mt-2">Status Colors</h3>
        <div className="flex flex-wrap gap-2">
          <UIBadge statusColor="blueFrance">Blue France</UIBadge>
          <UIBadge statusColor="greenEmeraude">Green Emeraude</UIBadge>
          <UIBadge statusColor="redMarianne">Red Marianne</UIBadge>
          <UIBadge statusColor="yellowTournesol">Yellow Tournesol</UIBadge>
          <UIBadge statusColor="purpleGlycine">Purple Glycine</UIBadge>
          <UIBadge statusColor="grey">Grey</UIBadge>
        </div>
        <h3 className="text-sm font-medium mt-2">Small</h3>
        <div className="flex flex-wrap gap-2">
          <UIBadge size="sm">Default SM</UIBadge>
          <UIBadge size="sm" variant="success">
            Success SM
          </UIBadge>
          <UIBadge size="sm" statusColor="blueFrance">
            Blue France SM
          </UIBadge>
        </div>
      </Section>

      <Separator />

      {/* UIAlert */}
      <Section title="UIAlert">
        <div className="space-y-3">
          <UIAlert variant="default" title="Info" description="This is an informational alert." />
          <UIAlert variant="success" title="Success" description="Operation completed successfully." />
          <UIAlert variant="warning" title="Warning" description="Please be careful." />
          <UIAlert variant="destructive" title="Error" description="Something went wrong." />
          <UIAlert variant="default" description="Small alert without title." />
        </div>
      </Section>

      <Separator />

      {/* UINotice */}
      <Section title="UINotice">
        <div className="space-y-3">
          <UINotice severity="info" title="Information importante" description="Un complément d'information." />
          <UINotice
            severity="info"
            title="Bandeau avec lien"
            link={{ href: "#", text: "En savoir plus" }}
            closable
            onClose={() => {}}
          />
          <UINotice severity="warning" title="Attention" description="Une action peut être requise." />
          <UINotice severity="alert" title="Alerte" description="Un problème critique a été détecté." />
        </div>
      </Section>

      <Separator />

      {/* UIInput */}
      <Section title="UIInput">
        <div className="grid gap-4 sm:grid-cols-2">
          <UIInput label="Default input" hintText="Hint text" nativeInputProps={{ placeholder: "Type here..." }} />
          <UIInput label="Error state" state="error" stateRelatedMessage="This field is required." />
          <UIInput label="Success state" state="success" stateRelatedMessage="Looks good!" />
          <UIInput label="Textarea" textArea nativeInputProps={{ placeholder: "Multi-line..." }} />
        </div>
      </Section>

      <Separator />

      {/* UILabel */}
      <Section title="UILabel">
        <div className="flex gap-4">
          <UILabel>Default label</UILabel>
          <UILabel className="font-bold">Bold label</UILabel>
        </div>
      </Section>

      <Separator />

      {/* UICard */}
      <Section title="UICard">
        <div className="grid gap-4 sm:grid-cols-2">
          <UICard title="Simple card" description="Card description" subtitle="Detail text" />
          <UICard title="With shadow" description="Card with shadow" shadow />
          <UICard title="Small card" description="Compact" size="sm" />
          <UICard title="With link" description="Clickable card" href="#" />
        </div>
      </Section>

      <Separator />

      {/* UITag */}
      <Section title="UITag">
        <div className="flex flex-wrap gap-2">
          <UITag>Default</UITag>
          <UITag size="sm">Small</UITag>
          <UITag onClick={() => alert("clicked")}>Clickable</UITag>
          <UITag as="span">As span</UITag>
        </div>
      </Section>

      <Separator />

      {/* UITooltip */}
      <Section title="UITooltip">
        <div className="flex gap-4">
          <UITooltip title="This is a tooltip">
            <span className="cursor-help underline decoration-dotted">Hover me</span>
          </UITooltip>
        </div>
      </Section>

      <Separator />

      {/* UISeparator */}
      <Section title="UISeparator">
        <UISeparator />
      </Section>

      <Separator />

      {/* UISkeleton */}
      <Section title="UISkeleton">
        <div className="space-y-2">
          <UISkeleton className="h-4 w-3/4" />
          <UISkeleton className="h-4 w-1/2" />
          <UISkeleton className="h-8 w-32" />
        </div>
      </Section>

      <Separator />

      {/* UIButtonsGroup */}
      <Section title="UIButtonsGroup">
        <UIButtonsGroup
          alignment="left"
          buttons={[
            { children: "Confirm", onClick: () => {} },
            { children: "Cancel", onClick: () => {} },
          ]}
        />
      </Section>

      <Separator />

      {/* UIModal (Default only) */}
      <Section title="UIModal (Default only)">
        <UIButton onClick={() => setModalOpen(true)}>Open modal</UIButton>
        <UIModal title="Example modal" open={modalOpen} onClose={() => setModalOpen(false)}>
          <p>Modal content goes here.</p>
        </UIModal>
      </Section>

      <Separator />

      {/* UITable (Default only) */}
      <Section title="UITable (Default only)">
        <UITable
          header={[{ children: "Name" }, { children: "Role" }, { children: "Status" }]}
          body={[
            [{ children: "Alice" }, { children: "Admin" }, { children: <UIBadge variant="success">Active</UIBadge> }],
            [{ children: "Bob" }, { children: "User" }, { children: <UIBadge variant="warning">Pending</UIBadge> }],
          ]}
        />
      </Section>
    </div>
  );

  if (theme === "Dsfr") {
    return <DsfrShell lang="fr">{content}</DsfrShell>;
  }

  return content;
};

export default ShowcasePage;
