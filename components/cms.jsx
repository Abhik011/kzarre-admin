"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  MoreVertical,
  FileText,
  Edit,
  Trash2,
  X,
  Save,
  Upload,
  Image,
  Calendar,
  Clock,
  Tag,
  FileEdit,
  Hash,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";

const userRole = "admin";

export default function CMSComplete() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("pagesAndPosts");

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const role = typeof window !== "undefined" ? localStorage.getItem("role") : "";
  const isSuperAdmin = role === "superadmin";

  // =============================
  // POST FORM STATES
  // =============================
  const [postData, setPostData] = useState({
    title: "",
    description: "",
    displayTo: "",
    visibleDate: "",
    visibleTime: "",
    metaTag: "",
    metaDescription: "",
    keywords: "",
  });

  const [postsData, setPostsData] = useState([]);

  // MEDIA STATES
  const [uploadedMedia, setUploadedMedia] = useState(null); // single preview (existing)
  const [uploadedMediaList, setUploadedMediaList] = useState([]); // for multi (grids/carousel)
  const [isDragging, setIsDragging] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Per-image meta inputs (for grids)
  const [imageTitles, setImageTitles] = useState([]);
  const [imageDescriptions, setImageDescriptions] = useState([]);
  const [imageMetaTags, setImageMetaTags] = useState([]);
  const [imageMetaDescriptions, setImageMetaDescriptions] = useState([]);
  const [imageKeywords, setImageKeywords] = useState([]);

  // helper: determine if current display type expects multiple files
 const isGrid =
  postData.displayTo === "women-grid" ||
  postData.displayTo === "men-grid" ||
  postData.displayTo === "women-4grid" ||
  postData.displayTo === "men-4grid";

  const isCarousel = postData.displayTo === "home-banner-carousel";

  // expected count for grid (backend currently expects 5 for women-grid/men-grid)W
  let expectedGridCount = 0;

