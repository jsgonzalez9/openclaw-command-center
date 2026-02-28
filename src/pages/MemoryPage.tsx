import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { mockMemories } from "@/data/mock-data";
import { Search, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const MemoryPage = () => {
  const [search, setSearch] = useState("");

  const filtered = mockMemories.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <PageHeader title="Memory System" subtitle="Searchable knowledge archive — AI-generated context and recall">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </PageHeader>
      <div className="space-y-4">
        {filtered.map((memory) => (
          <div key={memory.id} className="rounded-lg border border-border bg-card p-5 card-glow animate-slide-in hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">{memory.title}</h3>
              <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap ml-4">
                {new Date(memory.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{memory.content}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="h-3 w-3 text-muted-foreground" />
                {memory.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] border-border text-muted-foreground">
                    {tag}
                  </Badge>
                ))}
              </div>
              <span className="text-[10px] text-primary font-mono">{memory.source}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No memories match your search.</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MemoryPage;
