import { Badge, cn, Separator } from "@roadmaps-faciles/ui";
import Link from "next/link";

interface FooterColumn {
  links: Array<{ href: string; text: string }>;
  title: string;
}

interface FooterLink {
  href: string;
  text: string;
}

export interface FooterProps {
  badges?: React.ReactNode;
  bottomLinks?: FooterLink[];
  brandIcon?: React.ReactNode;
  brandName?: string;
  className?: string;
  columns?: FooterColumn[];
  contentDescription?: React.ReactNode;
  copyright?: string;
  id?: string;
  license?: React.ReactNode;
  serviceName?: string;
  variant?: "root" | "tenant";
  version?: string;
}

/**
 * Unified footer — root and tenant variants.
 *
 * Root: max-w-7xl, multi-column links, brand icon, badges, version badge.
 * Tenant: container, compact single-row bottom links.
 */
export const Footer = ({
  id,
  brandName,
  brandIcon,
  serviceName,
  contentDescription,
  columns,
  badges,
  bottomLinks,
  copyright,
  license,
  version,
  className,
  variant = "tenant",
}: FooterProps) => {
  const isRoot = variant === "root";

  if (isRoot) {
    return (
      <footer id={id} className={cn("border-t bg-muted/50", className)}>
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-20">
          <div className="mb-20 grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
            {/* Brand column */}
            <div className="col-span-2">
              <div className="mb-6 flex items-center gap-2 text-primary">
                {brandIcon}
                <span className="text-lg font-bold tracking-tight">{brandName}</span>
              </div>
              {contentDescription && (
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{contentDescription}</p>
              )}
              {badges && <div className="mt-8 flex gap-3">{badges}</div>}
              {version && (
                <div className="mt-4">
                  <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                    {version}
                  </Badge>
                </div>
              )}
            </div>

            {/* Link columns */}
            {columns?.map(column => (
              <div key={column.title}>
                <h4 className="mb-6 text-sm font-semibold">{column.title}</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {column.links.map(link => (
                    <li key={link.href + link.text}>
                      <Link
                        href={link.href}
                        className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex flex-col items-center justify-between gap-4 pt-8 md:flex-row">
            <div className="flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:gap-4">
              {copyright && <p>{copyright}</p>}
              {license && <p>{license}</p>}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer id={id} className={cn("border-t bg-muted/40", className)}>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold">{serviceName}</p>
            {contentDescription && <p className="mt-1 max-w-md text-sm text-muted-foreground">{contentDescription}</p>}
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-4">
            {bottomLinks?.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {link.text}
              </Link>
            ))}
          </div>
          {license && <p>{license}</p>}
        </div>
      </div>
    </footer>
  );
};
