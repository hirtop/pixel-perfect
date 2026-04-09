import type { CSSProperties, ReactNode } from "react";

export type AgreementPrintData = {
  clientName: string;
  projectAddress: string;
  roomType: string;
  projectName: string;
  businessName: string;
  tradeType: string;
  phone: string;
  email: string;
  license: string;
  scopeItems: string[];
  ownerMaterials: string;
  contractorMaterials: string;
  deposit: string;
  progress: string;
  finalPayment: string;
  startDate: string;
  endDate: string;
  changeOrders: string;
  cleanup: string;
  warranty: string;
  clientPrintedName: string;
  clientSignDate: string;
  contractorPrintedName: string;
  contractorSignDate: string;
};

const sectionStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  overflow: "visible",
};

const twoColumnGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px 16px",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  overflow: "visible",
};

const threeColumnGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "12px 16px",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  overflow: "visible",
};

const labelStyle: CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "hsl(var(--muted-foreground))",
  marginBottom: "6px",
};

const valueStyle: CSSProperties = {
  display: "block",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  minHeight: "20px",
  fontSize: "13px",
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  boxSizing: "border-box",
  overflow: "visible",
};

const blockStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  padding: "12px 14px",
  boxSizing: "border-box",
  backgroundColor: "hsl(0 0% 100%)",
  overflow: "visible",
};

const mutedBlockStyle: CSSProperties = {
  ...blockStyle,
  backgroundColor: "hsl(var(--muted) / 0.28)",
};

const sectionHeadingStyle: CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: "20px",
  lineHeight: 1.2,
  paddingBottom: "8px",
  borderBottom: "1px solid hsl(var(--border))",
  marginBottom: "16px",
};

const signatureLineStyle: CSSProperties = {
  borderBottom: "1px solid hsl(var(--border))",
  height: "28px",
  marginBottom: "14px",
};

const emptyValue = (value: string) => value.trim() || "—";

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section data-pdf-section style={sectionStyle}>
    <h2 style={sectionHeadingStyle}>{title}</h2>
    {children}
  </section>
);

const FieldBlock = ({ label, value }: { label: string; value: string }) => (
  <div style={blockStyle}>
    <div style={labelStyle}>{label}</div>
    <div style={valueStyle}>{emptyValue(value)}</div>
  </div>
);

const TextBlock = ({ label, value }: { label: string; value: string }) => (
  <div style={mutedBlockStyle}>
    <div style={labelStyle}>{label}</div>
    <div style={valueStyle}>{emptyValue(value)}</div>
  </div>
);

