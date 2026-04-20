import { useState, useRef, useCallback } from "react";
import { createRoot, type Root } from "react-dom/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, Download, Check, Loader2, Home } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import AgreementPrintDocument, { type AgreementPrintData, type AgreementReferencePhoto } from "@/components/agreement/AgreementPrintDocument";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProject } from "@/contexts/ProjectContext";
import { supabase } from "@/integrations/supabase/client";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4" data-pdf-section>
    <h2 className="font-heading text-xl text-foreground border-b border-border pb-2">{title}</h2>
    {children}
  </div>
);

const Field = ({ label, defaultValue = "", type = "text", name }: { label: string; defaultValue?: string; type?: string; name?: string }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    <Input defaultValue={defaultValue} type={type} name={name} className="h-10 text-sm border-border/60 bg-background" />
  </div>
);

const scopeDefaults = [
  "Demolition and debris removal",
  "Plumbing modifications as needed",
  "Electrical modifications as needed",
  "Tile and flooring installation (large-format porcelain, warm gray)",
  "Vanity, sink, faucet, and toilet installation (floating oak vanity, brushed nickel fixtures)",
  "Shower hardware and glass installation",
  "Painting of walls and ceiling",
  "Final accessories, mirror, lighting, and cleanup",
];

type AgreementFormData = Record<string, unknown>;

const toStringValue = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const toStringArray = (value: unknown, fallback: string[] = []) =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : fallback;

