"use client";

import { Button, Switch } from "@roadmaps-faciles/ui";
import { ChevronDown, Wrench } from "lucide-react";
import { useState, useTransition } from "react";

export interface DevToggle {
  defaultValue: boolean;
  description: string;
  id: string;
  label: string;
  onChangeAction: (value: boolean) => void;
}

export interface DevAction {
  description: string;
  id: string;
  label: string;
  onClickAction: () => Promise<string | void>;
  variant?: "default" | "destructive" | "outline";
}

interface DevToolsPanelProps {
  actions?: DevAction[];
  toggles: DevToggle[];
}

export const DevToolsPanel = ({ toggles, actions = [] }: DevToolsPanelProps) => {
  const [expanded, setExpanded] = useState(false);

  if (toggles.length === 0 && actions.length === 0) return null;

  return (
    <div className="rounded-lg border border-orange-500/30 bg-orange-500/5">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 p-2.5 text-left"
      >
        <Wrench className="size-3.5 text-orange-500" />
        <span className="flex-1 text-[10px] font-bold uppercase tracking-wide text-orange-500">Dev Tools</span>
        <ChevronDown className={`size-3 text-orange-500/60 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="space-y-2 border-t border-orange-500/20 px-2.5 py-2">
          {toggles.map(toggle => (
            <DevToggleItem key={toggle.id} toggle={toggle} />
          ))}
          {actions.map(action => (
            <DevActionItem key={action.id} action={action} />
          ))}
        </div>
      )}
    </div>
  );
};

const DevToggleItem = ({ toggle }: { toggle: DevToggle }) => {
  const [value, setValue] = useState(toggle.defaultValue);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-sidebar-foreground/80">{toggle.label}</p>
        <p className="truncate text-[9px] text-sidebar-foreground/50">{toggle.description}</p>
      </div>
      <Switch
        checked={value}
        onCheckedChange={checked => {
          setValue(checked);
          toggle.onChangeAction(checked);
        }}
        className="scale-75"
      />
    </div>
  );
};

const DevActionItem = ({ action }: { action: DevAction }) => {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string>();

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-sidebar-foreground/80">{action.label}</p>
          <p className="truncate text-[9px] text-sidebar-foreground/50">{action.description}</p>
        </div>
        <Button
          variant={action.variant ?? "outline"}
          size="sm"
          disabled={isPending}
          className="h-6 shrink-0 px-2 text-[10px]"
          onClick={() => {
            startTransition(async () => {
              const msg = await action.onClickAction();
              if (msg) setResult(msg);
              else window.location.reload();
            });
          }}
        >
          {isPending ? "..." : action.label}
        </Button>
      </div>
      {result && <p className="text-[9px] text-orange-600">{result}</p>}
    </div>
  );
};
