const PageHeader = ({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) => (
  <div className="flex items-start justify-between mb-8">
    <div>
      <h1 className="text-2xl font-mono font-bold text-foreground tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default PageHeader;