const addCanvasToPdf = ({
  canvas,
  pdf,
  currentY,
  marginMM,
  contentWidthMM,
  pageHeightMM,
}: {
  canvas: HTMLCanvasElement;
  pdf: jsPDF;
  currentY: number;
  marginMM: number;
  contentWidthMM: number;
  pageHeightMM: number;
}) => {
  const maxY = pageHeightMM - marginMM;
  const contentHeightMM = pageHeightMM - marginMM * 2;
  const fullHeightMM = (canvas.height * contentWidthMM) / canvas.width;
  const remainingMM = maxY - currentY;

  if (fullHeightMM <= remainingMM) {
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", marginMM, currentY, contentWidthMM, fullHeightMM);
    return currentY + fullHeightMM;
  }

  if (fullHeightMM <= contentHeightMM) {
    pdf.addPage();
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", marginMM, marginMM, contentWidthMM, fullHeightMM);
    return marginMM + fullHeightMM;
  }

  let nextY = currentY;

  if (remainingMM < 32) {
    pdf.addPage();
    nextY = marginMM;
  }

  let sourceY = 0;

  while (sourceY < canvas.height) {
    const availableHeightMM = maxY - nextY;
    const availableHeightPx = Math.max(1, Math.floor((availableHeightMM * canvas.width) / contentWidthMM));
    const sliceHeightPx = Math.min(availableHeightPx, canvas.height - sourceY);
    const sliceCanvas = document.createElement("canvas");
    const context = sliceCanvas.getContext("2d");

    if (!context) {
      throw new Error("Could not prepare the PDF export canvas.");
    }

    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeightPx;
    context.drawImage(canvas, 0, sourceY, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

    const sliceHeightMM = (sliceHeightPx * contentWidthMM) / canvas.width;
    pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", marginMM, nextY, contentWidthMM, sliceHeightMM);

    sourceY += sliceHeightPx;
    nextY += sliceHeightMM;

    if (sourceY < canvas.height) {
      pdf.addPage();
      nextY = marginMM;
    }
  }

  return nextY;
};

const fetchPhotoAsDataUrl = async (storagePath: string): Promise<string | null> => {
  try {
    const { data: signed, error: signError } = await supabase.storage
      .from("bathroom-photos")
      .createSignedUrl(storagePath, 300);
    if (signError || !signed?.signedUrl) return null;

    const res = await fetch(signed.signedUrl);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Could not embed reference photo:", storagePath, err);
    return null;
  }
};

const Agreement = () => {
  const { project, updateProject, saveProject, markStepComplete, isSaving } = useProject();
  const formRef = useRef<HTMLFormElement>(null);

  const saved = (project.agreement_data ?? {}) as AgreementFormData;
  const [scopeItems] = useState(
    toStringArray(saved.scope_items, scopeDefaults)
  );

  const gatherFormData = useCallback(() => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const data: AgreementFormData = {};
    fd.forEach((v, k) => { data[k] = v; });

    const scopeInputs = formRef.current.querySelectorAll<HTMLInputElement>('[data-scope]');
    const items: string[] = [];
    scopeInputs.forEach((el) => items.push(el.value));
    data.scope_items = items;

    return data;
  }, []);

  const buildPrintData = useCallback((rawData: AgreementFormData, referencePhotos: AgreementReferencePhoto[] = []): AgreementPrintData => ({
    clientName: toStringValue(rawData.client_name),
    projectAddress: toStringValue(rawData.project_address),
    roomType: toStringValue(rawData.room_type, project.bathroom_type || "Primary Bathroom"),
    projectName: toStringValue(rawData.project_name, project.name),
    businessName: toStringValue(rawData.business_name),
    tradeType: toStringValue(rawData.trade_type),
    phone: toStringValue(rawData.phone),
    email: toStringValue(rawData.email),
    license: toStringValue(rawData.license),
    scopeItems: toStringArray(rawData.scope_items, scopeDefaults),
    ownerMaterials: toStringValue(
      rawData.owner_materials,
      `All fixture and finish materials as specified in the BOBOX ${project.selected_package?.name || "Balanced"} package (vanity, tile, faucet, lighting, mirror, toilet, shower hardware). Finish direction: ${project.style_preferences?.finish || "Brushed Nickel"}.`
    ),
    contractorMaterials: toStringValue(
      rawData.contractor_materials,
      "General construction materials including adhesives, grout, waterproofing membrane, backer board, fasteners, and other consumables required for installation."
    ),
    deposit: toStringValue(rawData.deposit, "30% upon signing"),
    progress: toStringValue(rawData.progress, "40% at midpoint"),
    finalPayment: toStringValue(rawData.final_payment, "30% upon completion"),
    startDate: toStringValue(rawData.start_date),
    endDate: toStringValue(rawData.end_date),
    changeOrders: toStringValue(
      rawData.change_orders,
      "Any additional work, material changes, or modifications to the agreed scope must be documented in writing and approved by both parties before work proceeds. Change orders may affect the project timeline and total cost."
    ),
    cleanup: toStringValue(
      rawData.cleanup,
      "Contractor will remove all debris and leave the work area in broom-clean condition upon project completion."
    ),
    warranty: toStringValue(
      rawData.warranty,
      "Contractor warrants labor and workmanship for a period of one (1) year from the date of project completion. Manufacturer warranties on materials apply separately."
    ),
    clientPrintedName: toStringValue(rawData.client_printed_name),
    clientSignDate: toStringValue(rawData.client_sign_date),
    contractorPrintedName: toStringValue(rawData.contractor_printed_name),
    contractorSignDate: toStringValue(rawData.contractor_sign_date),
    referencePhotos,
    homeownerNotes: project.photos.notes?.trim() || undefined,
  }), [project]);

  const resolveReferencePhotos = useCallback(async (): Promise<AgreementReferencePhoto[]> => {
    const meta = project.photos.metadata.filter((p) => p.storage_path);
    if (meta.length === 0) return [];

    const resolved = await Promise.all(
      meta.map(async (p) => {
        const dataUrl = await fetchPhotoAsDataUrl(p.storage_path!);
        return dataUrl ? { name: p.name, dataUrl } : null;
      }),
    );

    return resolved.filter((p): p is AgreementReferencePhoto => p !== null);
  }, [project.photos.metadata]);

  const handleSave = async () => {
    const data = gatherFormData();
    if (data) updateProject({ agreement_data: data });
    markStepComplete("agreement");
    await saveProject();
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    const rawData = gatherFormData() ?? saved;
    updateProject({ agreement_data: rawData });

    setIsGenerating(true);
    toast("Preparing PDF…", { description: "Rendering your agreement." });

    let printRoot: Root | null = null;
    let printHost: HTMLDivElement | null = null;

    try {
      const printData = buildPrintData(rawData);
      const pageWidthMM = 210;
      const pageHeightMM = 297;
      const marginMM = 12;
      const contentWidthMM = pageWidthMM - marginMM * 2;
      const sectionGapMM = 4;
      const printWidthPx = Math.round((contentWidthMM / 25.4) * 96);

      printHost = document.createElement("div");
      Object.assign(printHost.style, {
        position: "fixed",
        top: "0",
        left: "-200vw",
        width: `${printWidthPx}px`,
        minWidth: `${printWidthPx}px`,
        maxWidth: `${printWidthPx}px`,
        opacity: "0",
        pointerEvents: "none",
        zIndex: "-1",
        overflow: "visible",
      });
      document.body.appendChild(printHost);

      printRoot = createRoot(printHost);
      printRoot.render(<AgreementPrintDocument data={printData} widthPx={printWidthPx} />);

      await document.fonts?.ready;
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      const printElement = printHost.querySelector("[data-agreement-print-root]") as HTMLElement | null;
      if (!printElement) {
        throw new Error("Could not render the agreement print layout.");
      }

      const sections = Array.from(printElement.querySelectorAll<HTMLElement>("[data-pdf-section]"));
      if (!sections.length) {
        throw new Error("Could not find printable agreement sections.");
      }

      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      let currentY = marginMM;

      for (let index = 0; index < sections.length; index += 1) {
        const section = sections[index];
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: printWidthPx,
          windowWidth: printWidthPx,
          scrollX: 0,
          scrollY: 0,
        });

        currentY = addCanvasToPdf({
          canvas,
          pdf,
          currentY,
          marginMM,
          contentWidthMM,
          pageHeightMM,
        });

        if (index < sections.length - 1) {
          if (currentY + sectionGapMM > pageHeightMM - marginMM) {
            pdf.addPage();
            currentY = marginMM;
          } else {
            currentY += sectionGapMM;
          }
        }
      }

      pdf.save("bobox-remodel-agreement.pdf");
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("PDF generation failed. Please try again.");
    } finally {
      printRoot?.unmount();
      printHost?.remove();
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/subcontractors" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Subcontractors
            </Link>
            <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" /> Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Document</p>
            <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">Starter Remodel Agreement</h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              Use this as a simple starting agreement for your remodel project and review it before work begins.
            </p>
          </div>

          <div className="rounded-xl border border-accent/30 bg-accent/5 px-5 py-4 mb-10 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              This is a general starter template for planning purposes only and may need review for local legal or licensing requirements.
            </p>
          </div>

          <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
            <div id="agreement-content" className="rounded-2xl border border-border bg-card p-8 md:p-10 space-y-10 shadow-sm">

              <Section title="Client Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Client Name" name="client_name" defaultValue={(saved.client_name as string) || ""} />
                  <Field label="Project Address" name="project_address" defaultValue={(saved.project_address as string) || ""} />
                  <Field label="Room Type" name="room_type" defaultValue={(saved.room_type as string) || project.bathroom_type || "Primary Bathroom"} />
                  <Field label="Project Name" name="project_name" defaultValue={(saved.project_name as string) || project.name} />
                </div>
              </Section>

              <Section title="Contractor / Subcontractor Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Business Name" name="business_name" defaultValue={(saved.business_name as string) || ""} />
                  <Field label="Trade Type" name="trade_type" defaultValue={(saved.trade_type as string) || ""} />
                  <Field label="Phone" type="tel" name="phone" defaultValue={(saved.phone as string) || ""} />
                  <Field label="Email" type="email" name="email" defaultValue={(saved.email as string) || ""} />
                  <Field label="License Number (if applicable)" name="license" defaultValue={(saved.license as string) || ""} />
                </div>
              </Section>

              <Section title="Scope of Work">
                <p className="text-xs text-muted-foreground">Edit or remove items as needed for your project.</p>
                <div className="space-y-2">
                  {scopeItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-primary font-bold w-5 text-right flex-shrink-0">{i + 1}.</span>
                      <Input defaultValue={item} data-scope className="h-9 text-sm border-border/60 bg-background" />
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Materials">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Owner-Supplied Materials</Label>
                    <Textarea name="owner_materials" defaultValue={(saved.owner_materials as string) || `All fixture and finish materials as specified in the BOBOX ${project.selected_package.name || "Balanced"} package (vanity, tile, faucet, lighting, mirror, toilet, shower hardware). Finish direction: ${project.style_preferences.finish || "Brushed Nickel"}.`} className="min-h-[80px] text-sm resize-none border-border/60 bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Contractor-Supplied Materials</Label>
                    <Textarea name="contractor_materials" defaultValue={(saved.contractor_materials as string) || "General construction materials including adhesives, grout, waterproofing membrane, backer board, fasteners, and other consumables required for installation."} className="min-h-[80px] text-sm resize-none border-border/60 bg-background" />
                  </div>
                </div>
              </Section>

              <Section title="Payment Terms">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Deposit" name="deposit" defaultValue={(saved.deposit as string) || "30% upon signing"} />
                  <Field label="Progress Payment" name="progress" defaultValue={(saved.progress as string) || "40% at midpoint"} />
                  <Field label="Final Payment" name="final_payment" defaultValue={(saved.final_payment as string) || "30% upon completion"} />
                </div>
              </Section>

              <Section title="Timeline">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Estimated Start Date" type="date" name="start_date" defaultValue={(saved.start_date as string) || ""} />
                  <Field label="Estimated Completion Date" type="date" name="end_date" defaultValue={(saved.end_date as string) || ""} />
                </div>
              </Section>

              <Section title="Change Orders">
                <Textarea name="change_orders" defaultValue={(saved.change_orders as string) || "Any additional work, material changes, or modifications to the agreed scope must be documented in writing and approved by both parties before work proceeds. Change orders may affect the project timeline and total cost."} className="min-h-[80px] text-sm resize-none border-border/60 bg-background" />
              </Section>

              <Section title="Cleanup and Warranty">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Cleanup</Label>
                    <Textarea name="cleanup" defaultValue={(saved.cleanup as string) || "Contractor will remove all debris and leave the work area in broom-clean condition upon project completion."} className="min-h-[60px] text-sm resize-none border-border/60 bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Warranty</Label>
                    <Textarea name="warranty" defaultValue={(saved.warranty as string) || "Contractor warrants labor and workmanship for a period of one (1) year from the date of project completion. Manufacturer warranties on materials apply separately."} className="min-h-[60px] text-sm resize-none border-border/60 bg-background" />
                  </div>
                </div>
              </Section>

              <Section title="Signatures">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-6">
                    <div className="border-b border-foreground/20 pb-1">
                      <Label className="text-xs text-muted-foreground">Client Signature</Label>
                    </div>
                    <Field label="Printed Name" name="client_printed_name" defaultValue={(saved.client_printed_name as string) || ""} />
                    <Field label="Date" type="date" name="client_sign_date" defaultValue={(saved.client_sign_date as string) || ""} />
                  </div>
                  <div className="space-y-6">
                    <div className="border-b border-foreground/20 pb-1">
                      <Label className="text-xs text-muted-foreground">Contractor Signature</Label>
                    </div>
                    <Field label="Printed Name" name="contractor_printed_name" defaultValue={(saved.contractor_printed_name as string) || ""} />
                    <Field label="Date" type="date" name="contractor_sign_date" defaultValue={(saved.contractor_sign_date as string) || ""} />
                  </div>
                </div>
              </Section>
            </div>
          </form>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
            <Button size="lg" className="w-full sm:w-auto px-10 h-12 text-base font-semibold rounded-lg" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : "Save Agreement Template"}
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 text-base rounded-lg gap-2" onClick={handleDownload} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} {isGenerating ? "Generating…" : "Download as PDF"}
            </Button>
            <Link to="/subcontractors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Subcontractors
            </Link>
          </div>

          {/* Completion block */}
          <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 md:p-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading text-xl text-foreground mb-2">You've completed your BOBOX Remodel plan</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
              Your project setup, package selection, customization, workflow, and starter agreement are all in one place. You're ready to move forward with confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="px-8 h-11 text-sm font-semibold rounded-lg" asChild>
                <Link to="/summary">View Project Summary</Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 h-11 text-sm rounded-lg" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Agreement;
