import { LayoutDashboard, Palette, Wrench, Target } from "lucide-react";
import { type BathroomInsight } from "@/data/products";

const iconMap = {
  layout: LayoutDashboard,
  style: Palette,
  fixture: Wrench,
  scope: Target,
};

interface Props {
  insights: BathroomInsight[];
  compact?: boolean;
}

const BathroomInsights = ({ insights, compact = false }: Props) => {
  if (insights.length === 0) return null;

  if (compact) {
    return (
      <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Based on your bathroom</p>
        <div className="flex flex-wrap gap-2">
          {insights.map((ins) => {
            const Icon = iconMap[ins.icon];
            return (
              <span key={ins.label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/60 rounded-full px-3 py-1">
                <Icon className="h-3 w-3 text-primary flex-shrink-0" />
                {ins.label}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-6 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Based on Your Bathroom</p>
        <p className="text-sm text-muted-foreground">Based on the room details you provided.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((ins) => {
          const Icon = iconMap[ins.icon];
          return (
            <div key={ins.label} className="flex items-start gap-3">
              <div className="mt-0.5 h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{ins.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{ins.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BathroomInsights;
