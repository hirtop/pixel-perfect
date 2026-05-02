import { useFlow } from "../FlowContext";
import { FlowCard, PrimaryNav, StepHeader } from "../ui";
import type { StyleId } from "../types";

const STYLES: { id: StyleId; name: string; blurb: string }[] = [
  { id: "modern", name: "Modern", blurb: "Clean lines, warm woods, matte finishes." },
  { id: "classic", name: "Classic", blurb: "Subway tile, polished chrome, timeless palette." },
  { id: "spa", name: "Spa", blurb: "Stone textures, soft light, layered greenery." },
  { id: "minimal", name: "Minimal", blurb: "Reduced palette, hidden hardware, calm geometry." },
];

const Style = () => {
  const { state, setStyle } = useFlow();
  return (
    <div>
      <StepHeader eyebrow="Step 01" title="Pick a style." description="This sets the visual direction. You can refine specifics later." />
      <div className="grid gap-4 md:grid-cols-2">
        {STYLES.map((s) => (
          <FlowCard key={s.id} selected={state.style === s.id} onClick={() => setStyle(s.id)}>
            <p className="font-medium text-foreground">{s.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.blurb}</p>
          </FlowCard>
        ))}
      </div>
      <PrimaryNav back="/remodel-flow/start" next="/remodel-flow/tier" disabled={!state.style} />
    </div>
  );
};

export default Style;
