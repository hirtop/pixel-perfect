import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Upload, ImagePlus, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProject } from "@/contexts/ProjectContext";

const UploadPhotos = () => {
  const { project, updateProject, markStepComplete } = useProject();
  const navigate = useNavigate();

  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [notes, setNotes] = useState(project.photos.notes || "");

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const accepted = Array.from(incoming).filter((f) =>
      ["image/jpeg", "image/png", "image/heic"].includes(f.type) || f.name.match(/\.(jpg|jpeg|png|heic)$/i)
    );
    setFiles((prev) => [...prev, ...accepted].slice(0, 8));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    const metadata = files.map((f) => ({ name: f.name, size: f.size, type: f.type }));
    updateProject({
      photos: { metadata, notes },
    });
    markStepComplete("upload");
    navigate("/dimensions");
  };

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
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
              Upload Your Bathroom Photos
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              Add a few clear photos of your current bathroom so BOBOX can generate remodel options tailored to your space.
            </p>
          </div>

          <div className="space-y-8">
            {/* Dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              className={`relative cursor-pointer rounded-xl border-2 border-dashed p-12 md:p-16 text-center transition-all duration-200 ${
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50"
              }`}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.heic"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <div className="flex flex-col items-center gap-3">
                <div className={`rounded-full p-4 transition-colors duration-200 ${dragging ? "bg-primary/10" : "bg-secondary"}`}>
                  <Upload className={`h-7 w-7 transition-colors duration-200 ${dragging ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-foreground font-medium text-base">Drag and drop your bathroom photos here</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    or <span className="text-primary font-medium">browse files</span> from your device
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>JPG, PNG, HEIC</span>
                  <span className="w-px h-3 bg-border" />
                  <span>Upload 3–8 photos for best results</span>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {files.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  {files.length} photo{files.length !== 1 ? "s" : ""} added
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {files.map((file, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden aspect-square bg-secondary">
                      <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        className="absolute top-1.5 right-1.5 rounded-full bg-foreground/70 p-1 text-background opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {files.length < 8 && (
                    <button
                      onClick={() => document.getElementById("file-input")?.click()}
                      className="rounded-lg border-2 border-dashed border-border aspect-square flex flex-col items-center justify-center text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                    >
                      <ImagePlus className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Saved photo count indicator */}
            {files.length === 0 && project.photos.metadata.length > 0 && (
              <div className="rounded-lg bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                {project.photos.metadata.length} photo{project.photos.metadata.length !== 1 ? "s" : ""} previously saved to this project.
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                Project Notes <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Tell us anything important about this bathroom — what you want to keep, replace, or change."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] text-base resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-5">
              <Button size="lg" className="w-full sm:w-auto px-10 h-12 text-base font-semibold rounded-lg" onClick={handleContinue}>
                Continue
              </Button>
              <Link to="/start" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Project Setup
              </Link>
            </div>

            <p className="text-center text-xs text-muted-foreground">You can add more details later.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default UploadPhotos;
