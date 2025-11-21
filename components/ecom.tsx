// Part 1/3
"use client";
import { usePathname } from "next/navigation";
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

  // extra fields
  highlights?: string;
  materialDetails?: string;
  careInstructions?: string;
  notes?: string;
  terms?: string;
  specifications?: {
    material?: string;
    fit?: string;
    washCare?: string;
    pattern?: string;
    origin?: string;
    brand?: string;
    others?: string;
  };
  faq?: Array<{ question?: string; answer?: string }>;
  customerPhotos?: string[]; // URLs
}

interface Order {
  id: string;
  customer?: string;
  date?: string;
  total?: string;
  status?: string;
  items?: number;
}

const getStockBadgeColor = (statusText: string) => {
  switch (statusText) {
    case "Critical":
      return "bg-red-500 badge-text-white";
    case "Low Stock":
      return "bg-yellow-500 badge-text-white";
    case "In Stock":
      return "bg-green-500 badge-text-white";
    default:
      return "bg-gray-500 badge-text-white";
  }
};

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

  const pathname = usePathname();

  // Sync tab with URL on refresh
  useEffect(() => {
    if (pathname?.includes("/ecom/inventory") || pathname?.endsWith("/ecom")) {
      setActiveTab("inventory");
      setCurrentView("inventory");
    } else if (pathname?.includes("/ecom/orders")) {
      setActiveTab("order");
      setCurrentView("orders");
    } else if (pathname?.includes("/ecom/discounts")) {
      setActiveTab("discounts");
    }
  }, [pathname]);

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
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/orders`
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

  // DELETE
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const prev = products;
    setProducts((p) => p.filter((x) => (x._id ?? x.id) !== id));

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || ""
          : "";
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
    totalStock: products.reduce(
      (sum, p) => sum + (Number(p.stockQuantity ?? p.stock ?? 0) || 0),
      0
    ),
    sold: orders.reduce((s, o) => s + (o.items || 0), 0),
    returns: 0,
  };

  // -------------------- Product Form (extended) --------------------
  type ProductForm = {
    name: string;
    description: string;
    gender: string[]; // we will also keep category single-select
    basePrice: string;
    sellPrice: string;
    discount: string;
    discountType: "percentage" | "fixed" | string;
    category: string; // single-select
    vendor: string;
    tags: string[];
    primaryTag: string;
    secondaryTag: string;
    sku: string;
    barcode: string;

    // extras
    highlights: string;
    materialDetails: string;
    careInstructions: string;
    notes: string;
    terms: string;
    specifications: {
      material: string;
      fit: string;
      washCare: string;
      pattern: string;
      origin: string;
      brand: string;
      others: string;
    };
    faq: Array<{ question: string; answer: string }>;
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

    highlights: "",
    materialDetails: "",
    careInstructions: "",
    notes: "",
    terms: "",
    specifications: {
      material: "",
      fit: "",
      washCare: "",
      pattern: "",
      origin: "",
      brand: "",
      others: "",
    },
    faq: [],
  });

  // upload / image states
  const [newVariant, setNewVariant] = useState<Partial<Variant>>({
    size: "",
    color: "",
    material: "",
    lowStockAlert: undefined,
    stock: undefined,
    barcode: "",
  });
  const [showAddVariant, setShowAddVariant] = useState(false);

  // Option 1 states (stable upload model)
  // existingImages: URLs already on S3 (strings). These are shown for edit.
  // newImages: File[] that will be uploaded when saving.
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  // previews for both (combined)
  const [imagePreviews, setImagePreviews] = useState<
    { id: number; url: string | ArrayBuffer | null; name: string }[]
  >([]);

  const [existingCustomerPhotos, setExistingCustomerPhotos] = useState<
    string[]
  >([]); // URLs
  const [newCustomerPhotoFiles, setNewCustomerPhotoFiles] = useState<File[]>(
    []
  );
  const [customerPhotosPreview, setCustomerPhotosPreview] = useState<
    { id: number; url: string | ArrayBuffer | null; name: string }[]
  >([]);

  const [selectedImage, setSelectedImage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // percent 0-100

  // -------------------- file handlers --------------------
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
      handleNewImageFiles(Array.from(files));
    }
  };

  // Helper: push previews for files
  const addPreviewsForFiles = (files: File[]) => {
    const previews: {
      id: number;
      url: string | ArrayBuffer | null;
      name: string;
    }[] = [];
    let processed = 0;
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        processed++;
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push({
          id: Date.now() + Math.random(),
          url: e.target?.result || "",
          name: file.name,
        });
        processed++;
        if (processed === files.length) {
          setImagePreviews((prev) => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
    // if none are image files, nothing will be pushed
  };

  // Called on file input change for product images
  const handleNewImageFiles = (files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    if (imgs.length === 0) return;
    setNewImages((prev) => [...prev, ...imgs]);
    addPreviewsForFiles(imgs);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleNewImageFiles(Array.from(files));
    }
  };

  // remove existing image (by URL)
  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
    // also remove preview entries that match url
    setImagePreviews((prev) => prev.filter((p) => p.url !== url));
  };

  // remove new image file (by name) - will remove preview by name too
  const removeNewImage = (name: string) => {
    setNewImages((prev) => prev.filter((f) => f.name !== name));
    setImagePreviews((prev) => prev.filter((p) => p.name !== name));
  };

  // new: customer photos file select
  const handleCustomerPhotosSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;

    // add to newCustomerPhotoFiles
    setNewCustomerPhotoFiles((prev) => [...prev, ...arr]);

    // add previews
    const previews: {
      id: number;
      url: string | ArrayBuffer | null;
      name: string;
    }[] = [];
    let processed = 0;
    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        previews.push({
          id: Date.now() + Math.random(),
          url: ev.target?.result || "",
          name: file.name,
        });
        processed++;
        if (processed === arr.length) {
          setCustomerPhotosPreview((prev) => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingCustomerPhoto = (url: string) => {
    setExistingCustomerPhotos((prev) => prev.filter((u) => u !== url));
    setCustomerPhotosPreview((prev) => prev.filter((p) => p.url !== url));
  };

  const removeNewCustomerPhotoFile = (name: string) => {
    setNewCustomerPhotoFiles((prev) => prev.filter((f) => f.name !== name));
    setCustomerPhotosPreview((prev) => prev.filter((p) => p.name !== name));
  };

  // -------------------- form handlers --------------------
  const handleProductInputChange = (field: string, value: any) => {
    setProductForm((prev) => ({
      ...prev,
      // @ts-ignore dynamic
      [field]: value,
    }));
  };

  const handleGenderChange = (gender: string) => {
    setProductForm((prev) => ({
      ...prev,
      gender: prev.gender.includes(gender)
        ? prev.gender.filter((g) => g !== gender)
        : [...prev.gender, gender],
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
      setNewVariant({
        size: "",
        color: "",
        material: "",
        lowStockAlert: undefined,
        stock: undefined,
        barcode: "",
      });
      setShowAddVariant(false);
    }
  };

  const removeVariant = (id: number | string) =>
    setVariants((prev) => prev.filter((v) => v.id !== id));

  const generateSKU = () => {
    const sku = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`.toUpperCase();
    handleProductInputChange("sku", sku);
  };

  const generateBarcode = () =>
    Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");

  // -------------------- handleEditProduct (populate form) --------------------
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

      // extras
      highlights: product.highlights || "",
      materialDetails: product.materialDetails || "",
      careInstructions: product.careInstructions || "",
      notes: product.notes || "",
      terms: product.terms || "",
      specifications: {
        material: product.specifications?.material || "",
        fit: product.specifications?.fit || "",
        washCare: product.specifications?.washCare || "",
        pattern: product.specifications?.pattern || "",
        origin: product.specifications?.origin || "",
        brand: product.specifications?.brand || "",
        others: product.specifications?.others || "",
      },
      faq: product.faq?.length
        ? product.faq.map((f) => ({
            question: f.question || "",
            answer: f.answer || "",
          }))
        : [],
    }));

    setVariants(product.variants || []);

    // populate existingImages (S3 URLs)
    setExistingImages(product.gallery || []);
    // create previews for existing images
    const existingPreviews = (product.gallery || []).map((g) => ({
      id: Date.now() + Math.random(),
      url: g,
      name: g.split("/").slice(-1)[0] || g,
    }));
    setImagePreviews(existingPreviews);

    // customer photos
    setExistingCustomerPhotos(product.customerPhotos || []);
    const custPreviews = (product.customerPhotos || []).map((g) => ({
      id: Date.now() + Math.random(),
      url: g,
      name: g.split("/").slice(-1)[0] || g,
    }));
    setCustomerPhotosPreview(custPreviews);

    setCurrentView("addProduct");
  };
