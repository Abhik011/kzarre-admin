"use client";

import { useEffect, useRef, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Plus,
  Trash2,
  Edit3,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  GripVertical,
  X,
} from "lucide-react";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ================= TYPES ================= */
type Story = {
  _id: string;
  title: string;
  subtitle?: string;
  content: string;
  coverImage?: string;
  images?: string[];
  published: boolean;
  createdAt: string;
  type?: "story" | "about"; 
};



type ImageItem = {
  id: string;
  file: File;
  preview: string;
};

/* ================= SORTABLE IMAGE ================= */
function SortableImage({
  item,
  onRemove,
}: {
  item: ImageItem;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="relative w-32 h-32 rounded-lg overflow-hidden border bg-gray-50 dark:bg-[#111]"
    >
      <img src={item.preview} className="w-full h-full object-cover" />

      <button
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 bg-black/60 text-white p-1 rounded cursor-grab"
      >
        <GripVertical size={14} />
      </button>

      <button
        onClick={onRemove}
        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/* ================= COMPONENT ================= */
export default function AdminStories() {
  const API = process.env.NEXT_PUBLIC_BACKEND_API_URL!;
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("superadmin_token") ||
      localStorage.getItem("admin_token")
      : null;

  const [stories, setStories] = useState<Story[]>([]);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<ImageItem | null>(null);
  const [galleryImages, setGalleryImages] = useState<ImageItem[]>([]);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const handleCoverImage = (file: File | null) => {
    if (!file) return;
    setCoverImage({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    });
  };

  const handleGalleryImages = (files: FileList | null) => {
    if (!files) return;

    const newItems: ImageItem[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setGalleryImages((prev) => [...prev, ...newItems]);
  };

  /* ================= FETCH ================= */
  const fetchStories = async () => {
    const res = await fetch(`${API}/api/admin/stories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStories(data.stories || []);
  };

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
  document.execCommand("defaultParagraphSeparator", false, "p");
}, []);


  /* ================= EDIT ================= */
const openEditStory = (story: Story & { style?: any }) => {
  // open form + set mode
  setEditingStory(story);
  setShowForm(true);

  // basic fields
  setTitle(story.title || "");
  setSubtitle(story.subtitle || "");
  setContent(story.content || "");

  // ✅ IMPORTANT: set editor content ONCE (no cursor jump)
  requestAnimationFrame(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = story.content || "";
    }
  });

  // style (fallback to default if missing)
  if (story.style) {
    setStyle(story.style);
  }

  // cover image
  setCoverImage(
    story.coverImage
      ? {
          id: crypto.randomUUID(),
          file: null as any, // existing image (not re-uploaded)
          preview: story.coverImage,
        }
      : null
  );

  // gallery images
  setGalleryImages(
    story.images?.length
      ? story.images.map((url) => ({
          id: crypto.randomUUID(),
          file: null as any, // existing image
          preview: url,
        }))
      : []
  );
};



  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (!title || !content) {
      alert("Title & content required");
      return;
    }

    // Cover required only for NEW story
    if (!editingStory && !coverImage) {
      alert("Cover image is required");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("content", content);
    formData.append("published", "true");
    formData.append("style", JSON.stringify(style));


    // cover image (only if replaced or new)
    if (coverImage?.file) {
      formData.append("coverImage", coverImage.file);
    }

    // gallery images (only new files)
    galleryImages.forEach((img) => {
      if (img.file) formData.append("images", img.file);
    });

    const res = await fetch(
      editingStory
        ? `${API}/api/admin/stories/${editingStory._id}`
        : `${API}/api/admin/stories/create`,
      {
        method: editingStory ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    if (!res.ok) {
      alert("failed");
    } else {
      alert("Saved");
      resetForm();
      fetchStories();
    }

    setLoading(false);
  };

  const [style, setStyle] = useState({
    titleFont: "Playfair Display",
    bodyFont: "Inter",

    // ✅ sizes in PT (print-style)
    titleSize: "32pt",
    bodySize: "12pt",

    titleColor: "#111111",
    bodyColor: "#222222",

    lineHeight: "1.75",

    // spacing can stay px (recommended)
    paragraphSpacing: "20px",
    sectionSpacing: "48px",

    textAlign: "left",

    // max width should stay px (layout)
    maxWidth: "760px",

    backgroundColor: "#ffffff",
  });

  /* ================= RESET ================= */
  const resetForm = () => {
    setShowForm(false);
    setEditingStory(null);
    setTitle("");
    setSubtitle("");
    setContent("");
    setCoverImage(null);
    setGalleryImages([]);
  };



  /* ================= DELETE ================= */
  const deleteStory = async (id: string) => {
    if (!confirm("Delete this story?")) return;
    await fetch(`${API}/api/admin/stories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchStories();
  };

  /* ================= FORMAT ================= */
  const applyFormat = (cmd: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd);
  };

  return (
    <ProtectedRoute roles={["superadmin", "admin"]}>
      <div className="min-h-screen">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Stories</h1>
            <p className="text-sm text-gray-500">
              Manage brand stories
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[var(--accent-green)] text-white rounded-lg flex gap-2"
          >
            <Plus size={16} /> Create Story
          </button>
        </div>

        <div
          className="
    border border-[var(--borderColor)]
    rounded-2xl shadow-sm
    overflow-hidden">
          <table className="w-full text-sm">
            {/* HEADER */}
            <thead className="">
              <tr className="border-b border-[var(--borderColor)]">
                <th className="px-5 py-4 text-left font-medium text-[var(--textSecondary)]">
                  Title
                </th>
                <th className="px-5 py-4 text-center font-medium text-[var(--textSecondary)]">
                  Status
                </th>
                <th className="px-5 py-4 text-center font-medium text-[var(--textSecondary)]">
                  Created
                </th>
                <th className="px-5 py-4 text-center font-medium text-[var(--textSecondary)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {stories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-sm text-[var(--textSecondary)]"
                  >
                    No stories found
                  </td>
                </tr>
              ) : (
                stories.map((s) => (
                  <tr key={s._id} className="border-b border-[var(--borderColor)]transition">
                    {/* TITLE */}
                    <td className="px-5 py-4 font-medium text-[var(--textPrimary)]">
                      {s.title || "Untitled Story"}
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className="
    inline-flex items-center
    px-3 py-1 rounded-full
    text-xs font-semibold
    bg-[var(--accent-green)] text-white
    dark:bg-[var(--accent-green)] dark:text-white">Published
                      </span>

                    </td>

                    {/* CREATED */}
                    <td className="px-5 py-4 text-center text-[var(--textSecondary)]">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center gap-4">
                        <Edit3
                          size={16}
                          onClick={() => openEditStory(s)}
                          className="
    cursor-pointer
    text-blue-500
    hover:text-blue-600
  "
                        />

                        <Trash2
                          size={16}
                          onClick={() => deleteStory(s._id)}
                          className="cursor-pointer text-red-500 hover:text-red-600"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* CREATE FORM */}
        {showForm && (
          <div className="mt-8 max-w-6xl bg-white dark:bg-[#111] border rounded-2xl p-6">
            {/* HEADER */}
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Create Story</h2>
              <button onClick={resetForm} className="text-sm">← Back</button>
            </div>

            {/* TITLE */}
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-3 p-2 border rounded-lg"
            />

            {/* SUBTITLE */}
            <input
              placeholder="Subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full mb-4 p-2 border rounded-lg"
            />

            {/* ================= STORY STYLE ================= */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs">Title Font</label>
                <input
                  value={style.titleFont}
                  onChange={(e) => setStyle({ ...style, titleFont: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="text-xs">Body Font</label>
                <input
                  value={style.bodyFont}
                  onChange={(e) => setStyle({ ...style, bodyFont: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="text-xs">Title Size</label>
                <input
                  value={style.titleSize}
                  onChange={(e) => setStyle({ ...style, titleSize: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="text-xs">Body Size</label>
                <input
                  value={style.bodySize}
                  onChange={(e) => setStyle({ ...style, bodySize: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="text-xs">Line Height</label>
                <input
                  value={style.lineHeight}
                  onChange={(e) => setStyle({ ...style, lineHeight: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="text-xs">Text Align</label>
                <select
                  value={style.textAlign}
                  onChange={(e) => setStyle({ ...style, textAlign: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="justify">Justify</option>
                </select>
              </div>

              <div>
                <label className="text-xs">Paragraph Spacing</label>
                <input
                  value={style.paragraphSpacing}
                  onChange={(e) =>
                    setStyle({ ...style, paragraphSpacing: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="text-xs">Section Spacing</label>
                <input
                  value={style.sectionSpacing}
                  onChange={(e) =>
                    setStyle({ ...style, sectionSpacing: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="text-xs">Max Width</label>
                <input
                  value={style.maxWidth}
                  onChange={(e) => setStyle({ ...style, maxWidth: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="text-xs">Background</label>
                <input
                  type="color"
                  value={style.backgroundColor}
                  onChange={(e) =>
                    setStyle({ ...style, backgroundColor: e.target.value })
                  }
                  className="w-full h-10"
                />
              </div>
            </div>

            {/* ================= COVER IMAGE ================= */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Cover Image *</p>

              {!coverImage ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files &&
                    setCoverImage({
                      id: crypto.randomUUID(),
                      file: e.target.files[0],
                      preview: URL.createObjectURL(e.target.files[0]),
                    })
                  }
                  className="text-sm"
                />
              ) : (
                <div className="relative w-56 h-36 rounded-lg border overflow-hidden">
                  <img
                    src={coverImage.preview}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setCoverImage(null)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* ================= GALLERY IMAGES ================= */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Gallery Images</p>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (!e.target.files) return;
                  const newItems = Array.from(e.target.files).map((file) => ({
                    id: crypto.randomUUID(),
                    file,
                    preview: URL.createObjectURL(file),
                  }));
                  setGalleryImages((prev) => [...prev, ...newItems]);
                }}
                className="text-sm mb-3"
              />

              {galleryImages.length > 0 && (
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => {
                    if (!e.over) return;
                    setGalleryImages((items) =>
                      arrayMove(
                        items,
                        items.findIndex((i) => i.id === e.active.id),
                        items.findIndex((i) => i.id === e.over?.id)
                      )
                    );
                  }}
                >
                  <SortableContext
                    items={galleryImages.map((i) => i.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="flex gap-3 flex-wrap">
                      {galleryImages.map((img) => (
                        <SortableImage
                          key={img.id}
                          item={img}
                          onRemove={() =>
                            setGalleryImages((prev) =>
                              prev.filter((i) => i.id !== img.id)
                            )
                          }
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* ================= TOOLBAR ================= */}
            <div className="flex gap-2 mb-2 border p-2 rounded">
              <button onClick={() => applyFormat("bold")}><Bold size={16} /></button>
              <button onClick={() => applyFormat("italic")}><Italic size={16} /></button>
              <button onClick={() => applyFormat("underline")}><Underline size={16} /></button>
              <span className="w-px h-4 bg-gray-300 mx-1" />
              <button onClick={() => applyFormat("justifyLeft")}><AlignLeft size={16} /></button>
              <button onClick={() => applyFormat("justifyCenter")}><AlignCenter size={16} /></button>
              <button onClick={() => applyFormat("justifyRight")}><AlignRight size={16} /></button>
            </div>

            {/* ================= EDITOR ================= */}
           <div
  ref={editorRef}
  contentEditable
  className="min-h-[260px] border rounded-lg p-3 outline-none"
  onInput={(e) =>
    setContent((e.target as HTMLDivElement).innerHTML)
  }
/>



            {/* ================= ACTIONS ================= */}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetForm} className="border px-4 py-2 rounded">
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="bg-[var(--accent-green)] text-white px-4 py-2 rounded"
              >
                {loading ? "Publishing..." : "Publish Story"}
              </button>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
