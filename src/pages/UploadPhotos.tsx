import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Upload, ImagePlus, X, ArrowLeft, ImageIcon, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProject } from "@/contexts/ProjectContext";
import { toast } from "sonner";

const ACCEPTED_EXTENSIONS = /\.(jpg|jpeg|png|heic)$/i;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/heic"];
const MAX_FILES = 8;

function isAcceptedFile(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.test(file.name);
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const UploadPhotos = () => {
  const { project, updateProject, markStepComplete } = useProject();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [notes, setNotes] = useState(project.photos.notes || "");

  // Generate preview URLs — HEIC files may not be previewable in all browsers
  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];

    const generate = async () => {
      const result: string[] = [];
      for (const f of files) {
        const url = URL.createObjectURL(f);
        // Test if the browser can actually decode this image
        const canPreview = await new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });
        if (canPreview) {
          urls.push(url);
          result.push(url);
        } else {
          // Revoke unusable URL, push empty string as fallback marker
          URL.revokeObjectURL(url);
          result.push("");
        }
      }
      if (!cancelled) setPreviews(result);
    };

    generate();
    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const fileArray = Array.from(incoming);
    const accepted: File[] = [];
    let rejected = 0;

    fileArray.forEach((f) => {
      if (isAcceptedFile(f)) {
        accepted.push(f);
      } else {
        rejected++;
      }
    });

    if (rejected > 0) {
      toast.error(`${rejected} file${rejected > 1 ? "s" : ""} not supported`, {
        description: "Only JPG, PNG, and HEIC photos are accepted.",
      });
    }

    if (accepted.length === 0) return;

    setFiles((prev) => {
      const combined = [...prev, ...accepted];
      if (combined.length > MAX_FILES) {
        toast.info(`Maximum ${MAX_FILES} photos allowed`, {
          description: `Only the first ${MAX_FILES} photos were kept.`,
        });
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  }, []);

  // Drag-and-drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  // File input handler
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    // Reset so same file can be re-selected
    e.target.value = "";
  }, [addFiles]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const existingCount = project.photos.metadata.length;
  const hasNewFiles = files.length > 0;

  const handleContinue = () => {
    if (hasNewFiles) {
      const metadata = files.map((f) => ({ name: f.name, size: f.size, type: f.type }));
      updateProject({ photos: { metadata, notes } });
    } else {
      updateProject({ photos: { ...project.photos, notes } });
    }
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
            {/* Saved photo indicator */}
            {!hasNewFiles && existingCount > 0 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <ImageIcon className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {existingCount} photo{existingCount !== 1 ? "s" : ""} saved to this project
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Upload new photos below to replace them, or continue with your current set.</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {project.photos.metadata.map((meta, i) => (
                    <div key={i} className="rounded-lg bg-secondary/60 border border-border aspect-square flex flex-col items-center justify-center gap-1.5 p-2">
                      <FileImage className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center leading-tight">{meta.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.heic"
              className="hidden"
              onChange={handleFileInput}
            />

            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFilePicker}
              className={`relative cursor-pointer rounded-xl border-2 border-dashed p-12 md:p-16 text-center transition-all duration-200 ${
                dragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`rounded-full p-4 transition-colors duration-200 ${dragging ? "bg-primary/10" : "bg-secondary"}`}>
                  <Upload className={`h-7 w-7 transition-colors duration-200 ${dragging ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-foreground font-medium text-base">
                    {dragging ? "Drop your photos here" : "Drag and drop your bathroom photos here"}
                  </p>
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

            {/* Thumbnail previews */}
            <AnimatePresence>
              {hasNewFiles && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <p className="text-sm font-medium text-foreground">
                    {files.length} photo{files.length !== 1 ? "s" : ""} ready
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {files.map((file, i) => (
                      <motion.div
                        key={`${file.name}-${file.size}-${i}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        className="relative group rounded-xl overflow-hidden aspect-square bg-secondary border border-border shadow-sm"
                      >
                        {previews[i] && (
                          <img
                            src={previews[i]}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-200" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                          className="absolute top-2 right-2 rounded-full bg-foreground/70 p-1 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-foreground/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <p className="text-[10px] text-background truncate">{file.name}</p>
                          <p className="text-[9px] text-background/70">{formatSize(file.size)}</p>
                        </div>
                      </motion.div>
                    ))}
                    {files.length < MAX_FILES && (
                      <motion.button
                        type="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        onClick={(e) => { e.stopPropagation(); openFilePicker(); }}
                        className="rounded-xl border-2 border-dashed border-border aspect-square flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                      >
                        <ImagePlus className="h-5 w-5" />
                        <span className="text-[10px]">Add more</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
