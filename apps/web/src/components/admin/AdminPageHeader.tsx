import { type ReactNode } from "react";

interface AdminPageHeaderProps {
  actions?: ReactNode;
  children?: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}

export const AdminPageHeader = ({ title, description, actions, children }: AdminPageHeaderProps) => (
  <div className="mb-6">
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
    {children}
  </div>
);
