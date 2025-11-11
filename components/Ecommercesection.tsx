"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Save,
  FileText,
  Package,
  ShoppingCart,
  TrendingUp,
  RotateCcw,
  Filter,
  Download,
  MoreVertical,
  AlertCircle,
  Check,
  ChevronDown,
  Tag,
  DollarSign,
  Percent,
  Box,
  Barcode as BarcodeIcon,
  Grid,
  List,
} from "lucide-react";
import Image from "next/image";

// -------------------- Types --------------------
interface Variant {
  _id?: string;
  id: number | string;
  size?: string;
  color?: string;
  material?: string;
  price?: number;
  stock?: number;
  lowStockAlert?: number;
  barcode?: string;
}

interface Product {
  _id?: string;
  id?: string | number;
  name?: string;
  description?: string;
  sku?: string;
  stock?: number;
  stockQuantity?: number;
  threshold?: number;
  price?: string | number;
  purchase?: string | number;
  valuation?: string | number;
  vendor?: string;
  category?: string;
  tags?: string[];
  gender?: string[];
  variants?: Variant[];
  gallery?: string[];
  inStock?: boolean;
}

interface Order {
  id: string;
  customer?: string;
  date?: string;
  total?: string;
  status?: string;
  items?: number;
}

// -------------------- Component --------------------
const ECommerceSection: React.FC = () => {
  // Navigation states
  const [currentView, setCurrentView] = useState<
    "inventory" | "addProduct" | "orders" | "discounts"
  >("inventory");
  const [activeTab, setActiveTab] = useState("product");

  // Product management states
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/products`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Products fetch failed: ${res.status} ${txt}`);
      }

      const data = await res.json();
      console.log("🔍 Raw response:", data);

      // Normalize possible structures
      const productsArray: Product[] = Array.isArray(data.products)
        ? data.products
        : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setProducts(productsArray);
    } catch (err: any) {
      console.error("❌ Error fetching products:", err);
      setError(err.message || "Failed to fetch products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders (production)
  const [orders, setOrders] = useState<Order[]>([]);
  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/orders`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );

      if (!res.ok) {
        const txt = await res.text();
        console.warn("Orders fetch failed:", res.status, txt);
        setOrders([]);
        return;
      }

      const data = await res.json();
      const ordersArray: Order[] = Array.isArray(data.orders)
        ? data.orders
        : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setOrders(ordersArray);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      setOrders([]);
    }
  };

  // Fetch once when component mounts
  useEffect(() => {
    fetchProducts();
    fetchOrders();
    const interval = setInterval(() => {
      fetchProducts();
      fetchOrders();
    }, 30000); // refresh every 30 sec
    return () => clearInterval(interval);
  }, []);

  // Selected product modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Edit Product
  const [variants, setVariants] = useState<Variant[]>([]);

  const handleEditProduct = (product: Product) => {
    setProductForm((prev) => ({
      ...prev,
      name: product.name || "",
      description: product.description || "",
      tags: product.tags || [],
      gender: product.gender || [],
      sku: product.sku || prev.sku,
      vendor: product.vendor || prev.vendor,
      category: product.category || prev.category,
      sellPrice: String(product.price ?? prev.sellPrice),
      basePrice: String(product.purchase ?? prev.basePrice),
    }));

    setVariants(product.variants || []);
    setCurrentView("addProduct");
  };

  // Delete Product (tolerant to _id/id, optimistic update)
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const prev = products;
    setProducts((p) => p.filter((x) => (x._id ?? x.id) !== id));

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/products/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Delete failed with ${res.status}`);
      }

      alert("Product deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Something went wrong while deleting the product");
      setProducts(prev);
    }
  };

  // Stats
  const stats = {
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + (Number(p.stockQuantity ?? p.stock ?? 0) || 0), 0),
    sold: orders.reduce((s, o) => s + (o.items || 0), 0),
    returns: 0,
  };

  // Add Product Form States
  type ProductForm = {
    name: string;
    description: string;
    gender: string[];
    basePrice: string;
    sellPrice: string;
    discount: string;
    discountType: "percentage" | "fixed" | string;
    category: string;
    vendor: string;
    tags: string[];
    primaryTag: string;
    secondaryTag: string;
    sku: string;
    barcode: string;
  };

  const [productForm, setProductForm] = useState<ProductForm>({
    name: "",
    description: "",
    gender: [],
    basePrice: "",
    sellPrice: "",
    discount: "",
    discountType: "percentage",
    category: "",
    vendor: "",
    tags: [],
    primaryTag: "",
    secondaryTag: "",
    sku: "",
    barcode: "",
  });

  // Variants initialised empty for production-ready
  // (but will show existing variants when editing a product)

  const [newVariant, setNewVariant] = useState<Partial<Variant>>({
    size: "",
    color: "",
    material: "",
    lowStockAlert: undefined,
    stock: undefined,
    barcode: "",
  });

  const [showAddVariant, setShowAddVariant] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<
    { id: number; url: string | ArrayBuffer | null; name: string }[]
  >([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // percent 0-100

  // File upload handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleMultipleFileUpload(files);
    }
  };

  const [realFiles, setRealFiles] = useState<File[]>([]);

  const handleMultipleFileUpload = (files: FileList | File[]) => {
    const newImages: { id: number; url: string | ArrayBuffer | null; name: string }[] = [];
    const fileArray = Array.from(files as FileList);
    const totalFiles = fileArray.length;

    fileArray.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push({ id: Date.now() + Math.random(), url: e.target?.result || "", name: file.name });
          if (newImages.length === totalFiles) {
            setUploadedImages((prev) => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    setRealFiles((prev) => [...prev, ...fileArray]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleMultipleFileUpload(files);
      setRealFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const removeImage = (id: any) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
    if (selectedImage >= uploadedImages.length - 1) {
      setSelectedImage(0);
    }
  };

  // Product form handlers
  const handleProductInputChange = (field: string, value: any) => {
    setProductForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenderChange = (gender: string) => {
    setProductForm((prev) => ({
      ...prev,
      gender: prev.gender.includes(gender) ? prev.gender.filter((g) => g !== gender) : [...prev.gender, gender],
    }));
  };

  const handleAddVariant = () => {
    if (newVariant.size) {
      const variant: Variant = {
        id: Date.now(),
        size: newVariant.size,
        color: newVariant.color,
        material: newVariant.material,
        price: Number(productForm.sellPrice) || 0,
        stock: Number(newVariant.stock) || 0,
        barcode: newVariant.barcode,
      };
      setVariants((prev) => [...prev, variant]);
      setNewVariant({ size: "", color: "", material: "", lowStockAlert: undefined, stock: undefined, barcode: "" });
      setShowAddVariant(false);
    }
  };

  const removeVariant = (id: number | string) => setVariants((prev) => prev.filter((v) => v.id !== id));

  const generateSKU = () => {
    const sku = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`.toUpperCase();
    handleProductInputChange("sku", sku);
  };

  const generateBarcode = () => Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");

  // Save product (uploads to backend)
  const handleSaveProduct = async () => {
    try {
      if (!productForm.name || !productForm.category) {
        alert("Please fill in product name and category.");
        return;
      }

      if (!realFiles || realFiles.length === 0) {
        alert('Please upload at least one valid image using "Browse Files" or drag and drop.');
        return;
      }

      const formData = new FormData();
      formData.append("name", productForm.name);
      formData.append("description", productForm.description);
      formData.append("price", productForm.sellPrice);
      formData.append("category", productForm.category);
      formData.append("vendor", productForm.vendor);
      formData.append("tags", JSON.stringify(productForm.tags || []));
      formData.append("gender", JSON.stringify(productForm.gender || []));
      formData.append("variants", JSON.stringify(variants || []));

      realFiles.forEach((file) => {
        if (file instanceof File) formData.append("images", file);
      });

      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

      setUploading(true);
      setUploadProgress(0);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/products/upload`;
        xhr.open("POST", apiUrl, true);

        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = async () => {
          setUploading(false);
          setUploadProgress(100);

          if (xhr.status === 201 || xhr.status === 200) {
            try {
              const resp = JSON.parse(xhr.responseText);

              if (resp && resp.product) setProducts((prev) => [...prev, resp.product]);
              else if (resp && resp.products) setProducts(resp.products);
              else {
                const newProduct: Product = {
                  id: Date.now(),
                  name: productForm.name,
                  stockQuantity: variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0),
                  threshold: 20,
                  purchase: `$${productForm.basePrice}`,
                  price: `$${productForm.sellPrice}`,
                  valuation: `${variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) * (Number(productForm.sellPrice) || 0)}`,
                  vendor: productForm.vendor || "Unknown",
                  category: productForm.category,
                  sku: productForm.sku,
                  variants,
                };
                setProducts((prev) => [...prev, newProduct]);
              }

              await fetchProducts();

              setProductForm({
                name: "",
                description: "",
                gender: [],
                basePrice: "",
                sellPrice: "",
                discount: "",
                discountType: "percentage",
                category: "",
                vendor: "",
                tags: [],
                primaryTag: "",
                secondaryTag: "",
                sku: "",
                barcode: "",
              });

              setVariants([]);
              setUploadedImages([]);
              setRealFiles([]);
              setSelectedImage(0);

              setCurrentView("inventory");
              resolve();
            } catch (err) {
              console.error("Error parsing upload response:", err);
              reject(err);
            }
          } else {
            console.error("❌ Upload failed:", xhr.status, xhr.responseText);
            alert(`Upload failed (${xhr.status}) — ${xhr.statusText}`);
            reject(new Error("Upload failed"));
          }
        };

        xhr.onerror = () => {
          setUploading(false);
          console.error("Network error during upload");
          alert("Network error during upload");
          reject(new Error("Network error"));
        };

        xhr.send(formData);
      });
    } catch (err) {
      console.error("Upload error:", err);
      alert("An unexpected error occurred while uploading the product.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock <= 5) return { text: "Critical", color: "text-red-600 bg-red-50" };
    if (stock <= threshold) return { text: "Low Stock", color: "text-yellow-600 bg-yellow-50" };
    return { text: "In Stock", color: "text-green-600 bg-green-50" };
  };

  // -------------------- Render Inventory --------------------
  const renderInventory = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total Products</span>
            <Package className="text-gray-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total Stock</span>
            <Box className="text-gray-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalStock}</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Sold</span>
            <ShoppingCart className="text-gray-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.sold}</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Return</span>
            <RotateCcw className="text-gray-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.returns}</div>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Product List</h2>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Filter size={20} className="text-gray-600" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Download size={20} className="text-gray-600" /></button>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Threshold</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Purchase</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Valuation</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Supplier</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500"><RotateCcw className="inline-block animate-spin mr-2" size={18} />Loading products...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-red-600 bg-red-50 border-y">⚠️ {error}</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500 bg-gray-50">No products found. Try adding one.</td>
                </tr>
              ) : (
                products.map((product) => {
                  const status = getStockStatus(product.stockQuantity ?? product.variants?.[0]?.stock ?? 0, product.threshold || 20);

                  return (
                    <tr key={product._id ?? product.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4"><div><div className="text-sm font-medium text-gray-900">{product.name}</div><div className="text-xs text-gray-500">SKU: {product.sku || "—"}</div></div></td>
                      <td className="px-6 py-4"><div className="flex items-center gap-2"><span className="text-sm text-gray-900">{product.stockQuantity ?? 0}</span><span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>{status.text}</span></div></td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.threshold || 20}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">${product.purchase || "0.00"}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">${product.price || "0.00"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">${product.valuation || "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.vendor || "—"}</td>
                      <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => { setSelectedProduct(product); setShowProductModal(true); }} className="p-2 rounded-lg hover:bg-green-50 text-green-600" title="View Details"><FileText size={18} /></button><button onClick={() => handleEditProduct(product)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600" title="Edit Product"><Edit size={18} /></button><button onClick={() => handleDeleteProduct(String(product._id ?? product.id))} className="p-2 rounded-lg hover:bg-red-50 text-red-600" title="Delete Product"><Trash2 size={18} /></button></div></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Product Details Modal */}
        {showProductModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
              <button onClick={() => setShowProductModal(false)} className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"><X size={22} /></button>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{selectedProduct.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Images</h3>
                  <div className="grid grid-cols-2 gap-2">{selectedProduct.gallery?.length > 0 ? (selectedProduct.gallery.map((img: string, idx: number) => (<img key={idx} src={img} alt="product" className="rounded-lg border object-cover w-full h-32" />))) : (<p className="text-sm text-gray-500">No images available.</p>)}</div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Details</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li><strong>Category:</strong> {selectedProduct.category}</li>
                    <li><strong>Vendor:</strong> {selectedProduct.vendor || "—"}</li>
                    <li><strong>Gender:</strong> {selectedProduct.gender?.join(", ") || "—"}</li>
                    <li><strong>Tags:</strong> {selectedProduct.tags?.join(", ") || "—"}</li>
                    <li><strong>Price:</strong> ${selectedProduct.price}</li>
                    <li><strong>Stock:</strong> {selectedProduct.stockQuantity}</li>
                    <li><strong>SKU:</strong> {selectedProduct.sku}</li>
                    <li><strong>Status:</strong> {selectedProduct.inStock ? <span className="text-green-600">In Stock</span> : <span className="text-red-600">Out of Stock</span>}</li>
                  </ul>
                </div>
              </div>

              {selectedProduct.variants?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Variants</h3>
                  <table className="w-full border border-gray-200 text-sm rounded-lg">
                    <thead className="bg-gray-50 border-b"><tr><th className="py-2 px-3 text-left font-semibold text-gray-700">Size</th><th className="py-2 px-3 text-left font-semibold text-gray-700">Color</th><th className="py-2 px-3 text-left font-semibold text-gray-700">Stock</th><th className="py-2 px-3 text-left font-semibold text-gray-700">Material</th></tr></thead>
                    <tbody>{selectedProduct.variants.map((v: Variant, idx: number) => (<tr key={idx} className="border-t"><td className="py-2 px-3">{v.size || "—"}</td><td className="py-2 px-3">{v.color || "—"}</td><td className="py-2 px-3">{v.stock ?? 0}</td><td className="py-2 px-3">{v.material || "—"}</td></tr>))}</tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // -------------------- Render Add Product --------------------
  const renderAddProduct = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Product Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-900 rounded-lg"><FileText size={20} className="text-white" /></div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Product</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name Product</label>
              <input type="text" value={productForm.name} onChange={(e) => handleProductInputChange("name", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Enter product name" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description Product</label>
              <textarea value={productForm.description} onChange={(e) => handleProductInputChange("description", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="Enter product description" rows={4} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <div className="text-xs text-gray-500 mb-3">Pick available gender</div>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={productForm.gender.includes("Men")} onChange={() => handleGenderChange("Men")} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" /><span className="text-sm text-gray-700">Men</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={productForm.gender.includes("Women")} onChange={() => handleGenderChange("Women")} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" /><span className="text-sm text-gray-700">Women</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={productForm.gender.includes("Unisex")} onChange={() => handleGenderChange("Unisex")} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" /><span className="text-sm text-gray-700">Unisex</span></label>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing and Stock */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-gray-900 rounded-lg"><DollarSign size={20} className="text-white" /></div><h2 className="text-xl font-semibold text-gray-900">Pricing and Stock</h2></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base Pricing</label>
              <input type="number" value={productForm.basePrice} onChange={(e) => handleProductInputChange("basePrice", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sell Price</label>
              <input type="number" value={productForm.sellPrice} onChange={(e) => handleProductInputChange("sellPrice", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
              <input type="number" value={productForm.discount} onChange={(e) => handleProductInputChange("discount", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount type</label>
              <select value={productForm.discountType} onChange={(e) => handleProductInputChange("discountType", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></select>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-semibold text-gray-900">Add Variants</h2>{!showAddVariant && (<button onClick={() => setShowAddVariant(true)} className="px-4 py-2 text-black text-sm font-medium rounded-lg hover:opacity-90" style={{ backgroundColor: "#A0EDA8" }}>Add Variants</button>)}</div>

          {showAddVariant && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Size</label><input type="text" value={String(newVariant.size ?? "")} onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., M, L, XL" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Color</label><input type="text" value={String(newVariant.color ?? "")} onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., Black, Blue" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Material</label><input type="text" value={String(newVariant.material ?? "")} onChange={(e) => setNewVariant({ ...newVariant, material: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., Wool, Cotton" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Alert</label><input type="number" value={String(newVariant.lowStockAlert ?? "")} onChange={(e) => setNewVariant({ ...newVariant, lowStockAlert: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="21" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Stock</label><input type="number" value={String(newVariant.stock ?? "")} onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value ? Number(e.target.value) : undefined })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="77" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Barcode value</label><input type="text" value={String(newVariant.barcode ?? "")} onChange={(e) => setNewVariant({ ...newVariant, barcode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="2324kvbs-2" /></div>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input type="text" value={productForm.sku} onChange={(e) => handleProductInputChange("sku", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="2324kvbs-2" />
                </div>
                <div className="flex items-center gap-3 mt-7">
                  <button onClick={handleAddVariant} className="px-4 py-2 text-black text-sm font-medium rounded-lg hover:opacity-90" style={{ backgroundColor: "#A0EDA8" }}>Add Variants</button>
                  <button onClick={generateSKU} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Generate SKU</button>
                </div>
              </div>
            </div>
          )}

          {/* Variants Table */}
          {variants.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-200"><th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Size</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Color</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Material</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Stock</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th></tr></thead>
                <tbody>{variants.map((variant) => (<tr key={variant._id || variant.id || `${variant.size}-${variant.color}-${Math.random()}`} className="border-b border-gray-200"><td className="px-4 py-3 text-sm text-gray-900">{variant.size}</td><td className="px-4 py-3 text-sm text-gray-600">{variant.color}</td><td className="px-4 py-3 text-sm text-gray-600">{variant.material}</td><td className="px-4 py-3 text-sm text-gray-900">${variant.price}</td><td className="px-4 py-3 text-sm text-gray-600">{variant.stock}</td><td className="px-4 py-3"><button onClick={() => removeVariant(variant.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button></td></tr>))}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Upload & Metadata */}
      <div className="lg:col-span-1 space-y-6">
        {/* Upload Images */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload img</h3>

          {/* Main Image Display */}
          {uploadedImages.length > 0 ? (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <Image src={typeof uploadedImages[selectedImage]?.url === "string" ? (uploadedImages[selectedImage]?.url as string) : "/placeholder.png"} alt="Product" width={500} height={500} className="w-full h-64 object-contain rounded-lg" unoptimized />
                <button onClick={() => removeImage(uploadedImages[selectedImage]?.id)} className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:shadow-lg"><X size={16} className="text-gray-600" /></button>
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-2">{uploadedImages.map((img, index) => (<button key={img.id} onClick={() => setSelectedImage(index)} className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${selectedImage === index ? "border-green-500" : "border-gray-200"}`}><img src={typeof img.url === "string" ? (img.url as string) : ""} alt="" className="w-full h-full object-cover" /></button>))}{uploadedImages.length < 4 && (<label htmlFor="add-more-images" className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-500"><Plus size={20} className="text-gray-400" /><input id="add-more-images" type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" /></label>)}</div>
            </div>
          ) : (
            <div className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? "border-green-500 bg-green-50" : "border-gray-300"}`} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
              <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">Drag and drop images here</p>
              <p className="text-xs text-gray-500 mb-4">or</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="px-4 py-2 text-black text-sm font-medium rounded-lg cursor-pointer hover:opacity-90 inline-block" style={{ backgroundColor: "#A0EDA8" }}>Browse Files</label>
            </div>
          )}
        </div>

        {/* Category */}
        <div className="bg-white rounded-xl border border-gray-200 p-6"><h3 className="text-lg font-semibold text-gray-900 mb-4">Category</h3><div><label className="block text-sm font-medium text-gray-700 mb-2">Product Categories</label><select value={productForm.category} onChange={(e) => handleProductInputChange("category", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"><option value="">Select category</option><option value="Mens">Mens</option><option value="Womens">Womens</option><option value="Accessories">Accessories</option><option value="Footwear">Footwear</option></select></div></div>

        {/* Vendor */}
        <div className="bg-white rounded-xl border border-gray-200 p-6"><h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor</h3><input type="text" value={productForm.vendor} onChange={(e) => handleProductInputChange("vendor", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Enter vendor name" /></div>

        {/* Tags */}
        <div className="bg-white rounded-xl border border-gray-200 p-6"><h3 className="text-lg font-semibold text-gray-900 mb-4">Tag</h3><input type="text" value={productForm.tags.join(", ")} onChange={(e) => handleProductInputChange("tags", e.target.value.split(", "))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-3" placeholder="Enter tags separated by comma" /><button className="w-full px-4 py-2 text-black text-sm font-medium rounded-lg hover:opacity-90" style={{ backgroundColor: "#A0EDA8" }}>Save</button></div>

        {/* Custom Product Metadata */}
        <div className="bg-white rounded-xl border border-gray-200 p-6"><h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Product Metadata</h3><div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-2">Primary tag</label><input type="text" value={productForm.primaryTag} onChange={(e) => handleProductInputChange("primaryTag", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Enter primary tag" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Secondary tag</label><input type="text" value={productForm.secondaryTag} onChange={(e) => handleProductInputChange("secondaryTag", e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Enter secondary tag" /></div><button className="w-full px-4 py-2 text-black text-sm font-medium rounded-lg hover:opacity-90" style={{ backgroundColor: "#A0EDA8" }}>Add Metadata</button></div></div>
      </div>
    </div>
  );

  // -------------------- Render Orders --------------------
  const renderOrders = () => (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Orders Management</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50"><th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th></tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors"><td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td><td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td><td className="px-6 py-4 text-sm text-gray-600">{order.date}</td><td className="px-6 py-4 text-sm text-gray-600">{order.items}</td><td className="px-6 py-4 text-sm font-medium text-gray-900">{order.total}</td><td className="px-6 py-4"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${order.status === "Delivered" ? "bg-green-100 text-green-800" : order.status === "Shipped" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>{order.status}</span></td><td className="px-6 py-4"><button className="p-1 hover:bg-gray-200 rounded transition-colors"><MoreVertical size={18} className="text-gray-500" /></button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // -------------------- Main Render --------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900">E-Commerce Management</h1><p className="text-sm text-gray-600 mt-1">Manage your website's Ecommerce</p></div><div className="flex items-center gap-3">{currentView === "inventory" && (<><button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"><FileText size={18} />Draft</button><button onClick={() => setCurrentView("addProduct")} className="px-4 py-2 text-black font-medium rounded-lg hover:opacity-90 flex items-center gap-2" style={{ backgroundColor: "#A0EDA8" }}><Plus size={18} />Save & Publish</button></>)}{currentView === "addProduct" && (<><button onClick={() => setCurrentView("inventory")} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">Cancel</button><button onClick={handleSaveProduct} className="px-4 py-2 text-black font-medium rounded-lg hover:opacity-90 flex items-center gap-2" style={{ backgroundColor: "#A0EDA8" }} disabled={uploading}>{uploading ? (<><RotateCcw size={18} className="animate-spin" />Uploading {uploadProgress}%</>) : (<><Save size={18} />Save & Publish</>)}</button></>)}</div></div></div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6"><div className="flex gap-6"><button onClick={() => setActiveTab("product")} className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === "product" ? "text-green-600 border-green-500" : "text-gray-600 border-transparent hover:text-gray-900"}`}>Product</button><button onClick={() => { setActiveTab("inventory"); setCurrentView("inventory"); }} className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === "inventory" ? "text-green-600 border-green-500" : "text-gray-600 border-transparent hover:text-gray-900"}`}>Inventory</button><button onClick={() => { setActiveTab("order"); setCurrentView("orders"); }} className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === "order" ? "text-green-600 border-green-500" : "text-gray-600 border-transparent hover:text-gray-900"}`}>Order</button><button onClick={() => setActiveTab("discounts")} className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === "discounts" ? "text-green-600 border-green-500" : "text-gray-600 border-transparent hover:text-gray-900"}`}>Discounts & Coupons</button></div></div>

      {/* Content Area */}
      <div className="p-6">{currentView === "inventory" && renderInventory()}{currentView === "addProduct" && renderAddProduct()}{currentView === "orders" && renderOrders()}{activeTab === "discounts" && (<div className="bg-white rounded-xl shadow-sm p-8 text-center"><p className="text-gray-600">Discounts & Coupons management coming soon</p></div>)}</div>
    </div>
  );
};

export default ECommerceSection;
