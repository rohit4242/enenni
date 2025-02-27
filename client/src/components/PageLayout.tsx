import { cn } from "../lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  heading?: string;
  subheading?: string;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function PageLayout({
  children,
  heading,
  subheading,
  actions,
  sidebar,
}: PageLayoutProps) {
  return (
    <div className="space-y-6 mt-6 md:mt-2 md:p-10">
      {(heading || subheading || actions) && (
        <div className="flex items-center justify-between ">
          {(heading || subheading) && (
            <div className="space-y-1">
              {heading && (
                
                <h1 className="text-2xl font-semibold tracking-tight">
                  {heading}
                </h1>
              )}
              {subheading && (
                <p className="text-sm text-muted-foreground">{subheading}</p>
              )}
            </div>
          )}
          {actions && <div className="ml-auto">{actions}</div>}
        </div>
      )}
      <div className="flex flex-col gap-8 lg:flex-row">
        {sidebar && (
          <aside className="lg:w-1/5">
            {sidebar}
          </aside>
        )}
        <div className={cn("flex-1", sidebar && "lg:max-w-2xl")}>
          {children}
        </div>
      </div>
    </div>
  );
} 