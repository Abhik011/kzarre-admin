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

const userRole = "admin"; // or "creator", "editor", etc.
const isAdmin = userRole === "admin";

const CMSComplete = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("pagesAndPosts");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Mens",
      description: "Men clothing",
      posts: 24,
      status: "Active",
    },
    {
      id: 2,
      name: "Womens",
      description: "Women clothing",
      posts: 18,
      status: "Active",
    },
  ]);

  // Create Post states
 // Single post form (used for create/edit)
const [postData, setPostData] = useState({
  title: "",
  description: "",
  displayTo: "", // '' | 'home-landing-video' | 'home-banner' | 'post' | ...
  visibleDate: "",
  visibleTime: "",
  metaTag: "",
  metaDescription: "",
  keywords: "",
});

// All posts list (used for dashboard display)
const [postsData, setPostsData] = useState([]);


  // uploadedMedia stores { url, type: 'image'|'video', name, size, rawFile }
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Posts list (replace with backend data)


useEffect(() => {
  const fetchCMSPosts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content`);
      const data = await res.json();
      console.log("📦 CMS content fetched:", data);

      if (Array.isArray(data)) {
        // Format posts for dashboard
        const formatted = data.map((item) => ({
          _id: item._id,
          title: item.title || (item.heroVideoUrl ? "Hero Video" : "CMS Item"),
          type: item.displayTo || (item.heroVideoUrl ? "Video" : "Banner"),
          author: item.author || "System",
          status: item.status || "Pending Review",
          lastModified: item.updatedAt
            ? new Date(item.updatedAt).toLocaleDateString()
            : "—",
          url: item.heroVideoUrl || item?.banners?.[0]?.imageUrl || "",
        }));

        setPostsData(formatted);
      } else {
        console.warn("⚠️ Unexpected CMS response format:", data);
      }
    } catch (err) {
      console.error("❌ Failed to load CMS content:", err);
    }
  };

  fetchCMSPosts();
}, []);

  // const handleFileUploadToAWS = async (file) => {
  //   try {
  //     const formData = new FormData();

  //     // ✅ Match backend field names exactly
  //     if (postData.displayTo === "home-landing-video") {
  //       formData.append("heroVideo", file);
  //     } else if (postData.displayTo === "home-banner") {
  //       formData.append("banners", file);
  //     } else {
  //       formData.append("file", file);
  //     }

  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content/save`,
  //       {
  //         method: "POST",
  //         body: formData,
  //       }
  //     );

  //     // backend returns full JSON, so use res.json()
  //     const data = await res.json();
  //     console.log("Upload response:", data);

  //     // ✅ Extract the uploaded URL from backend response
  //     if (data.cmsContent?.heroVideoUrl) {
  //       return data.cmsContent.heroVideoUrl;
  //     } else if (data.cmsContent?.banners?.length > 0) {
  //       return data.cmsContent.banners[data.cmsContent.banners.length - 1]
  //         .imageUrl;
  //     }

  //     console.warn("Upload did not return expected URL:", data);
  //     return null;
  //   } catch (err) {
  //     console.error("upload error:", err);
  //     return null;
  //   }
  // };

  // const handleBannerUpload = async (files) => {
  //   try {
  //     const formData = new FormData();
  //     Array.from(files).forEach((file) => formData.append("banners", file));
  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content/save`,
  //       {
  //         method: "POST",
  //         body: formData,
  //       }
  //     );
  //     const data = await res.json();
  //     console.log("Banners response:", data);
  //     return data;
  //   } catch (err) {
  //     console.error("banner upload error", err);
  //     return null;
  //   }
  // };


  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processLocalAndUpload(file);
  };

// ===============================
// ✅ PROCESS FILE (Preview only, don't upload yet)
// ===============================
const processLocalAndUpload = (file) => {
  // 🧠 Validate file type based on selected "Display To"
  if (
    postData.displayTo === "home-landing-video" &&
    !file.type.startsWith("video/")
  ) {
    alert("Please upload a video for Home Landing Video.");
    return;
  }

  if (
    postData.displayTo === "home-banner" &&
    !file.type.startsWith("image/")
  ) {
    alert("Please upload an image for Home Banner.");
    return;
  }

  // 🖼️ Preview locally before upload
  const reader = new FileReader();
  reader.onload = (e) => {
    setUploadedMedia({
      url: e.target.result, // local preview (base64)
      type: file.type.startsWith("video/") ? "video" : "image",
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      rawFile: file, // ✅ store file object for uploading later on SAVE
      uploadedUrl: null,
    });
  };
  reader.readAsDataURL(file);
};



  // Drag-drop handlers
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
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) await processLocalAndUpload(files[0]);
  };

  const removeMedia = () => {
    setUploadedMedia(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --------------------
  // Save / Draft / Approve flows
  // --------------------
// ===============================
// ✅ SAVE POST (Send file + text together)
// ===============================
const handleSavePost = async () => {
  try {
    // Basic validation
    if (!postData.title.trim()) {
      alert("Please provide a title");
      return;
    }

    // Build multipart/form-data payload
    const formData = new FormData();
    formData.append("title", postData.title);
    formData.append("description", postData.description);
    formData.append("displayTo", postData.displayTo);
    formData.append("visibleDate", postData.visibleDate);
    formData.append("visibleTime", postData.visibleTime);
    formData.append("metaTag", postData.metaTag);
    formData.append("metaDescription", postData.metaDescription);
    formData.append("keywords", postData.keywords);

    // ✅ Include selected media file (if any)
    if (uploadedMedia?.rawFile) {
      formData.append("file", uploadedMedia.rawFile);
    }

    console.log("📤 Submitting CMS content...");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content/save`,
      {
        method: "POST",
        body: formData, // 👈 browser automatically sets correct headers
      }
    );

    const data = await res.json();
    console.log("📦 Save Response:", data);

    if (!res.ok) {
      throw new Error(data.error || "Failed to save content");
    }

    alert("✅ Post submitted for review!");

    // Reset form
    setPostData({
      title: "",
      description: "",
      displayTo: "",
      visibleDate: "",
      visibleTime: "",
      metaTag: "",
      metaDescription: "",
      keywords: "",
    });
    setUploadedMedia(null);
    setCurrentView("dashboard");
  } catch (err) {
    console.error("❌ handleSavePost Error:", err);
    alert(`Failed to save post: ${err.message}`);
  }
};



  const handleSaveDraft = () => {
    const newPost = {
      id: Math.max(...postsData.map((p) => p.id), 0) + 1,
      title: postData.title || "Untitled Post",
      type: postData.displayTo || "Uncategorized",
      author: "Admin",
      lastModified: new Date().toISOString().split("T")[0],
      status: "Draft",
      media: uploadedMedia
        ? {
            url: uploadedMedia.uploadedUrl || uploadedMedia.url,
            kind: uploadedMedia.type,
          }
        : null,
      description: postData.description,
    };
    setUploadedMedia(null);
    setCurrentView("dashboard");

    console.log("Draft saved:", newPost);
  };

  // Admin approve (client-side). Replace with API call to approve on server.
  const handleApprovePost = async (postId) => {
    const id = typeof postId === "object" ? postId._id : postId;
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content/approve/${id}`;
      console.log("🔗 Approve API:", apiUrl);
      const res = await fetch(apiUrl, { method: "PATCH" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setPostsData((prev) =>
        prev.map((p) =>
          (p._id || p.id) === id
            ? {
                ...p,
                status: "Approved",
                lastModified: new Date().toISOString().split("T")[0],
              }
            : p
        )
      );
      alert("✅ Post approved — now live on frontend!");
    } catch (err) {
      console.error("❌ Approve error:", err);
      alert(`Failed to approve: ${err.message}`);
    }
  };

  // Delete post (client-side demo)
  const handleDeletePost = (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setPostsData(postsData.filter((p) => p.id !== postId));
    // TODO: call backend
  };

  // Admin reject (client-side). Replaces with API call to backend.
  const handleRejectPost = async (postId) => {
    const reason = prompt("Enter reason for rejection (optional):");
    if (reason === null) return; // cancelled

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cms-content/reject/${postId}`;
      console.log("🔗 Reject API URL:", apiUrl);

      const res = await fetch(apiUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // ✅ Update local state
      setPostsData((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                status: "Rejected",
                rejectionReason: reason || "No reason provided",
                lastModified: new Date().toISOString().split("T")[0],
              }
            : p
        )
      );

      alert("❌ Post rejected successfully!");
    } catch (err) {
      console.error("❌ handleRejectPost Error:", err);
      alert(`Failed to reject post: ${err.message}`);
    }
  };

  // --------------------
  // UI small helpers
  // --------------------
  const getStatusColor = (status) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Pending Review":
        return "bg-yellow-100 text-yellow-800";
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      case "Active":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // --------------------
  // Render Create Post Page
  // --------------------
  const renderCreatePost = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Top Action Bar */}
      <div className="px-6 py-4">
        <div className="max-w-9xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView("dashboard")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>CMS</span>
              <span>/</span>
              <span className="text-gray-900">Create Post</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSavePost}
              className="px-5 py-2 text-black font-medium rounded-lg flex items-center gap-2 hover:opacity-90 transition-all"
              style={{ backgroundColor: "#A0EDA8" }}
            >
              <Save size={18} />
              Save (Request Approval)
            </button>
            <button
              onClick={handleSaveDraft}
              className="px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all"
            >
              <FileText size={18} />
              Draft
            </button>
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Create post
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title of post
                  </label>
                  <input
                    type="text"
                    value={postData.title}
                    onChange={(e) =>
                      setPostData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="Enter post title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description of post
                  </label>
                  <textarea
                    value={postData.description}
                    onChange={(e) =>
                      setPostData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                    placeholder="Enter post description"
                    rows="6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display To
                  </label>
                  <select
                    value={postData.displayTo}
                    onChange={(e) =>
                      setPostData((prev) => ({
                        ...prev,
                        displayTo: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select place to display</option>
                    <option value="post">Post (single image)</option>
                    <option value="home-landing-video">
                      Home Landing Video (video)
                    </option>
                    <option value="home-banner">
                      Home Banner (single image)
                    </option>
                    <option value="about-page">About Page</option>
                    <option value="product-page">Product Page</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose where the uploaded media should be used. This will
                    validate file types.
                  </p>
                </div>

                {/* Upload area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Upload Media</h3>

                  {uploadedMedia ? (
                    <div>
                      <div className="relative rounded-lg overflow-hidden bg-gray-100">
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
                          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                        >
                          <X size={18} className="text-gray-600" />
                        </button>
                      </div>

                      <div className="mt-3 text-sm text-gray-600">
                        <p className="font-medium">{uploadedMedia.name}</p>
                        <p>{uploadedMedia.size}</p>
                        {uploadedMedia.uploadedUrl ? (
                          <p className="text-xs text-gray-500">
                            Uploaded URL:{" "}
                            <span className="break-all">
                              {uploadedMedia.uploadedUrl}
                            </span>
                          </p>
                        ) : uploadedMedia.uploadError ? (
                          <p className="text-xs text-red-500">
                            Upload failed. Try again.
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            Uploading or awaiting server URL...
                          </p>
                        )}
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
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <Upload size={32} className="text-gray-400 mb-3" />
                          <p className="text-sm text-gray-600 mb-2">
                            Drag and Drop
                          </p>
                          <p className="text-xs text-gray-500 mb-4">or</p>

                          <input
                            ref={fileInputRef}
                            id="file-upload"
                            type="file"
                            accept={
                              postData.displayTo === "home-landing-video"
                                ? "video/*"
                                : "image/*,video/*"
                            }
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <div className="flex gap-3">
                            <label
                              htmlFor="file-upload"
                              className="px-4 py-2 text-black text-sm font-medium rounded-lg cursor-pointer hover:opacity-90 transition-all"
                              style={{ backgroundColor: "#A0EDA8" }}
                            >
                              Upload from Device
                            </label>

                            <button
                              onClick={() => setMediaLibraryOpen(true)}
                              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
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

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">
                Post Settings
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visible Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={postData.visibleDate}
                      onChange={(e) =>
                        setPostData((prev) => ({
                          ...prev,
                          visibleDate: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <Calendar
                      size={18}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visible Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={postData.visibleTime}
                      onChange={(e) =>
                        setPostData((prev) => ({
                          ...prev,
                          visibleTime: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <Clock
                      size={18}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">
                SEO Configuration
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Tag
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={postData.metaTag}
                      onChange={(e) =>
                        setPostData((prev) => ({
                          ...prev,
                          metaTag: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter meta tag"
                    />
                    <Tag
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <div className="relative">
                    <textarea
                      value={postData.metaDescription}
                      onChange={(e) =>
                        setPostData((prev) => ({
                          ...prev,
                          metaDescription: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      placeholder="Enter meta description"
                      rows="3"
                    />
                    <FileEdit
                      size={18}
                      className="absolute left-3 top-3 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={postData.keywords}
                      onChange={(e) =>
                        setPostData((prev) => ({
                          ...prev,
                          keywords: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter keywords (comma separated)"
                    />
                    <Hash
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* main content wrapper */}
      {/* Media Library Modal */}
      {mediaLibraryOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Media Library
                </h2>
                <button
                  onClick={() => setMediaLibraryOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-4 gap-4">
                {/* TODO: fetch and render actual media items from backend */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div
                    key={item}
                    className="aspect-square bg-gray-100 rounded-lg hover:ring-2 hover:ring-green-500 cursor-pointer transition-all overflow-hidden"
                    onClick={() => {
                      setMediaLibraryOpen(false);
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size={32} className="text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setMediaLibraryOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-black rounded-lg font-medium hover:opacity-90"
                  style={{ backgroundColor: "#A0EDA8" }}
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // --------------------
  // Render Dashboard
  // --------------------
  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Content Management
          </h1>
          <p className="text-gray-600">
            Manage your Website's pages, post & media
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-4 border-b border-gray-200 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab("pagesAndPosts")}
              className={`pb-3 px-4 font-medium text-sm ${
                activeTab === "pagesAndPosts"
                  ? "text-green-600 border-b-2 border-green-500"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Pages & Posts
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`pb-3 px-4 font-medium text-sm ${
                activeTab === "categories"
                  ? "text-green-600 border-b-2 border-green-500"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab("scheduled")}
              className={`pb-3 px-4 font-medium text-sm ${
                activeTab === "scheduled"
                  ? "text-green-600 border-b-2 border-green-500"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Scheduled Content
            </button>
          </div>

          {activeTab === "pagesAndPosts" && (
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => setCurrentView("createPost")}
                className="w-full sm:w-auto px-4 py-2 text-black rounded-lg transition-all flex items-center justify-center gap-2 font-medium text-sm hover:opacity-90"
                style={{ backgroundColor: "#A0EDA8" }}
              >
                <Plus size={18} /> Create Post
              </button>
            </div>
          )}

          {activeTab === "categories" && (
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="w-full sm:w-auto px-4 py-2 text-black rounded-lg transition-all flex items-center justify-center gap-2 font-medium text-sm hover:opacity-90"
              style={{ backgroundColor: "#A0EDA8" }}
            >
              <Plus size={18} /> Add Category
            </button>
          )}
        </div>

        {/* Posts Table */}
        {activeTab === "pagesAndPosts" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Author
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Last Modified
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {postsData.map((post) => (
                    <tr
                      key={post._id || post.id || Math.random()}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      {/* --- Title --- */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {post.title}
                      </td>

                      {/* --- Type --- */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {post.type}
                      </td>

                      {/* --- Author --- */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {post.author}
                      </td>

                      {/* --- Last Modified --- */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {post.lastModified}
                      </td>

                      {/* --- Status Badge --- */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            post.status
                          )}`}
                        >
                          {post.status}
                        </span>
                      </td>

                      {/* --- Actions --- */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* ✅ Admin-only Approve/Reject */}
                          {isAdmin && post.status === "Pending Review" && (
                            <>
                              <button
                                onClick={() => handleApprovePost(post._id)}
                                className="px-3 py-1 bg-green-50 text-green-800 rounded text-sm font-medium hover:bg-green-100 transition"
                              >
                                Approve
                              </button>

                              <button
                                onClick={() => handleRejectPost(post._id)}
                                className="px-3 py-1 bg-red-50 text-red-800 rounded text-sm font-medium hover:bg-red-100 transition"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* 🟡 Non-admin view (just shows waiting) */}
                          {!isAdmin && post.status === "Pending Review" && (
                            <span className="text-xs text-gray-400 italic">
                              Waiting for admin approval
                            </span>
                          )}

                          {/* 🗑 Delete button (for everyone) */}
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} className="text-red-500" />
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

        {/* Categories Tab */}
        {activeTab === "categories" && (
         <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-600">Categories content coming soon</p>
          </div>
        )}

        {activeTab === "scheduled" && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-600">Scheduled content coming soon</p>
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCategoryId ? "Edit Category" : "Add Category"}
                </h2>
                <button
                  onClick={handleCloseCategoryModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddCategory();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) =>
                      setCategoryFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={categoryFormData.description}
                    onChange={(e) =>
                      setCategoryFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Enter category description"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Status
                  </label>
                  <select
                    value={categoryFormData.status}
                    onChange={(e) =>
                      setCategoryFormData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleCloseCategoryModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-black rounded-lg font-medium text-sm hover:opacity-90"
                    style={{ backgroundColor: "#A0EDA8" }}
                  >
                    {editingCategoryId ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return currentView === "createPost" ? renderCreatePost() : renderDashboard();
};

export default CMSComplete;