// Part 2/3 (continued)
  // -------------------- Save product (uploads to backend) --------------------
  const handleSaveProduct = async () => {
    try {
      if (!productForm.name || !productForm.category) {
        alert("Please fill in product name and category.");
        return;
      }

      // if creating new product and no existingImages and no newImages -> require at least one image
      if (existingImages.length === 0 && newImages.length === 0) {
        alert('Please upload at least one valid image using "Browse Files" or drag and drop.');
        return;
      }

      const formData = new FormData();
      formData.append("name", productForm.name);
      formData.append("description", productForm.description);
      formData.append("price", productForm.sellPrice);
      formData.append("category", productForm.category); // single select
      formData.append("vendor", productForm.vendor);
      formData.append("tags", JSON.stringify(productForm.tags || []));
      // keep old gender array for compat, but "category" is the main single-select.
      formData.append("gender", JSON.stringify(productForm.gender || []));
      formData.append("variants", JSON.stringify(variants || []));

      // extra fields
      formData.append("highlights", productForm.highlights || "");
      formData.append("materialDetails", productForm.materialDetails || "");
      formData.append("careInstructions", productForm.careInstructions || "");
      formData.append("notes", productForm.notes || "");
      formData.append("terms", productForm.terms || "");
      formData.append("specifications", JSON.stringify(productForm.specifications || {}));
      formData.append("faq", JSON.stringify(productForm.faq || []));

      // IMPORTANT: include existing image URLs so backend can keep them (no reupload)
      formData.append("existingGallery", JSON.stringify(existingImages || []));
      formData.append("existingCustomerPhotos", JSON.stringify(existingCustomerPhotos || []));

      // append new product images (files)
      newImages.forEach((file) => {
        if (file instanceof File) formData.append("images", file);
      });

      // append new customer photos (files)
      newCustomerPhotoFiles.forEach((file) => {
        if (file instanceof File) formData.append("customerPhotos", file);
      });

      // If editing an existing product we should send product id; your UI currently doesn't track "editing id" separately.
      // We'll infer: if productForm.sku matches an existing product's SKU OR if selectedProduct exists, send selectedProduct._id
      if (selectedProduct?._id) {
        formData.append("productId", String(selectedProduct._id));
      }

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
              if (resp && resp.product) {
                // if product returned, update list (replace if same id)
                setProducts((prev) => {
                  const idx = prev.findIndex((p) => (p._id ?? p.id) === resp.product._id);
                  if (idx >= 0) {
                    const copy = [...prev];
                    copy[idx] = resp.product;
                    return copy;
                  }
                  return [resp.product, ...prev];
                });
              } else if (resp && resp.products) {
                setProducts(resp.products);
              } else {
                // fallback: push a synthetic product
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
                  gallery: existingImages,
                  customerPhotos: existingCustomerPhotos,
                };
                setProducts((prev) => [newProduct, ...prev]);
              }

              await fetchProducts();

              // reset form
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

                highlights: "",
                materialDetails: "",
                careInstructions: "",
                notes: "",
                terms: "",
                specifications: {
                  material: "",
                  fit: "",
                  washCare: "",
                  pattern: "",
                  origin: "",
                  brand: "",
                  others: "",
                },
                faq: [],
              });

              setVariants([]);
              setExistingImages([]);
              setNewImages([]);
              setImagePreviews([]);
              setSelectedImage(0);
              setExistingCustomerPhotos([]);
              setNewCustomerPhotoFiles([]);
              setCustomerPhotosPreview([]);
              setSelectedProduct(null);

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

  // -------------------- TABS (vertical sidebar) UI state --------------------
  const [detailsTab, setDetailsTab] = useState<
    "details" | "specs" | "faq" | "customer" | "notes" | "terms"
  >("details");

  // ------------------ helper small UI functions ------------------
  const isPreviewFromExisting = (preview: { id: number; url: any; name: string }) => {
    // we identify existing previews by url being a string that matches an existingImages entry
    return typeof preview.url === "string" && existingImages.includes(preview.url as string);
  };

  const isPreviewFromNewFile = (preview: { id: number; url: any; name: string }) => {
    return newImages.some((f) => f.name === preview.name);
  };