if (postData.displayTo === "women-grid" || postData.displayTo === "men-grid") {
  expectedGridCount = 5;
} else if (postData.displayTo === "women-4grid" || postData.displayTo === "men-4grid") {
  expectedGridCount = 4;
}


  // =============================
  // FETCH CMS CONTENT (DARK-MODE READY)
  // =============================
  useEffect(() => {
    const fetchCMSPosts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content`
        );
        const data = await res.json();

        if (Array.isArray(data)) {
          const formatted = data.map((item) => ({
            _id: item._id,
            title:
              item.title || (item.heroVideoUrl ? "Hero Video" : "CMS Item"),
            type: item.displayTo || (item.heroVideoUrl ? "Video" : "Banner"),
            author: item.author || "System",
            status: item.status || "Pending",
            lastModified: item.updatedAt
              ? new Date(item.updatedAt).toLocaleDateString()
              : "—",
            url: item.heroVideoUrl || item?.banners?.[0]?.imageUrl || "",
          }));
          setPostsData(formatted);
        }
      } catch (err) {
        console.error("Failed to load CMS content:", err);
      }
    };

    fetchCMSPosts();
  }, []);

  // =============================
  // DRAG & DROP HANDLERS
  // =============================
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // supports multiple dropped files
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) processLocalAndPreview(files);
  };

  // =============================
  // PREVIEW ONLY (UPLOAD ON SAVE)
  // =============================
  // Accepts either a single File or an array of File objects
  const processLocalAndPreview = (filesOrFile) => {
    const files = Array.isArray(filesOrFile) ? filesOrFile : [filesOrFile];

    // video-only check for landing page
    if (postData.displayTo === "home-landing-video") {
      const video = files.find((f) => f.type.startsWith("video/"));
      if (!video) {
        alert("Please upload a video for Home Landing Video.");
        return;
      }
      // single video preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedMedia({
          url: e.target.result,
          type: "video",
          name: video.name,
          size: `${(video.size / 1024).toFixed(2)} KB`,
          rawFile: video,
          uploadedUrl: null,
        });
        // clear multi-list if any
        setUploadedMediaList([]);
      };
      reader.readAsDataURL(video);
      return;
    }

    // If single-banner (bannerOne/bannerTwo/bannerToggle/post) -> only first image accepted
    if (
      ["bannerOne", "bannerTwo", "bannerToggle", "post"].includes(postData.displayTo)
    ) {
      const image = files.find((f) => f.type.startsWith("image/"));
      if (!image) {
        alert("Please upload an image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedMedia({
          url: e.target.result,
          type: "image",
          name: image.name,
          size: `${(image.size / 1024).toFixed(2)} KB`,
          rawFile: image,
          uploadedUrl: null,
        });
        // clear multi-list if any
        setUploadedMediaList([]);
      };
      reader.readAsDataURL(image);
      return;
    }

    // If carousel or grid -> allow multiple images
    if (isCarousel || isGrid) {
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      if (!imageFiles.length) {
        alert("Please upload image files.");
        return;
      }

      // For grids: enforce exact count
      if (isGrid && imageFiles.length !== expectedGridCount) {
        alert(`This grid requires exactly ${expectedGridCount} images. You selected ${imageFiles.length}.`);
        return;
      }

      // create previews
      const previewPromises = imageFiles.map(
        (file) =>
          new Promise((res) => {
            const reader = new FileReader();
            reader.onload = (e) =>
              res({
                url: e.target.result,
                name: file.name,
                size: `${(file.size / 1024).toFixed(2)} KB`,
                rawFile: file,
              });
            reader.readAsDataURL(file);
          })
      );

      Promise.all(previewPromises).then((previews) => {
        setUploadedMediaList(previews);
        // initialize per-image meta arrays to match count
        const count = previews.length;
        setImageTitles((t) => Array.from({ length: count }, (_, i) => t[i] || ""));
        setImageDescriptions((d) => Array.from({ length: count }, (_, i) => d[i] || ""));
        setImageMetaTags((m) => Array.from({ length: count }, (_, i) => m[i] || ""));
        setImageMetaDescriptions((md) => Array.from({ length: count }, (_, i) => md[i] || ""));
        setImageKeywords((k) => Array.from({ length: count }, (_, i) => k[i] || ""));
        // clear single preview if any
        setUploadedMedia(null);
      });
      return;
    }

    // fallback: pick first image as single
    const fallback = files.find((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
    if (fallback) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedMedia({
          url: e.target.result,
          type: fallback.type.startsWith("video/") ? "video" : "image",
          name: fallback.name,
          size: `${(fallback.size / 1024).toFixed(2)} KB`,
          rawFile: fallback,
          uploadedUrl: null,
        });
      };
      reader.readAsDataURL(fallback);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    processLocalAndPreview(files);
  };

  const removeMedia = () => {
    setUploadedMedia(null);
    setUploadedMediaList([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMediaAt = (index) => {
    const next = uploadedMediaList.filter((_, i) => i !== index);
    setUploadedMediaList(next);
    // also remove associated metadata
    setImageTitles((prev) => prev.filter((_, i) => i !== index));
    setImageDescriptions((prev) => prev.filter((_, i) => i !== index));
    setImageMetaTags((prev) => prev.filter((_, i) => i !== index));
    setImageMetaDescriptions((prev) => prev.filter((_, i) => i !== index));
    setImageKeywords((prev) => prev.filter((_, i) => i !== index));
  };

  // =============================
  // SAVE POST (FORM + FILE)
  // =============================
  const handleSavePost = async () => {
    try {
      if (!postData.title.trim()) {
        alert("Please enter a title.");
        return;
      }

      // Basic validations for multi
      if (isGrid && uploadedMediaList.length !== expectedGridCount) {
        alert(`Please upload exactly ${expectedGridCount} images for this grid.`);
        return;
      }

      if (postData.displayTo === "home-landing-video" && !uploadedMedia?.rawFile) {
        alert("Please upload a landing video.");
        return;
      }

      const formData = new FormData();
      // append simple fields
      Object.entries(postData).forEach(([key, value]) => formData.append(key, value));

      // Append gridCount to help backend (optional)
      if (isGrid) formData.append("gridCount", String(expectedGridCount));

      // Single-file flows (existing)
      if (uploadedMedia?.rawFile && !isGrid && !isCarousel) {
        formData.append("file", uploadedMedia.rawFile);
      }

      // Multi-file flows
      if ((isGrid || isCarousel) && uploadedMediaList.length > 0) {
        // append each file with the same key 'files' (backend upload.any() will pick up)
        uploadedMediaList.forEach((m) => {
          formData.append("files", m.rawFile);
        });

        // send per-image metadata as JSON arrays (backend expects titles/descriptions/metaTags etc)
        formData.append("titles", JSON.stringify(imageTitles));
        formData.append("descriptions", JSON.stringify(imageDescriptions));
        formData.append("metaTags", JSON.stringify(imageMetaTags));
        formData.append("metaDescriptions", JSON.stringify(imageMetaDescriptions));
        formData.append("imageKeywords", JSON.stringify(imageKeywords));

      }

      // If single image was set (e.g. bannerOne/bannerTwo/post) we already appended file above.

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content/save`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      alert("✅ Sent for approval!");
      setCurrentView("dashboard");
      // clear states
      setUploadedMedia(null);
      setUploadedMediaList([]);
      setImageTitles([]);
      setImageDescriptions([]);
      setImageMetaTags([]);
      setImageMetaDescriptions([]);
      setImageKeywords([]);
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  // =============================
  // SAVE DRAFT
  // =============================
  const handleSaveDraft = () => {
    const newPost = {
      id: Math.max(...postsData.map((p) => p.id || 0), 0) + 1,
      title: postData.title || "Untitled",
      type: postData.displayTo,
      status: "Draft",
      lastModified: new Date().toISOString().split("T")[0],
    };
    setPostsData([newPost, ...postsData]);
    setCurrentView("dashboard");
  };

  // =============================
  // APPROVE / REJECT / DELETE
  // =============================
  const handleApprovePost = async (postId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content/approve/${postId}`,
        { method: "PATCH" }
      );

      if (!res.ok) throw new Error("Approve failed");

      setPostsData((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, status: "Approved" } : p))
      );

      alert("Approved!");
    } catch (err) {
      alert("❌" + err.message);
    }
  };

  const handleRejectPost = async (postId) => {
    const reason = prompt("Reason?");
    if (reason === null) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content/reject/${postId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        }
      );

      if (!res.ok) throw new Error("Reject failed");

      setPostsData((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, status: "Rejected" } : p))
      );

      alert("Rejected!");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const handleDeletePost = (postId) => {
    if (!confirm("Delete this post?")) return;
    setPostsData((prev) =>
      prev.filter((p) => p._id !== postId && p.id !== postId)
    );
  };

  const getStatusColor = (status) => {
    const map = {
      Approved: "bg-green-500 text-white",
      Draft: "bg-gray-500 text-white",
      "Pending Review": "bg-yellow-500 text-black",
      Rejected: "bg-red-500 text-white",
    };
    return map[status] || "bg-gray-500 text-white";
  };
  // ---------- UI helpers ----------
  const TopBar = ({ back, title, children }) => (
    <div className="px-6 py-4">
      <div className="max-w-9xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {back && (
            <button
              onClick={() => setCurrentView("dashboard")}
              className="p-2 rounded-lg hover:opacity-90 transition"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} className="text-[var(--text-primary)]" />
            </button>
          )}
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            {title}
          </div>
        </div>

        <div className="flex gap-3 items-center">{children}</div>
      </div>
    </div>
  );

  // ---------- Create Post View ----------
  const renderCreatePost = () => (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-all">
      <TopBar
        back={true}
        title={
          <>
            <span className="text-[var(--text-primary)] font-medium">CMS</span>
            <span className="mx-2 text-[var(--text-secondary)]">/</span>
            <span className="text-[var(--text-primary)] font-semibold">
              Create Post
            </span>
          </>
        }
      >
        <button
          onClick={handleSavePost}
          className="px-4 py-2 text-sm rounded-lg font-medium flex items-center gap-2 shadow-sm"
          style={{ backgroundColor: "var(--accent-green)" }}
        >
          <Save size={16} /> Save (Request Approval)
        </button>

        <button
          onClick={handleSaveDraft}
          className="px-4 py-2 text-sm rounded-lg font-medium bg-[var(--background-card)] border border-[var(--sidebar-border)] text-[var(--text-primary)]"
        >
          <FileText size={16} /> Draft
        </button>
      </TopBar>

      <div className="mx-auto max-w-7xl px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--background-card)] rounded-xl shadow-sm border border-[var(--sidebar-border)] p-6">
              <h2 className="text-xl font-semibold mb-6 text-[var(--text-primary)]">
                Create post
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Title of post
                  </label>
                  <input
                    type="text"
                    value={postData.title}
                    onChange={(e) =>
                      setPostData((p) => ({ ...p, title: e.target.value }))
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-[var(--background)] border-[var(--sidebar-border)] text-[var(--text-primary)] text-sm"
                    placeholder="Enter post title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Description of post
                  </label>
                  <textarea
                    value={postData.description}
                    onChange={(e) =>
                      setPostData((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none bg-[var(--background)] border-[var(--sidebar-border)] text-[var(--text-primary)] text-sm"
                    placeholder="Enter post description"
                    rows={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Display To
                  </label>
                  <select
                    value={postData.displayTo}
                    onChange={(e) =>
                      setPostData((p) => ({ ...p, displayTo: e.target.value }))
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none transition-all bg-[var(--background)] border-[var(--sidebar-border)] text-[var(--text-primary)] text-sm"
                  >
                    <option value="">Select place to display</option>
                    <option value="post">Post (single image)</option>
                    <option value="home-landing-video">Home Landing Video (video)</option>
                    <option value="bannerOne">Home Banner One (image)</option>
                    <option value="bannerTwo">Home Banner Two (image)</option>
                    <option value="women-4grid">Women Banner Grid (4 images)</option>
                    <option value="men-4grid">Men Banner Grid (4 images)</option>
                    <option value="women-grid">Women Banner Grid (5 images)</option>
                    <option value="men-grid">Men Banner Grid (5 images)</option>
                    <option value="about-page">About Page</option>
                    <option value="product-page">Product Page</option>
                  </select>

                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Choose where the uploaded media should be used. This will
                    validate file types.
                  </p>
                </div>

                {/* Upload */}
                <div className="bg-[var(--background-card)] rounded-xl border border-[var(--sidebar-border)] p-6">
                  <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
                    Upload Media
                  </h3>

                  {/* PREVIEW / UPLOAD UI */}
                  {uploadedMedia || uploadedMediaList.length > 0 ? (
                    <div>
                      {/* Single preview (image or video) */}
                      {uploadedMedia ? (
                        <div className="relative rounded-lg overflow-hidden bg-[var(--background)] border border-[var(--sidebar-border)]">
                          {uploadedMedia.type === "video" ? (
                            <video
                              src={uploadedMedia.uploadedUrl || uploadedMedia.url}
                              controls
                              className="w-full h-64 object-contain"
                            />
                          ) : (
                            <img
                              src={uploadedMedia.uploadedUrl || uploadedMedia.url}
                              alt={uploadedMedia.name}
                              className="w-full h-64 object-contain"
                            />
                          )}
                          <button
                            onClick={removeMedia}
                            className="absolute top-2 right-2 p-1.5 bg-[var(--background-card)] rounded-full shadow hover:shadow-lg transition"
                          >
                            <X size={18} className="text-[var(--text-primary)]" />
                          </button>
                        </div>
                      ) : null}

                      {/* Multi previews (grid/carousel) */}
                      {uploadedMediaList.length > 0 && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            {uploadedMediaList.map((m, idx) => (
                              <div key={idx} className="relative rounded-lg overflow-hidden border border-[var(--sidebar-border)]">
                                <img src={m.url} alt={m.name} className="w-full h-40 object-cover" />
                                <button
                                  onClick={() => removeMediaAt(idx)}
                                  className="absolute top-1 right-1 p-1 bg-[var(--background-card)] rounded-full"
                                  title="Remove"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Per-image meta inputs */}
                          <div className="grid grid-cols-1 gap-2">
                            {uploadedMediaList.map((_, idx) => (
                              <div key={idx} className="p-3 border rounded">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="text-sm font-medium text-[var(--text-primary)]">Image #{idx + 1}</div>
                                </div>

                                <input
                                  type="text"
                                  placeholder="Title (optional)"
                                  value={imageTitles[idx] || ""}
                                  onChange={(e) => {
                                    const copy = [...imageTitles];
                                    copy[idx] = e.target.value;
                                    setImageTitles(copy);
                                  }}
                                  className="w-full px-3 py-2 mb-2 border rounded bg-[var(--background)] border-[var(--sidebar-border)] text-[var(--text-primary)]"
                                />

                                <textarea
                                  placeholder="Description (optional)"
                                  value={imageDescriptions[idx] || ""}
                                  onChange={(e) => {
                                    const copy = [...imageDescriptions];
                                    copy[idx] = e.target.value;
                                    setImageDescriptions(copy);
                                  }}
                                  rows={2}
                                  className="w-full px-3 py-2 mb-2 border rounded bg-[var(--background)] border-[var(--sidebar-border)] text-[var(--text-primary)]"
                                />

                                {/* hidden meta fields (use if you want to set meta per image) */}
                                <div style={{ display: "none" }}>
                                  <input type="text" value={imageMetaTags[idx] || ""} onChange={(e) => {
                                    const copy = [...imageMetaTags];
                                    copy[idx] = e.target.value;
                                    setImageMetaTags(copy);
                                  }} />
                                  <input type="text" value={imageMetaDescriptions[idx] || ""} onChange={(e) => {
                                    const copy = [...imageMetaDescriptions];
                                    copy[idx] = e.target.value;
                                    setImageMetaDescriptions(copy);
                                  }} />
                                  <input type="text" value={imageKeywords[idx] || ""} onChange={(e) => {
                                    const copy = [...imageKeywords];
                                    copy[idx] = e.target.value;
                                    setImageKeywords(copy);
                                  }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 text-sm text-[var(--text-secondary)]">
                        <p className="font-medium text-[var(--text-primary)]">
                          {uploadedMedia?.name || `${uploadedMediaList.length} images selected`}
                        </p>
                        {uploadedMedia && <p>{uploadedMedia.size}</p>}
                        <p className="text-xs text-[var(--text-secondary)]">
                          Uploading / preview local
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="relative rounded-lg overflow-hidden">
                        <img
                          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3C/svg%3E"
                          alt="Placeholder"
                          className="w-full h-48 object-cover"
                        />
                      </div>

                      <div
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragLeave={handleDragLeave}
                        className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                          isDragging
                            ? "border-green-500 bg-green-50/20"
                            : "border-[var(--sidebar-border)] bg-[var(--background)]"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <Upload
                            size={32}
                            className="mb-3 text-[var(--text-secondary)]"
                          />
                          <p className="text-sm text-[var(--text-secondary)] mb-2">
                            Drag and Drop
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] mb-4">
                            or
                          </p>

                          <input
                            ref={fileInputRef}
                            id="file-upload"
                            type="file"
                            multiple={isCarousel || isGrid}
                            accept={
                              postData.displayTo === "home-landing-video"
                                ? "video/*"
                                : "image/*"
                            }
                            onChange={handleFileSelect}
                            className="hidden"
                          />

                          <div className="flex gap-3">
                            <label
                              htmlFor="file-upload"
                              className="px-4 py-2 text-sm rounded-lg cursor-pointer font-medium"
                              style={{
                                backgroundColor: "var(--accent-green)",
                                color: "#000",
                              }}
                            >
                              Upload from Device
                            </label>

                            <button
                              onClick={() => setMediaLibraryOpen(true)}
                              className="px-4 py-2 text-sm rounded-lg border border-[var(--sidebar-border)] bg-[var(--background-card)] text-[var(--text-primary)]"
                            >
                              Select from Media Library
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[var(--background-card)] rounded-xl shadow-sm border border-[var(--sidebar-border)] p-6">
              <h3 className="text-lg font-semibold mb-5 text-[var(--text-primary)]">
                Post Settings
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Visible Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={postData.visibleDate}
                      onChange={(e) =>
                        setPostData((p) => ({
                          ...p,
                          visibleDate: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none transition bg-[var(--background)] border-[var(--sidebar-border)] text-[var(--text-primary)] text-sm"
                    />
                    <Calendar
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Visible Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={postData.visibleTime}
                      onChange={(e) =>
                        setPostData((p) => ({
                          ...p,
                          visibleTime: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none transition bg-[var(--background)] border-[var(--sidebar-border)] text-[var(--text-primary)] text-sm"
                    />
                    <Clock
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--background-card)] rounded-xl shadow-sm border border-[var(--sidebar-border)] p-6">
              <h3 className="text-lg font-semibold mb-5 text-[var(--text-primary)]">
                SEO Configuration
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Meta Tag
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={postData.metaTag}
                      onChange={(e) =>
                        setPostData((p) => ({ ...p, metaTag: e.target.value }))
                      }
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none transition bg-[var(--background)] border-[var(--sidebar-border)] text-[var(--text-primary)] text-sm"
                      placeholder="Enter meta tag"
                    />
                    <Tag
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Meta Description
                  </label>
                  <div className="relative">
                    <textarea
                      value={postData.metaDescription}
                      onChange={(e) =>
                        setPostData((p) => ({
                          ...p,
                          metaDescription: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none transition bg-[var(--background)] border-[var(--sidebar-border)] text-[var(--text-primary)] text-sm resize-none"
                      placeholder="Enter meta description"
                      rows={3}
                    />
                    <FileEdit
                      size={18}
                      className="absolute left-3 top-3 text-[var(--text-secondary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Keywords
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={postData.keywords}
                      onChange={(e) =>
                        setPostData((p) => ({ ...p, keywords: e.target.value }))
                      }
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none transition bg-[var(--background)] border-[var(--sidebar-border)] text-[var(--text-primary)] text-sm"
                      placeholder="Enter keywords (comma separated)"
                    />
                    <Hash
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Library Modal */}
      {mediaLibraryOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full bg-[var(--background-card)] rounded-xl overflow-hidden shadow-2xl border border-[var(--sidebar-border)]">
            <div className="p-6 border-b border-[var(--sidebar-border)] flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Media Library
              </h2>
              <button
                onClick={() => setMediaLibraryOpen(false)}
                className="p-2 hover:opacity-90"
              >
                <X size={24} className="text-[var(--text-primary)]" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg overflow-hidden border border-[var(--sidebar-border)] bg-[var(--background)] cursor-pointer flex items-center justify-center"
                    onClick={() => setMediaLibraryOpen(false)}
                  >
                    <Image size={32} className="text-[var(--text-secondary)]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-[var(--sidebar-border)] flex justify-end gap-3">
              <button
                onClick={() => setMediaLibraryOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border border-[var(--sidebar-border)] bg-[var(--background-card)] text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm rounded-lg"
                style={{ backgroundColor: "var(--accent-green)" }}
              >
                Select
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ---------- Dashboard (list) ----------
  const renderDashboard = () => (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl px-4 pb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">
            Content Management
          </h1>
          <p className="text-[var(--text-secondary)]">
            Manage your Website's pages, posts & media
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-4 border-b border-[var(--sidebar-border)] w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab("pagesAndPosts")}
              className={`pb-3 px-4 font-medium text-sm ${
                activeTab === "pagesAndPosts"
                  ? "text-[var(--accent-green)] border-b-2 !border-[var(--accent-green)]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`pb-3 px-4 font-medium text-sm ${
                activeTab === "categories"
                  ? "text-[var(--accent-green)]border-b-2 !border-[var(--accent-green)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab("scheduled")}
              className={`pb-3 px-4 font-medium text-sm ${
                activeTab === "scheduled"
                  ? "text-[var(--accent-green)]border-b-2 !border-[var(--accent-green)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Scheduled Content
            </button>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {activeTab === "pagesAndPosts" && (
              <button
                onClick={() => setCurrentView("createPost")}
                className="px-4 py-2 text-sm rounded-lg font-medium flex items-center gap-2"
                style={{ backgroundColor: "var(--accent-green)" }}
              >
                <Plus size={18} className="flex-shrink-0" />
                Create Post
              </button>
            )}

            {activeTab === "categories" && (
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="px-5 py-2 text-sm rounded-lg font-medium flex items-center gap-2"
                style={{ backgroundColor: "var(--accent-green)" }}
              >
                <Plus size={18} className="flex-shrink-0" />
                Add Category
              </button>
            )}
          </div>
        </div>

        {activeTab === "pagesAndPosts" && (
          <div className="bg-[var(--background-card)] rounded-xl shadow-sm overflow-hidden border border-[var(--sidebar-border)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--sidebar-border)] bg-[var(--background)]">
                    {[
                      "Title",
                      "Type",
                      "Author",
                      "Last Modified",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {postsData.map((post) => (
                    <tr
                      key={post._id || post.id || Math.random()}
                      className="border-b border-[var(--sidebar-border)] hover:bg-[var(--background-card)] transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                        {post.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {post.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {post.author}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {post.lastModified}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            post.status
                          )}`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isSuperAdmin && post.status === "Pending Review" && (
                            <>
                              <button
                                onClick={() => handleApprovePost(post._id)}
                                className="px-3 py-1 text-sm rounded"
                                style={{
                                  background: "rgba(34,197,94,0.08)",
                                  color: "rgb(34, 197, 94)",
                                }}
                              >
                                Approve
                              </button>

                              <button
                                onClick={() => handleRejectPost(post._id)}
                                className="px-3 py-1 text-sm rounded"
                                style={{
                                  background: "rgba(239,68,68,0.08)",
                                  color: "rgb(239, 68, 68)",
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="p-1 hover:opacity-90"
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="bg-[var(--background-card)] rounded-xl shadow-sm p-8 text-center border border-[var(--sidebar-border)]">
            <p className="text-[var(--text-secondary)]">
              Categories content coming soon
            </p>
          </div>
        )}

        {activeTab === "scheduled" && (
          <div className="bg-[var(--background-card)] rounded-xl shadow-sm p-8 text-center border border-[var(--sidebar-border)]">
            <p className="text-[var(--text-secondary)]">
              Scheduled content coming soon
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--background-card)] rounded-xl max-w-md w-full shadow-2xl border border-[var(--sidebar-border)]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  {editingCategoryId ? "Edit Category" : "Add Category"}
                </h2>
                <button
                  onClick={() => {
                    /* safe fallback if handlers are not present in your original file */
                    setShowAddCategoryModal(false);
                  }}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X size={24} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // use existing handlers if present
                  try {
                    handleAddCategory();
                  } catch {
                    setShowAddCategoryModal(false);
                  }
                }}
                className="space-y-4"
              >
                {/* keep your modal fields */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={"" /* placeholder - your original state was not included in the provided file */}
                    onChange={() => {}}
                    className="w-full px-4 py-2 border rounded-lg bg-[var(--background)] border-[var(--sidebar-border)] text-[var(--text-primary)]"
                    placeholder="Enter category name"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(false)}
                    className="px-4 py-2 text-sm rounded-lg border border-[var(--sidebar-border)] bg-[var(--background-card)] text-[var(--text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm rounded-lg"
                    style={{ backgroundColor: "var(--accent-green)" }}
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ---------- final return ----------
  return currentView === "createPost" ? renderCreatePost() : renderDashboard();
}
