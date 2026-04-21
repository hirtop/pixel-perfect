import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Upload, ImagePlus, X, ArrowLeft, ImageIcon, FileImage, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProject } from "@/contexts/ProjectContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PhotoMeta } from "@/contexts/ProjectContext";

const ACCEPTED_EXTENSIONS = /\.(jpg|jpeg|png|webp|heic)$/i;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_FILES = 8;

type RestoredPhoto = {
  id?: string;
  name: string;
  size: number;
  type: string;
  storage_path?: string;
  preview_url?: string;
  upload_status?: "uploaded" | "preview_only" | "upload_failed";
  imageUrl: string | null;
  status: "loading" | "ready" | "missing_storage_path" | "sign_error" | "load_error";
};

function isAcceptedFile(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.test(file.name);
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const UploadPhotos = () => {
  const { project, updateProject, saveProject, markStepComplete } = useProject();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [notes, setNotes] = useState(project.photos.notes || "");
  const [restoredPhotos, setRestoredPhotos] = useState<RestoredPhoto[]>([]);
  const [pendingUploadCount, setPendingUploadCount] = useState(0);

  const notesRef = useRef(notes);
  notesRef.current = notes;
  const photosRef = useRef(project.photos);
  photosRef.current = project.photos;
  const projectRef = useRef(project);
  projectRef.current = project;
  const userEditedRef = useRef(false);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestPersistedNotesRef = useRef(project.photos.notes || "");
  const saveInFlightRef = useRef<Promise<boolean> | null>(null);

  // Sync notes from backend ONLY if the user hasn't started editing locally.
  useEffect(() => {
    if (userEditedRef.current) return;
    latestPersistedNotesRef.current = project.photos.notes || "";
    setNotes(project.photos.notes || "");
  }, [project.photos.notes]);

  const persistNotes = useCallback(async (value: string) => {
    const current = photosRef.current;
    if (latestPersistedNotesRef.current === value && (current.notes || "") === value) return true;

    const nextPhotos = { ...current, notes: value };
    updateProject({ photos: nextPhotos });
    latestPersistedNotesRef.current = value;

    saveInFlightRef.current = saveProject({
      silent: true,
      projectOverride: { ...projectRef.current, photos: nextPhotos },
    });

    const didSave = await saveInFlightRef.current;
    if (!didSave) {
      latestPersistedNotesRef.current = photosRef.current.notes || "";
    }
    saveInFlightRef.current = null;
    return didSave;
  }, [saveProject, updateProject]);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    userEditedRef.current = true;
    setNotes(value);
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      void persistNotes(value);
    }, 600);
  }, [persistNotes]);

  const handleNotesBlur = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    void persistNotes(notesRef.current);
  }, [persistNotes]);

  // Flush pending notes on unmount and before page unload/refresh.
  useEffect(() => {
    const flush = () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
      void persistNotes(notesRef.current);
    };
    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [persistNotes]);

  // Regenerate fresh signed URLs for previously uploaded photos on every restore
  useEffect(() => {
    const meta = project.photos.metadata;
    if (meta.length === 0) {
      setRestoredPhotos([]);
      return;
    }

    let cancelled = false;

    setRestoredPhotos(
      meta.map((photo) => ({
        ...photo,
        imageUrl: photo.preview_url ?? null,
        status: photo.storage_path ? "loading" : photo.preview_url ? "ready" : "missing_storage_path",
      })),
    );

    (async () => {
      const nextPhotos = await Promise.all(
        meta.map(async (photo) => {
          if (!photo.storage_path) {
            return {
              ...photo,
              imageUrl: photo.preview_url ?? null,
              status: photo.preview_url ? ("ready" as const) : ("missing_storage_path" as const),
            };
          }

          const { data, error } = await supabase.storage
            .from("bathroom-photos")
            .createSignedUrl(photo.storage_path, 3600);

          if (error || !data?.signedUrl) {
            console.error("Couldn't create thumbnail URL", {
              storagePath: photo.storage_path,
              error,
            });

            return {
              ...photo,
              imageUrl: photo.preview_url ?? null,
              status: photo.preview_url ? ("ready" as const) : ("sign_error" as const),
            };
          }

          return {
            ...photo,
            imageUrl: data.signedUrl,
            status: "ready" as const,
          };
        }),
      );

      if (!cancelled) {
        setRestoredPhotos(nextPhotos);
      }
    })();

    return () => { cancelled = true; };
  }, [project.photos.metadata]);

  const markRestoredPhotoUnavailable = useCallback((index: number) => {
    setRestoredPhotos((current) => current.map((photo, photoIndex) => (
      photoIndex === index
        ? { ...photo, imageUrl: null, status: "load_error" }
        : photo
    )));
  }, []);

  const removeRestoredPhoto = useCallback(async (index: number) => {
    const photo = restoredPhotos[index];

    if (photo?.storage_path) {
      const { error } = await supabase.storage
        .from("bathroom-photos")
        .remove([photo.storage_path]);
      if (error) console.error("Storage delete error:", error);
    }

    const updatedMetadata = projectRef.current.photos.metadata.filter((_, i) => i !== index);
    const nextPhotos = { ...projectRef.current.photos, metadata: updatedMetadata };
    updateProject({ photos: nextPhotos });
    setRestoredPhotos((current) => current.filter((_, i) => i !== index));

    void saveProject({
      silent: true,
      projectOverride: { ...projectRef.current, photos: nextPhotos },
    });

    toast.success("Photo removed");
  }, [restoredPhotos, updateProject, saveProject]);

  const generatePreviewDataUrl = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const uploadAndPersistFile = useCallback(async (file: File): Promise<PhotoMeta | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    const photoId = crypto.randomUUID();

    // Generate preview as fallback (works even if user not signed in / upload fails)
    const preview = await generatePreviewDataUrl(file);

    if (!user) {
      const meta: PhotoMeta = {
        id: photoId,
        name: file.name,
        size: file.size,
        type: file.type,
        preview_url: preview ?? undefined,
        upload_status: preview ? "preview_only" : "upload_failed",
      };
      return meta;
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("bathroom-photos")
      .upload(storagePath, file, { contentType: file.type, upsert: true });

    if (error) {
      console.error("Upload error for", file.name, error);
      return {
        id: photoId,
        name: file.name,
        size: file.size,
        type: file.type,
        preview_url: preview ?? undefined,
        upload_status: preview ? "preview_only" : "upload_failed",
      };
    }

    return {
      id: photoId,
      name: file.name,
      size: file.size,
      type: file.type,
      storage_path: storagePath,
      upload_status: "uploaded",
    };
  }, []);

  const addFiles = useCallback(async (incoming: FileList | File[]) => {
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

    const currentMeta = projectRef.current.photos.metadata;
    const remainingSlots = Math.max(0, MAX_FILES - currentMeta.length);
    if (remainingSlots === 0) {
      toast.info(`Maximum ${MAX_FILES} photos allowed`);
      return;
    }

    const toUpload = accepted.slice(0, remainingSlots);
    if (accepted.length > remainingSlots) {
      toast.info(`Maximum ${MAX_FILES} photos allowed`, {
        description: `Only ${remainingSlots} more were added.`,
      });
    }

    setPendingUploadCount((c) => c + toUpload.length);

    let anyFailed = false;
    let anyLocalOnly = false;

    for (const file of toUpload) {
      try {
        const meta = await uploadAndPersistFile(file);
        if (!meta) {
          anyFailed = true;
          continue;
        }
        if (meta.upload_status !== "uploaded") anyLocalOnly = true;

        const nextMetadata = [...projectRef.current.photos.metadata, meta];
        const nextPhotos = { ...projectRef.current.photos, metadata: nextMetadata };
        updateProject({ photos: nextPhotos });

        await saveProject({
          silent: true,
          projectOverride: { ...projectRef.current, photos: nextPhotos },
        });
      } catch (err) {
        console.error("Failed to upload file", file.name, err);
        anyFailed = true;
      } finally {
        setPendingUploadCount((c) => Math.max(0, c - 1));
      }
    }

    if (anyFailed) {
      toast.error("Some photos failed to upload", { description: "Please try again." });
    } else if (anyLocalOnly) {
      toast.warning("Photo saved locally only", {
        description: "Sign in to back up your photos to your account.",
      });
    } else {
      toast.success(`${toUpload.length} photo${toUpload.length !== 1 ? "s" : ""} uploaded`);
    }
  }, [updateProject, saveProject, uploadAndPersistFile]);

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
      void addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void addFiles(e.target.files);
    }
    e.target.value = "";
  }, [addFiles]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const existingCount = project.photos.metadata.length;
  const isUploading = pendingUploadCount > 0;

  const handleContinue = async () => {
    // Flush notes before navigation
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    await persistNotes(notesRef.current);
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
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Home className="h-3.5 w-3.5" /> Home
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
            {/* Saved photos with thumbnails (persisted) */}
            {existingCount > 0 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <ImageIcon className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {existingCount} photo{existingCount !== 1 ? "s" : ""} ready
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Saved to your project. Add more below or continue.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {restoredPhotos.map((photo, i) => (
                    <div key={photo.id ?? i} className="relative group rounded-lg border border-border aspect-square overflow-hidden bg-secondary/60">
                      {photo.imageUrl ? (
                        <img
                          src={photo.imageUrl}
                          alt={photo.name}
                          className="w-full h-full object-cover"
                          onError={() => markRestoredPhotoUnavailable(i)}
                        />
                      ) : null}
                      <div className={`flex flex-col items-center justify-center gap-1.5 p-2 w-full h-full ${photo.imageUrl ? 'hidden' : ''}`}>
                        <FileImage className="h-5 w-5 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-foreground text-center leading-tight">
                          {photo.status === "loading" ? "Loading…" : "Image unavailable"}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate w-full text-center leading-tight">
                          {photo.name}
                        </span>
                        <span className="text-[9px] text-muted-foreground/80">
                          {formatSize(photo.size)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRestoredPhoto(i)}
                        className="absolute top-1.5 right-1.5 rounded-full bg-foreground/70 p-1 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        aria-label={`Remove ${photo.name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {Array.from({ length: pendingUploadCount }).map((_, i) => (
                    <div key={`pending-${i}`} className="relative rounded-lg border border-dashed border-border aspect-square flex flex-col items-center justify-center gap-1.5 bg-secondary/40">
                      <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                      <span className="text-[10px] text-muted-foreground">Uploading…</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  {isUploading ? (
                    <Loader2 className="h-7 w-7 text-primary animate-spin" />
                  ) : (
                    <Upload className={`h-7 w-7 transition-colors duration-200 ${dragging ? "text-primary" : "text-muted-foreground"}`} />
                  )}
                </div>
                <div>
                  <p className="text-foreground font-medium text-base">
                    {isUploading
                      ? `Uploading ${pendingUploadCount} photo${pendingUploadCount !== 1 ? "s" : ""}…`
                      : dragging
                        ? "Drop your photos here"
                        : existingCount > 0
                          ? "Add more bathroom photos"
                          : "Drag and drop your bathroom photos here"}
                  </p>
                  {!isUploading && (
                    <p className="text-muted-foreground text-sm mt-1">
                      or <span className="text-primary font-medium">browse files</span> from your device
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>JPG, PNG, HEIC accepted</span>
                  <span className="w-px h-3 bg-border" />
                  <span>Upload 3–8 photos for best results</span>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground/70 max-w-xs mx-auto leading-relaxed">
                  HEIC photos from iPhone are accepted but may not preview correctly. For best results, use JPG or PNG.
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                Project Notes <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Tell us anything important about this bathroom — what you want to keep, replace, or change."
                value={notes}
                onChange={handleNotesChange}
                onBlur={handleNotesBlur}
                className="min-h-[100px] text-base resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-5">
              <Button
                size="lg"
                className="w-full sm:w-auto px-10 h-12 text-base font-semibold rounded-lg"
                onClick={handleContinue}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  "Continue"
                )}
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