// Part 3/3 (continued)
  // ------------- Render Inventory -------------
  const renderInventory = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] rounded-xl p-6 border border-[var(--borderColor)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--textSecondary)] text-sm">Total Products</span>
            <Package className="text-gray-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-[var(--textPrimary)]">{stats.totalProducts}</div>
        </div>

        <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] rounded-xl p-6 border border-[var(--borderColor)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--textSecondary)] text-sm">Total Stock</span>
            <Box className="text-gray-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-[var(--textPrimary)]">{stats.totalStock}</div>
        </div>

        <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] rounded-xl p-6 border border-[var(--borderColor)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--textSecondary)] text-sm">Sold</span>
            <ShoppingCart className="text-gray-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-[var(--textPrimary)]">{stats.sold}</div>
        </div>

        <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] rounded-xl p-6 border border-[var(--borderColor)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--textSecondary)] text-sm">Return</span>
            <RotateCcw className="text-gray-400" size={20} />
          </div>
          <div className="text-2xl font-bold text-[var(--textPrimary)]">{stats.returns}</div>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] rounded-xl border border-[var(--borderColor)]">
        <div className="p-6 border-b border-[var(--borderColor)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--textPrimary)]">Product List</h2>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter size={20} className="text-[var(--textSecondary)]" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Download size={20} className="text-[var(--textSecondary)]" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--borderColor)] bg-[var(--background)] dark:bg-[var(--bgCard)]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--textPrimary)]"> Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--textPrimary)]"> Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--textPrimary)]"> Threshold</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--textPrimary)]"> Purchase</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--textPrimary)]"> Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--textPrimary)]"> Valuation</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--textPrimary)]"> Supplier</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--textPrimary)]"> Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500">
                    <RotateCcw className="inline-block animate-spin mr-2" size={18} /> Loading products...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-red-600 bg-red-50 border-y">⚠️ {error}</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500 bg-[var(--background)] dark:bg-[var(--bgCard)]">No products found. Try adding one.</td>
                </tr>
              ) : (
                products.map((product) => {
                  const status = getStockStatus(product.stockQuantity ?? product.variants?.[0]?.stock ?? 0, product.threshold || 20);
                  return (
                    <tr key={product._id ?? product.id} className="border-b border-[var(--borderColor)] hover:bg-[var(--background)] dark:bg-[var(--bgCard)] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-[var(--textPrimary)]">{product.name}</div>
                          <div className="text-xs text-gray-500">SKU: {product.sku || "—"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[var(--textPrimary)]">{product.stockQuantity ?? 0}</span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStockBadgeColor(status.text)}`}>{status.text}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--textSecondary)]">{product.threshold || 0}</td>
                      <td className="px-6 py-4 text-sm text-[var(--textSecondary)]">${product.purchase || "0.00"}</td>
                      <td className="px-6 py-4 text-sm font-medium text-[var(--textPrimary)]">${product.price || "0.00"}</td>
                      <td className="px-6 py-4 text-sm text-[var(--textSecondary)]">${product.valuation || "—"}</td>
                      <td className="px-6 py-4 text-sm text-[var(--textSecondary)]">{product.vendor || "—"}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setSelectedProduct(product); setShowProductModal(true); }} className="p-2 rounded-lg hover:bg-green-50 text-green-600" title="View Details"><FileText size={18} /></button>
                          <button onClick={() => handleEditProduct(product)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600" title="Edit Product"><Edit size={18} /></button>
                          <button onClick={() => handleDeleteProduct(String(product._id ?? product.id))} className="p-2 rounded-lg hover:bg-red-50 text-red-600" title="Delete Product"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Product Details Modal */}
        {showProductModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`dark: bg-[var(--background)] border border-[var(--borderColor)] rounded-2xl shadow-2xl w-full max-w-4xl p-6 relative overflow-y-auto max-h-[92vh] transition-all duration-300`}>
              <button onClick={() => setShowProductModal(false)} className="absolute top-3 right-3 text-[var(--textSecondary)] hover:text-[var(--textPrimary)] transition"><X size={24} /></button>

              <h2 className="text-2xl font-bold text-[var(--textPrimary)] mb-6">{selectedProduct.name}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--textPrimary)] mb-3">Images</h3>
                  <div className="w-full h-72 md:h-80 rounded-xl overflow-hidden border border-[var(--borderColor)] bg-[var(--background)] dark:bg-[var(--background)] flex items-center justify-center">
                    {selectedProduct.gallery?.[0] ? <img src={selectedProduct.gallery[0]} alt="product" className="w-full h-full object-contain" /> : <span className="text-[var(--textSecondary)]">No Image</span>}
                  </div>

                  {selectedProduct.gallery && selectedProduct.gallery.length > 1 && (
                    <div className="mt-4 flex gap-3">
                      {selectedProduct.gallery.map((img: string, idx: number) => (
                        <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-[var(--borderColor)] bg-[var(--background)] dark:bg-[var(--background)] shadow-sm">
                          <img src={img} alt="" className="object-cover w-full h-full" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[var(--textPrimary)] mb-4">Details</h3>
                  <ul className="text-sm space-y-2 text-[var(--textPrimary)]">
                    <li><strong>Category:</strong> {selectedProduct.category || "—"}</li>
                    <li><strong>Vendor:</strong> {selectedProduct.vendor || "—"}</li>
                    <li><strong>Gender:</strong> {selectedProduct.gender?.join(", ") || "—"}</li>
                    <li><strong>Tags:</strong> {selectedProduct.tags?.join(", ") || "—"}</li>
                    <li><strong>Price:</strong> ${selectedProduct.price ?? "—"}</li>
                    <li><strong>Stock:</strong> {selectedProduct.stockQuantity ?? "—"}</li>
                    <li><strong>SKU:</strong> {selectedProduct.sku || "—"}</li>
                    <li><strong>Status:</strong> <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedProduct.inStock ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{selectedProduct.inStock ? "In Stock" : "Out of Stock"}</span></li>
                  </ul>
                </div>
              </div>

              {Array.isArray(selectedProduct?.variants) && selectedProduct.variants.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-[var(--textPrimary)] mb-4">Variants</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-[var(--borderColor)] text-sm rounded-lg">
                      <thead className="bg-[var(--background-card)]">
                        <tr>
                          <th className="py-2 px-3 text-left">Size</th>
                          <th className="py-2 px-3 text-left">Color</th>
                          <th className="py-2 px-3 text-left">Stock</th>
                          <th className="py-2 px-3 text-left">Material</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProduct.variants.map((v, idx) => (
                          <tr key={idx} className="border-t border-[var(--borderColor)]">
                            <td className="py-2 px-3">{v.size || "—"}</td>
                            <td className="py-2 px-3">{v.color || "—"}</td>
                            <td className="py-2 px-3">{v.stock ?? 0}</td>
                            <td className="py-2 px-3">{v.material || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // -------------------- Render Add Product (with vertical tabs) --------------------
  const renderAddProduct = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Product Details (main) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Information */}
        <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] rounded-xl border border-[var(--borderColor)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-900 rounded-lg">
              <FileText size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--textPrimary)]">Add / Edit Product</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name Product</label>
              <input type="text" value={productForm.name} onChange={(e) => handleProductInputChange("name", e.target.value)} className="w-full px-4 py-2.5 border border-[var(--borderColor)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Enter product name" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description Product</label>
              <textarea value={productForm.description} onChange={(e) => handleProductInputChange("description", e.target.value)} className="w-full px-4 py-2.5 border border-[var(--borderColor)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="Enter product description" rows={4} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select value={productForm.category} onChange={(e) => handleProductInputChange("category", e.target.value)} className="w-full px-4 py-2.5 border border-[var(--borderColor)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select category</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Heritage">Heritage</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={productForm.gender.includes("Men")} onChange={(e) => { if (e.target.checked) handleProductInputChange("gender", [...productForm.gender, "Men"]); else handleProductInputChange("gender", productForm.gender.filter((g) => g !== "Men")); }} />
                    <span>Men</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={productForm.gender.includes("Women")} onChange={(e) => { if (e.target.checked) handleProductInputChange("gender", [...productForm.gender, "Women"]); else handleProductInputChange("gender", productForm.gender.filter((g) => g !== "Women")); }} />
                    <span>Women</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={productForm.gender.includes("Unisex")} onChange={(e) => { if (e.target.checked) handleProductInputChange("gender", [...productForm.gender, "Unisex"]); else handleProductInputChange("gender", productForm.gender.filter((g) => g !== "Unisex")); }} />
                    <span>Unisex</span>
                  </label>
                </div>

                <p className="text-xs text-[var(--textSecondary)] mt-1">Multi select — Choose who this product is for</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                <input type="text" value={productForm.vendor} onChange={(e) => handleProductInputChange("vendor", e.target.value)} className="w-full px-4 py-2.5 border border-[var(--borderColor)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Enter vendor name" />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing and Stock */}
        <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] rounded-xl border border-[var(--borderColor)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-900 rounded-lg">
              <DollarSign size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--textPrimary)]">Pricing and Stock</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base Pricing</label>
              <input type="number" value={productForm.basePrice} onChange={(e) => handleProductInputChange("basePrice", e.target.value)} className="w-full px-4 py-2.5 border border-[var(--borderColor)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sell Price</label>
              <input type="number" value={productForm.sellPrice} onChange={(e) => handleProductInputChange("sellPrice", e.target.value)} className="w-full px-4 py-2.5 border border-[var(--borderColor)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
              <input type="number" value={productForm.discount} onChange={(e) => handleProductInputChange("discount", e.target.value)} className="w-full px-4 py-2.5 border border-[var(--borderColor)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount type</label>
              <select value={productForm.discountType} onChange={(e) => handleProductInputChange("discountType", e.target.value)} className="w-full px-4 py-2.5 border border-[var(--borderColor)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Variants (unchanged) */}
        <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] rounded-xl border border-[var(--borderColor)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--textPrimary)]">Add Variants</h2>
            {!showAddVariant && (
              <button onClick={() => setShowAddVariant(true)} className="px-4 py-2 text-black text-sm font-medium rounded-lg hover:opacity-90" style={{ backgroundColor: "#A0EDA8" }}>
                Add Variants
              </button>
            )}
          </div>

          {showAddVariant && (
            <div className="bg-[var(--background)] dark:bg-[var(--bgCard)] rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <input type="text" value={String(newVariant.size ?? "")} onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })} className="w-full px-3 py-2 border border-[var(--borderColor)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., M, L, XL" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <input type="text" value={String(newVariant.color ?? "")} onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })} className="w-full px-3 py-2 border border-[var(--borderColor)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., Black, Blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                  <input type="text" value={String(newVariant.material ?? "")} onChange={(e) => setNewVariant({ ...newVariant, material: e.target.value })} className="w-full px-3 py-2 border border-[var(--borderColor)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., Wool, Cotton" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Alert</label>
                  <input type="number" value={String(newVariant.lowStockAlert ?? "")} onChange={(e) => setNewVariant({ ...newVariant, lowStockAlert: Number(e.target.value) })} className="w-full px-3 py-2 border border-[var(--borderColor)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="21" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input type="number" value={String(newVariant.stock ?? "")} onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value ? Number(e.target.value) : undefined })} className="w-full px-3 py-2 border border-[var(--borderColor)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="77" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Barcode value</label>
                  <input type="text" value={String(newVariant.barcode ?? "")} onChange={(e) => setNewVariant({ ...newVariant, barcode: e.target.value })} className="w-full px-3 py-2 border border-[var(--borderColor)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="2324kvbs-2" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input type="text" value={productForm.sku} onChange={(e) => handleProductInputChange("sku", e.target.value)} className="w-full px-3 py-2 border border-[var(--borderColor)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="2324kvbs-2" />
                </div>
                <div className="flex items-center gap-3 mt-7">
                  <button onClick={handleAddVariant} className="px-4 py-2 text-black text-sm font-medium rounded-lg hover:opacity-90" style={{ backgroundColor: "#A0EDA8" }}>Add Variants</button>
                  <button onClick={generateSKU} className="px-4 py-2 bg-[var(--background-card)] dark:bg-[var(--bgCard)] border border-[var(--borderColor)] text-gray-700 text-sm font-medium rounded-lg hover:bg-[var(--background)] dark:bg-[var(--bgCard)]">Generate SKU</button>
                </div>
              </div>
            </div>
          )}

          {/* Variants Table */}
          {variants.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--borderColor)]">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--textPrimary)]">Size</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--textPrimary)]">Color</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--textPrimary)]">Material</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--textPrimary)]">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--textPrimary)]">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--textPrimary)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => (
                    <tr key={variant._id || variant.id || `${variant.size}-${variant.color}-${Math.random()}`} className="border-b border-[var(--borderColor)]">
                      <td className="px-4 py-3 text-sm text-[var(--textPrimary)]">{variant.size}</td>
                      <td className="px-4 py-3 text-sm text-[var(--textSecondary)]">{variant.color}</td>
                      <td className="px-4 py-3 text-sm text-[var(--textSecondary)]">{variant.material}</td>
                      <td className="px-4 py-3 text-sm text-[var(--textPrimary)]">${variant.price}</td>
                      <td className="px-4 py-3 text-sm text-[var(--textSecondary)]">{variant.stock}</td>
                      <td className="px-4 py-3"><button onClick={() => removeVariant(variant.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Upload, Metadata, and Vertical Tabs */}
      <div className="lg:col-span-1 space-y-6">
        {/* Upload Images */}
        <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] rounded-xl border border-[var(--borderColor)] p-6">
          <h3 className="text-lg font-semibold text-[var(--textPrimary)] mb-4">Upload img</h3>

          {/* Combined preview: existingImages (URLs) + newImages (previews) */}
          <div className="space-y-4">
            {/* Main preview */}
            <div className="relative rounded-lg overflow-hidden bg-gray-100">
              {imagePreviews[selectedImage] ? (
                <img src={String(imagePreviews[selectedImage].url)} alt="Product" className="w-full h-64 object-contain rounded-lg" />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-[var(--textSecondary)]">No image selected</div>
              )}

              {/* Controls */}
              <div className="absolute top-2 right-2 flex gap-2">
                <button onClick={() => {
                  // if preview from existing, remove existing; otherwise remove new file
                  const p = imagePreviews[selectedImage];
                  if (!p) return;
                  if (isPreviewFromExisting(p)) removeExistingImage(String(p.url));
                  else removeNewImage(p.name);
                  // remove preview at index
                  setImagePreviews(prev => prev.filter((x, idx) => idx !== selectedImage));
                  setSelectedImage(0);
                }} className="p-1.5 bg-[var(--background-card)] dark:bg-[var(--bgCard)] rounded-full shadow-md hover:shadow-lg"><X size={16} className="text-[var(--textSecondary)]" /></button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 items-center">
              {imagePreviews.map((img, index) => (
                <button key={img.id} onClick={() => setSelectedImage(index)} className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${selectedImage === index ? "border-green-500" : "border-[var(--borderColor)]"}`}>
                  <img src={String(img.url)} alt={img.name} className="w-full h-full object-cover" />
                </button>
              ))}

              {/* Add new files */}
              <label htmlFor="add-more-images" className="w-16 h-16 border-2 border-dashed border-[var(--borderColor)] rounded-lg flex items-center justify-center cursor-pointer hover:border-green-500">
                <Plus size={20} className="text-gray-400" />
                <input id="add-more-images" type="file" accept="image/*" multiple onChange={(e) => { if (e.target.files) handleNewImageFiles(Array.from(e.target.files)); }} className="hidden" />
              </label>
            </div>
          </div>

          {/* Info */}
          <p className="text-xs text-[var(--textSecondary)] mt-3">Existing images are preserved when saving — new images will be uploaded.</p>
        </div>

        {/* Vertical Tabs + Tab Content */}
        <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] rounded-xl border border-[var(--borderColor)] p-4 flex gap-4">
          {/* Sidebar */}
          <div className="w-36 border-r border-[var(--borderColor)] pr-3">
            <button onClick={() => setDetailsTab("details")} className={`w-full text-left py-2 px-2 rounded ${detailsTab === "details" ? "bg-green-50" : "hover:bg-[var(--background)]"}`}>Details</button>
            <button onClick={() => setDetailsTab("specs")} className={`w-full text-left py-2 px-2 rounded ${detailsTab === "specs" ? "bg-green-50" : "hover:bg-[var(--background)]"}`}>Specifications</button>
            <button onClick={() => setDetailsTab("faq")} className={`w-full text-left py-2 px-2 rounded ${detailsTab === "faq" ? "bg-green-50" : "hover:bg-[var(--background)]"}`}>FAQ</button>
            <button onClick={() => setDetailsTab("customer")} className={`w-full text-left py-2 px-2 rounded ${detailsTab === "customer" ? "bg-green-50" : "hover:bg-[var(--background)]"}`}>Customer Photos</button>
            <button onClick={() => setDetailsTab("notes")} className={`w-full text-left py-2 px-2 rounded ${detailsTab === "notes" ? "bg-green-50" : "hover:bg-[var(--background)]"}`}>Notes</button>
            <button onClick={() => setDetailsTab("terms")} className={`w-full text-left py-2 px-2 rounded ${detailsTab === "terms" ? "bg-green-50" : "hover:bg-[var(--background)]"}`}>Terms</button>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {detailsTab === "details" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-[var(--textPrimary)]">Highlights</label>
                <textarea value={productForm.highlights} onChange={(e) => handleProductInputChange("highlights", e.target.value)} className="w-full p-3 border border-[var(--borderColor)] rounded" rows={3} />
                <label className="block text-sm font-medium text-[var(--textPrimary)]">Material Details</label>
                <input type="text" value={productForm.materialDetails} onChange={(e) => handleProductInputChange("materialDetails", e.target.value)} className="w-full p-2 border border-[var(--borderColor)] rounded" />
                <label className="block text-sm font-medium text-[var(--textPrimary)]">Care Instructions</label>
                <input type="text" value={productForm.careInstructions} onChange={(e) => handleProductInputChange("careInstructions", e.target.value)} className="w-full p-2 border border-[var(--borderColor)] rounded" />
              </div>
            )}

            {detailsTab === "specs" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-[var(--textPrimary)]">Material</label>
                <input type="text" value={productForm.specifications.material} onChange={(e) => handleProductInputChange("specifications", { ...productForm.specifications, material: e.target.value })} className="w-full p-2 border border-[var(--borderColor)] rounded" />

                <label className="block text-sm font-medium text-[var(--textPrimary)]">Fit</label>
                <input type="text" value={productForm.specifications.fit} onChange={(e) => handleProductInputChange("specifications", { ...productForm.specifications, fit: e.target.value })} className="w-full p-2 border border-[var(--borderColor)] rounded" />

                <label className="block text-sm font-medium text-[var(--textPrimary)]">Wash Care</label>
                <input type="text" value={productForm.specifications.washCare} onChange={(e) => handleProductInputChange("specifications", { ...productForm.specifications, washCare: e.target.value })} className="w-full p-2 border border-[var(--borderColor)] rounded" />

                <label className="block text-sm font-medium text-[var(--textPrimary)]">Pattern</label>
                <input type="text" value={productForm.specifications.pattern} onChange={(e) => handleProductInputChange("specifications", { ...productForm.specifications, pattern: e.target.value })} className="w-full p-2 border border-[var(--borderColor)] rounded" />

                <label className="block text-sm font-medium text-[var(--textPrimary)]">Origin</label>
                <input type="text" value={productForm.specifications.origin} onChange={(e) => handleProductInputChange("specifications", { ...productForm.specifications, origin: e.target.value })} className="w-full p-2 border border-[var(--borderColor)] rounded" />

                <label className="block text-sm font-medium text-[var(--textPrimary)]">Others</label>
                <input type="text" value={productForm.specifications.others} onChange={(e) => handleProductInputChange("specifications", { ...productForm.specifications, others: e.target.value })} className="w-full p-2 border border-[var(--borderColor)] rounded" />
              </div>
            )}

            {detailsTab === "faq" && (
              <div>
                <div className="space-y-3">
                  {productForm.faq.map((f, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <input placeholder="Question" value={f.question} onChange={(e) => {
                          const list = [...productForm.faq];
                          list[idx].question = e.target.value;
                          handleProductInputChange("faq", list);
                        }} className="w-full p-2 border border-[var(--borderColor)] rounded mb-2" />
                        <input placeholder="Answer" value={f.answer} onChange={(e) => {
                          const list = [...productForm.faq];
                          list[idx].answer = e.target.value;
                          handleProductInputChange("faq", list);
                        }} className="w-full p-2 border border-[var(--borderColor)] rounded" />
                      </div>
                      <button onClick={() => { const list = productForm.faq.filter((_, i) => i !== idx); handleProductInputChange("faq", list); }} className="text-red-600 ml-2"><Trash2 /></button>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleProductInputChange("faq", [...productForm.faq, { question: "", answer: "" }])} className="mt-3 px-3 py-1 rounded bg-[var(--background-card)] border border-[var(--borderColor)]">Add FAQ</button>
              </div>
            )}

            {detailsTab === "customer" && (
              <div>
                <label className="block text-sm font-medium text-[var(--textPrimary)]">Customer Photos</label>
                <input type="file" accept="image/*" multiple onChange={handleCustomerPhotosSelect} className="mb-2" />
                <div className="flex gap-2 flex-wrap">
                  {/* show existing customer photos first */}
                  {existingCustomerPhotos.map((url) => (
                    <div key={url} className="w-20 h-20 rounded overflow-hidden relative border border-[var(--borderColor)]">
                      <img src={url} alt={url} className="w-full h-full object-cover" />
                      <button onClick={() => removeExistingCustomerPhoto(url)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"><X size={12} /></button>
                    </div>
                  ))}

                  {/* then show previews for new customer photos */}
                  {customerPhotosPreview.map((p) => (
                    <div key={p.id} className="w-20 h-20 rounded overflow-hidden relative border border-[var(--borderColor)]">
                      <img src={typeof p.url === "string" ? p.url : ""} alt={p.name} className="w-full h-full object-cover" />
                      <button onClick={() => removeNewCustomerPhotoFile(p.name)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailsTab === "notes" && (
              <div>
                <label className="block text-sm font-medium text-[var(--textPrimary)]">Notes</label>
                <textarea value={productForm.notes} onChange={(e) => handleProductInputChange("notes", e.target.value)} className="w-full p-2 border border-[var(--borderColor)] rounded" rows={4} />
              </div>
            )}

            {detailsTab === "terms" && (
              <div>
                <label className="block text-sm font-medium text-[var(--textPrimary)]">Terms & Conditions</label>
                <textarea value={productForm.terms} onChange={(e) => handleProductInputChange("terms", e.target.value)} className="w-full p-2 border border-[var(--borderColor)] rounded" rows={4} />
              </div>
            )}
          </div>
        </div>

        {/* Tags & Save */}
        <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] rounded-xl border border-[var(--borderColor)] p-6">
          <h3 className="text-lg font-semibold text-[var(--textPrimary)] mb-4">Tag</h3>
          <input type="text" value={productForm.tags.join(", ")} onChange={(e) => handleProductInputChange("tags", e.target.value.split(",").map((s) => s.trim()))} className="w-full px-4 py-2.5 border border-[var(--borderColor)] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-3" placeholder="Enter tags separated by comma" />
          <div className="flex gap-2">
            <button onClick={handleSaveProduct} className="flex-1 px-4 py-2 text-black text-sm font-medium rounded-lg hover:opacity-90" style={{ backgroundColor: "#A0EDA8" }}>
              {uploading ? <><RotateCcw size={16} className="animate-spin inline-block mr-2" /> Uploading {uploadProgress}%</> : <>Save & Publish</>}
            </button>
            <button onClick={() => { setCurrentView("inventory"); }} className="flex-1 px-4 py-2 bg-[var(--background-card)] dark:bg-[var(--bgCard)] border border-[var(--borderColor)] text-gray-700 font-medium rounded-lg">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );

  // -------------------- Render Orders --------------------
  const renderOrders = () => (
    <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] rounded-xl border border-[var(--borderColor)]">
      <div className="p-6 border-b border-[var(--borderColor)]">
        <h2 className="text-xl font-semibold text-[var(--textPrimary)]">Orders Management</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--borderColor)] bg-[var(--background)] dark:bg-[var(--bgCard)]">
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--textPrimary)]">Order ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--textPrimary)]">Customer</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--textPrimary)]">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--textPrimary)]">Items</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--textPrimary)]">Total</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--textPrimary)]">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--textPrimary)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[var(--borderColor)] hover:bg-[var(--background)] dark:bg-[var(--bgCard)] transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-[var(--textPrimary)]">{order.id}</td>
                <td className="px-6 py-4 text-sm text-[var(--textSecondary)]">{order.customer}</td>
                <td className="px-6 py-4 text-sm text-[var(--textSecondary)]">{order.date}</td>
                <td className="px-6 py-4 text-sm text-[var(--textSecondary)]">{order.items}</td>
                <td className="px-6 py-4 text-sm font-medium text-[var(--textPrimary)]">{order.total}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${order.status === "Delivered" ? "bg-green-100 text-green-800" : order.status === "Shipped" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>{order.status}</span>
                </td>
                <td className="px-6 py-4"><button className="p-1 hover:bg-gray-200 rounded transition-colors"><MoreVertical size={18} className="text-gray-500" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // -------------------- Main Render --------------------
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--textPrimary)] transition-colors duration-300">
      <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] border-b border-[var(--borderColor)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--textPrimary)]">E-Commerce Management</h1>
            <p className="text-sm text-[var(--textSecondary)] mt-1">Manage your website's Ecommerce</p>
          </div>
          <div className="flex items-center gap-3">
            {currentView === "inventory" && (
              <button onClick={() => setCurrentView("addProduct")} className="px-4 py-2 text-black font-medium rounded-lg hover:opacity-90 flex items-center gap-2" style={{ backgroundColor: "#A0EDA8" }}>
                <Plus size={18} /> Add Product
              </button>
            )}
            {currentView === "addProduct" && (
              <>
                <button onClick={() => setCurrentView("inventory")} className="px-4 py-2 bg-[var(--background-card)] dark:bg-[var(--bgCard)] border border-[var(--borderColor)] text-gray-700 font-medium rounded-lg hover:bg-[var(--background)] dark:bg-[var(--bgCard)]">Cancel</button>
                <button onClick={handleSaveProduct} className="px-4 py-2 text-black font-medium rounded-lg hover:opacity-90 flex items-center gap-2" style={{ backgroundColor: "#A0EDA8" }} disabled={uploading}>
                  {uploading ? <><RotateCcw size={18} className="animate-spin" /> Uploading {uploadProgress}%</> : <><Save size={18} /> Save & Publish</>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] border-b border-[var(--borderColor)] px-6">
        <div className="flex gap-6">
          <button onClick={() => { setActiveTab("inventory"); setCurrentView("inventory"); }} className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === "inventory" ? "text-[var(--accent-green)] !border-[var(--accent-green)]" : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]"}`}>Inventory</button>
          <button onClick={() => { setActiveTab("order"); setCurrentView("orders"); }} className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === "order" ? "text-[var(--accent-green)] !border-[var(--accent-green)]" : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]"}`}>Order</button>
          <button onClick={() => setActiveTab("discounts")} className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === "discounts" ? "text-[var(--accent-green)] !border-[var(--accent-green)]" : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]"}`}>Discounts & Coupons</button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {currentView === "inventory" && renderInventory()}
        {currentView === "addProduct" && renderAddProduct()}
        {currentView === "orders" && renderOrders()}
        {activeTab === "discounts" && (<div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] rounded-xl shadow-sm p-8 text-center"><p className="text-[var(--textSecondary)]">Discounts & Coupons management coming soon</p></div>)}
      </div>
    </div>
  );
};

export default ECommerceSection;
