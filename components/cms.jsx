'use client';

import React, { useState, useRef } from 'react';
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
  ArrowLeft
} from 'lucide-react';

const CMSComplete = () => {
  // State for navigation
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'createPost'
  
  // Dashboard states
  const [activeTab, setActiveTab] = useState('pagesAndPosts');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
  });

  const [categories, setCategories] = useState([
    { id: 1, name: 'Mens', description: 'Men clothing and accessories', posts: 24, status: 'Active' },
    { id: 2, name: 'Womens', description: 'Women clothing and accessories', posts: 18, status: 'Active' },
    { id: 3, name: 'Accessories', description: 'Belts, bags, and more', posts: 12, status: 'Active' },
    { id: 4, name: 'Footwear', description: 'Shoes and boots', posts: 8, status: 'Active' },
    { id: 5, name: 'Seasonal', description: 'Seasonal collections', posts: 5, status: 'Inactive' },
  ]);

  // Create Post states
  const [postData, setPostData] = useState({
    title: '',
    description: '',
    displayTo: '',
    visibleDate: '',
    visibleTime: '',
    metaTag: '',
    metaDescription: '',
    keywords: ''
  });

  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const fileInputRef = useRef(null);

  const pagesData = [
    { id: 1, title: 'Home', type: 'Landing page', lastModified: '2025-10-19', status: 'Published' },
    { id: 2, title: 'Heritage', type: 'Collection Page', lastModified: '2025-10-19', status: 'Published' },
    { id: 3, title: 'Womens', type: 'Collection Page', lastModified: '2025-10-19', status: 'Published' },
    { id: 4, title: 'Mens', type: 'Collection Page', lastModified: '2025-10-19', status: 'Published' },
    { id: 5, title: 'Accessories', type: 'Collection Page', lastModified: '2025-10-19', status: 'Published' },
    { id: 6, title: 'About Us', type: 'Standard Page', lastModified: '2025-10-19', status: 'Published' },
  ];

  const [postsData, setPostsData] = useState([
    { id: 1, title: 'Jacket', type: 'Mens', author: 'Abhijeet.k', lastModified: '2025-10-19', status: 'Published' },
    { id: 2, title: 'Jacket', type: 'Mens', author: 'Abhijeet.k', lastModified: '2025-10-19', status: 'Draft' },
    { id: 3, title: 'Jacket', type: 'Mens', author: 'Abhijeet.k', lastModified: '2025-10-19', status: 'Pending Review' },
    { id: 4, title: 'Jacket', type: 'Mens', author: 'Abhijeet.k', lastModified: '2025-10-19', status: 'Scheduled' },
    { id: 5, title: 'Jacket', type: 'Mens', author: 'Abhijeet.k', lastModified: '2025-10-19', status: 'Inactive' },
  ]);

  // Dashboard Functions
  const handleAddCategory = () => {
    if (categoryFormData.name.trim()) {
      if (editingCategoryId) {
        setCategories(categories.map(cat => 
          cat.id === editingCategoryId ? { ...cat, ...categoryFormData } : cat
        ));
        setEditingCategoryId(null);
      } else {
        setCategories([
          ...categories,
          {
            id: Math.max(...categories.map(c => c.id), 0) + 1,
            ...categoryFormData,
            posts: 0,
          }
        ]);
      }
      setCategoryFormData({ name: '', description: '', status: 'Active' });
      setShowAddCategoryModal(false);
    }
  };

  const handleEditCategory = (category) => {
    setCategoryFormData({
      name: category.name,
      description: category.description,
      status: category.status,
    });
    setEditingCategoryId(category.id);
    setShowAddCategoryModal(true);
  };

  const handleDeleteCategory = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleCloseCategoryModal = () => {
    setShowAddCategoryModal(false);
    setCategoryFormData({ name: '', description: '', status: 'Active' });
    setEditingCategoryId(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Pending Review':
        return 'bg-purple-100 text-purple-800';
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Create Post Functions
  const handleInputChange = (field, value) => {
    setPostData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedMedia({
          url: e.target.result,
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const removeMedia = () => {
    setUploadedMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSavePost = () => {
    // Add new post to the posts list
    const newPost = {
      id: Math.max(...postsData.map(p => p.id), 0) + 1,
      title: postData.title || 'Untitled Post',
      type: 'Uncategorized',
      author: 'Abhijeet.k',
      lastModified: new Date().toISOString().split('T')[0],
      status: 'Published'
    };
    
    setPostsData([newPost, ...postsData]);
    
    // Reset form and go back to dashboard
    setPostData({
      title: '',
      description: '',
      displayTo: '',
      visibleDate: '',
      visibleTime: '',
      metaTag: '',
      metaDescription: '',
      keywords: ''
    });
    setUploadedMedia(null);
    setCurrentView('dashboard');
    
    console.log('Post saved:', newPost);
  };

  const handleSaveDraft = () => {
    // Add new post as draft
    const newPost = {
      id: Math.max(...postsData.map(p => p.id), 0) + 1,
      title: postData.title || 'Untitled Post',
      type: 'Uncategorized',
      author: 'Abhijeet.k',
      lastModified: new Date().toISOString().split('T')[0],
      status: 'Draft'
    };
    
    setPostsData([newPost, ...postsData]);
    
    // Reset form and go back to dashboard
    setPostData({
      title: '',
      description: '',
      displayTo: '',
      visibleDate: '',
      visibleTime: '',
      metaTag: '',
      metaDescription: '',
      keywords: ''
    });
    setUploadedMedia(null);
    setCurrentView('dashboard');
    
    console.log('Draft saved:', newPost);
  };

  // Render Create Post Page
  const renderCreatePost = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Top Action Bar */}
      <div className="px-6 py-4">
        <div className="max-w-9xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('dashboard')}
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
              style={{ backgroundColor: '#A0EDA8' }}
            >
              <Save size={18} />
              Save
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
      <div className=" mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Content - Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Create Post Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Create post</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title of post
                  </label>
                  <input
                    type="text"
                    value={postData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter post title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description of post
                  </label>
                  <textarea
                    value={postData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter post description"
                    rows="6"
                  />
                </div>
              </div>
            </div>

            {/* Upload Media Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Media</h2>
              
              {uploadedMedia ? (
                <div className="relative">
                  <div className="relative rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={uploadedMedia.url} 
                      alt={uploadedMedia.name}
                      className="w-full h-64 object-contain"
                    />
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
                    className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                      isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center">
                      <Upload size={32} className="text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 mb-2">Drag and Drop</p>
                      <p className="text-xs text-gray-500 mb-4">or</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <div className="flex gap-3">
                        <label
                          htmlFor="file-upload"
                          className="px-4 py-2 text-black text-sm font-medium rounded-lg cursor-pointer hover:opacity-90 transition-all"
                          style={{ backgroundColor: '#A0EDA8' }}
                        >
                          Upload from Media
                        </label>
                        <button
                          onClick={() => setMediaLibraryOpen(true)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
                        >
                          Select Media Library
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Settings */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Post Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">Post Settings</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display to
                  </label>
                  <div className="relative">
                    <select
                      value={postData.displayTo}
                      onChange={(e) => handleInputChange('displayTo', e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
                    >
                      <option value="">Select audience</option>
                      <option value="everyone">Everyone</option>
                      <option value="members">Members Only</option>
                      <option value="premium">Premium Members</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visible Date & Time
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="date"
                        value={postData.visibleDate}
                        onChange={(e) => handleInputChange('visibleDate', e.target.value)}
                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <Calendar size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                    <div className="relative">
                      <input
                        type="time"
                        value={postData.visibleTime}
                        onChange={(e) => handleInputChange('visibleTime', e.target.value)}
                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <Clock size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">SEO Configuration</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Tag
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={postData.metaTag}
                      onChange={(e) => handleInputChange('metaTag', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter meta tag"
                    />
                    <Tag size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <div className="relative">
                    <textarea
                      value={postData.metaDescription}
                      onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      placeholder="Enter meta description"
                      rows="3"
                    />
                    <FileEdit size={18} className="absolute left-3 top-3 text-gray-500" />
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
                      onChange={(e) => handleInputChange('keywords', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter keywords (comma separated)"
                    />
                    <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
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
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
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
                  style={{ backgroundColor: '#A0EDA8' }}
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

  // Render Dashboard
  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
          <p className="text-gray-600">Manage your website's pages, post & media</p>
        </div>

        {/* Tabs and Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-4 border-b border-gray-200 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('pagesAndPosts')}
              className={`pb-3 px-4 font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === 'pagesAndPosts'
                  ? 'text-green-600 border-b-2 border-green-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pages & Posts
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`pb-3 px-4 font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === 'categories'
                  ? 'text-green-600 border-b-2 border-green-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`pb-3 px-4 font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === 'scheduled'
                  ? 'text-green-600 border-b-2 border-green-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Scheduled Content
            </button>
          </div>

          {/* Action Buttons */}
          {activeTab === 'pagesAndPosts' && (
            <div className="flex gap-3 w-full sm:w-auto">
              {/* <button 
                className="w-full sm:w-auto px-4 py-2 text-black rounded-lg transition-all flex items-center justify-center gap-2 font-medium text-sm hover:opacity-90" 
                style={{ backgroundColor: '#A0EDA8' }}
              >
                <FileText size={18} />
                Create Page
              </button> */}
              <button 
                onClick={() => setCurrentView('createPost')}
                className="w-full sm:w-auto px-4 py-2 text-black rounded-lg transition-all flex items-center justify-center gap-2 font-medium text-sm hover:opacity-90" 
                style={{ backgroundColor: '#A0EDA8' }}
              >
                <Plus size={18} />
                Create Post
              </button>
            </div>
          )}

          {activeTab === 'categories' && (
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="w-full sm:w-auto px-4 py-2 text-black rounded-lg transition-all flex items-center justify-center gap-2 font-medium text-sm hover:opacity-90"
              style={{ backgroundColor: '#A0EDA8' }}
            >
              <Plus size={18} />
              Add Category
            </button>
          )}
        </div>

        {/* Pages Section */}
        {activeTab === 'pagesAndPosts' && (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pages</h2>
              <p className="text-sm text-gray-600 mb-4">Show all Pages</p>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last modified</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagesData.map((page) => (
                        <tr key={page.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{page.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{page.type}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{page.lastModified}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(page.status)}`}>
                              {page.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                              <MoreVertical size={18} className="text-gray-500" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Posts Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Posts</h2>
              <p className="text-sm text-gray-600 mb-4">Show all Posts</p>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Author</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last modified</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {postsData.map((post) => (
                        <tr key={post.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{post.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{post.type}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{post.author}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{post.lastModified}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(post.status)}`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                              <MoreVertical size={18} className="text-gray-500" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Categories Section */}
        {activeTab === 'categories' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
            <p className="text-sm text-gray-600 mb-4">Show all Categories</p>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Posts</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{category.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{category.posts}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(category.status)}`}>
                            {category.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} className="text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
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
          </div>
        )}

        {/* Scheduled Section */}
        {activeTab === 'scheduled' && (
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
                  {editingCategoryId ? 'Edit Category' : 'Add Category'}
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
                      setCategoryFormData({ ...categoryFormData, name: e.target.value })
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
                      setCategoryFormData({ ...categoryFormData, description: e.target.value })
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
                      setCategoryFormData({ ...categoryFormData, status: e.target.value })
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
                    style={{ backgroundColor: '#A0EDA8' }}
                  >
                    {editingCategoryId ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Main render
  return currentView === 'createPost' ? renderCreatePost() : renderDashboard();
};

export default CMSComplete;