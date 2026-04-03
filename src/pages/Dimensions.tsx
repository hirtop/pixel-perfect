import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const DimensionInput = ({
  label,
  ftValue,
  inValue,
  onFtChange,
  onInChange,
}: {
  label: string;
  ftValue: string;
  inValue: string;
  onFtChange: (v: string) => void;
  onInChange: (v: string) => void;
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          type="number"
          placeholder="0"
          value={ftValue}
          onChange={(e) => onFtChange(e.target.value)}
          className="h-12 text-base pr-10"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">ft</span>
      </div>
      <div className="relative flex-1">
        <Input
          type="number"
          placeholder="0"
          value={inValue}
          onChange={(e) => onInChange(e.target.value)}
          className="h-12 text-base pr-10"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">in</span>
      </div>
    </div>
  </div>
);

const FloorDiagram = () => (
  <div className="flex items-center justify-center py-6">
    <svg viewBox="0 0 240 200" className="w-52 h-auto text-foreground" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Floor rectangle */}
      <rect x="40" y="40" width="160" height="120" rx="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.3" />
      <rect x="40" y="40" width="160" height="120" rx="4" stroke="hsl(var(--primary))" strokeWidth="1.5" fill="hsl(var(--primary))" fillOpacity="0.04" />

      {/* Width arrow - top */}
      <line x1="50" y1="28" x2="190" y2="28" stroke="hsl(var(--primary))" strokeWidth="1" />
      <polygon points="50,25 50,31 42,28" fill="hsl(var(--primary))" />
      <polygon points="190,25 190,31 198,28" fill="hsl(var(--primary))" />
      <text x="120" y="18" textAnchor="middle" className="text-[10px] font-body font-medium" fill="hsl(var(--primary))">Width</text>

      {/* Length arrow - right */}
      <line x1="212" y1="50" x2="212" y2="150" stroke="hsl(var(--primary))" strokeWidth="1" />
      <polygon points="209,50 215,50 212,42" fill="hsl(var(--primary))" />
      <polygon points="209,150 215,150 212,158" fill="hsl(var(--primary))" />
      <text x="226" y="104" textAnchor="middle" className="text-[10px] font-body font-medium" fill="hsl(var(--primary))" transform="rotate(90 226 104)">Length</text>

      {/* Height indicator - left */}
      <line x1="28" y1="50" x2="28" y2="150" stroke="hsl(var(--accent))" strokeWidth="1" strokeDasharray="4 2" />
      <polygon points="25,50 31,50 28,42" fill="hsl(var(--accent))" />
      <polygon points="25,150 31,150 28,158" fill="hsl(var(--accent))" />
      <text x="14" y="104" textAnchor="middle" className="text-[10px] font-body font-medium" fill="hsl(var(--accent))" transform="rotate(-90 14 104)">Height</text>

      {/* Door indicator */}
      <rect x="130" y="153" width="30" height="7" rx="2" fill="hsl(var(--primary))" fillOpacity="0.15" stroke="hsl(var(--primary))" strokeWidth="1" />
      <text x="145" y="175" textAnchor="middle" className="text-[8px] font-body" fill="currentColor" opacity="0.4">door</text>

      {/* Window indicator */}
      <rect x="40" y="75" width="7" height="24" rx="2" fill="hsl(var(--accent))" fillOpacity="0.15" stroke="hsl(var(--accent))" strokeWidth="1" />
      <text x="20" y="90" textAnchor="middle" className="text-[8px] font-body" fill="currentColor" opacity="0.4">window</text>
    </svg>
  </div>
);

const Dimensions = () => {
  const [widthFt, setWidthFt] = useState("");
  const [widthIn, setWidthIn] = useState("");
  const [lengthFt, setLengthFt] = useState("");
  const [lengthIn, setLengthIn] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [doorNotes, setDoorNotes] = useState("");
  const [windowNotes, setWindowNotes] = useState("");
  const [layoutNotes, setLayoutNotes] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
              Enter Bathroom Dimensions
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              These basic measurements help BOBOX generate remodel options that better fit your space.
            </p>
          </div>

          {/* Diagram */}
          <FloorDiagram />

          <div className="space-y-8">
            {/* Dimension inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DimensionInput label="Room Width" ftValue={widthFt} inValue={widthIn} onFtChange={setWidthFt} onInChange={setWidthIn} />
              <DimensionInput label="Room Length" ftValue={lengthFt} inValue={lengthIn} onFtChange={setLengthFt} onInChange={setLengthIn} />
              <DimensionInput label="Ceiling Height" ftValue={heightFt} inValue={heightIn} onFtChange={setHeightFt} onInChange={setHeightIn} />
            </div>

            {/* Optional details */}
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Additional Notes</p>
                <p className="text-xs text-muted-foreground">Optional — anything that might affect layout or planning.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Door location / notes</Label>
                  <Input
                    placeholder="e.g. door on the left wall"
                    value={doorNotes}
                    onChange={(e) => setDoorNotes(e.target.value)}
                    className="h-11 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Window notes</Label>
                  <Input
                    placeholder="e.g. one window above the tub"
                    value={windowNotes}
                    onChange={(e) => setWindowNotes(e.target.value)}
                    className="h-11 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Awkward corners or layout details</Label>
                <Textarea
                  placeholder="e.g. small alcove behind the door, sloped ceiling on one side"
                  value={layoutNotes}
                  onChange={(e) => setLayoutNotes(e.target.value)}
                  className="min-h-[80px] text-sm resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-5">
              <Button size="lg" className="w-full sm:w-auto px-10 h-12 text-base font-semibold rounded-lg">
                Continue
              </Button>
              <Link to="/upload" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Back
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dimensions;