export const AgreementPrintDocument = ({ data, widthPx }: { data: AgreementPrintData; widthPx: number }) => {
  const shellStyle: CSSProperties = {
    width: `${widthPx}px`,
    minWidth: `${widthPx}px`,
    maxWidth: `${widthPx}px`,
    boxSizing: "border-box",
    backgroundColor: "hsl(0 0% 100%)",
    color: "hsl(var(--foreground))",
    fontFamily: "var(--font-body)",
    whiteSpace: "normal",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    transform: "none",
    overflow: "visible",
  };

  return (
    <article data-agreement-print-root style={shellStyle}>
      <div style={{ width: "100%", maxWidth: "100%", minWidth: 0, padding: 0, boxSizing: "border-box", overflow: "visible" }}>
        <section data-pdf-section style={{ ...sectionStyle, marginBottom: "28px" }}>
          <div style={{ marginBottom: "18px" }}>
            <p style={{ ...labelStyle, color: "hsl(var(--primary))", marginBottom: "8px" }}>Document</p>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "32px",
                lineHeight: 1.1,
                margin: 0,
                marginBottom: "12px",
              }}
            >
              Starter Remodel Agreement
            </h1>
            <p style={{ ...valueStyle, color: "hsl(var(--muted-foreground))" }}>
              Use this as a simple starting agreement for your remodel project and review it before work begins.
            </p>
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: "100%",
              minWidth: 0,
              border: "1px solid hsl(var(--accent) / 0.35)",
              borderRadius: "14px",
              padding: "14px 16px",
              backgroundColor: "hsl(var(--accent) / 0.08)",
              boxSizing: "border-box",
              overflow: "visible",
            }}
          >
            <p style={{ ...valueStyle, fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>
              This is a general starter template for planning purposes only and may need review for local legal or licensing requirements.
            </p>
          </div>
        </section>

        <div style={{ display: "grid", gap: "28px", width: "100%", maxWidth: "100%", minWidth: 0, overflow: "visible" }}>
          <Section title="Client Information">
            <div style={twoColumnGridStyle}>
              <FieldBlock label="Client Name" value={data.clientName} />
              <FieldBlock label="Project Address" value={data.projectAddress} />
              <FieldBlock label="Room Type" value={data.roomType} />
              <FieldBlock label="Project Name" value={data.projectName} />
            </div>
          </Section>

          <Section title="Contractor / Subcontractor Information">
            <div style={twoColumnGridStyle}>
              <FieldBlock label="Business Name" value={data.businessName} />
              <FieldBlock label="Trade Type" value={data.tradeType} />
              <FieldBlock label="Phone" value={data.phone} />
              <FieldBlock label="Email" value={data.email} />
              <FieldBlock label="License Number" value={data.license} />
            </div>
          </Section>

          <Section title="Scope of Work">
            <div style={{ display: "grid", gap: "10px", width: "100%", maxWidth: "100%", minWidth: 0, overflow: "visible" }}>
              {data.scopeItems.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  style={{
                    ...mutedBlockStyle,
                    display: "grid",
                    gridTemplateColumns: "24px minmax(0, 1fr)",
                    gap: "10px",
                    alignItems: "start",
                  }}
                >
                  <div style={{ ...labelStyle, marginBottom: 0, color: "hsl(var(--primary))" }}>{index + 1}.</div>
                  <div style={valueStyle}>{emptyValue(item)}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Materials">
            <div style={{ display: "grid", gap: "12px", width: "100%", maxWidth: "100%", minWidth: 0, overflow: "visible" }}>
              <TextBlock label="Owner-Supplied Materials" value={data.ownerMaterials} />
              <TextBlock label="Contractor-Supplied Materials" value={data.contractorMaterials} />
            </div>
          </Section>

          <Section title="Payment Terms">
            <div style={threeColumnGridStyle}>
              <FieldBlock label="Deposit" value={data.deposit} />
              <FieldBlock label="Progress Payment" value={data.progress} />
              <FieldBlock label="Final Payment" value={data.finalPayment} />
            </div>
          </Section>

          <Section title="Timeline">
            <div style={twoColumnGridStyle}>
              <FieldBlock label="Estimated Start Date" value={data.startDate} />
              <FieldBlock label="Estimated Completion Date" value={data.endDate} />
            </div>
          </Section>

          <Section title="Change Orders">
            <TextBlock label="Change Order Terms" value={data.changeOrders} />
          </Section>

          <Section title="Cleanup and Warranty">
            <div style={{ display: "grid", gap: "12px", width: "100%", maxWidth: "100%", minWidth: 0, overflow: "visible" }}>
              <TextBlock label="Cleanup" value={data.cleanup} />
              <TextBlock label="Warranty" value={data.warranty} />
            </div>
          </Section>

          <Section title="Signatures">
            <div style={twoColumnGridStyle}>
              <div style={{ width: "100%", maxWidth: "100%", minWidth: 0, overflow: "visible" }}>
                <div style={signatureLineStyle} />
                <FieldBlock label="Client Printed Name" value={data.clientPrintedName} />
                <div style={{ height: "12px" }} />
                <FieldBlock label="Client Signature Date" value={data.clientSignDate} />
              </div>
              <div style={{ width: "100%", maxWidth: "100%", minWidth: 0, overflow: "visible" }}>
                <div style={signatureLineStyle} />
                <FieldBlock label="Contractor Printed Name" value={data.contractorPrintedName} />
                <div style={{ height: "12px" }} />
                <FieldBlock label="Contractor Signature Date" value={data.contractorSignDate} />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </article>
  );
};

export default AgreementPrintDocument;

