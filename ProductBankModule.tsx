import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit2, Trash2, Package, Wrench, DollarSign, Grid3x3 } from "lucide-react";

interface ProductService {
  id: number;
  name: string;
  sku: string;
  type: "product" | "service";
  basePrice: number;
  vendor?: string;
  category: string;
  unitOfMeasure: string;
  description?: string;
}

interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  productCount: number;
}

const ProductBankModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState("catalog");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Mock data
  const categories: Category[] = [
    { id: 1, name: "Office Equipment", icon: "🖥️", color: "blue", productCount: 5 },
    { id: 2, name: "Software Licenses", icon: "💻", color: "purple", productCount: 3 },
    { id: 3, name: "Furniture", icon: "🪑", color: "orange", productCount: 4 },
    { id: 4, name: "Consulting Services", icon: "👨‍💼", color: "green", productCount: 2 },
  ];

  const products: ProductService[] = [
    {
      id: 1,
      name: "Dell Laptop XPS 13",
      sku: "DELL-XPS-13",
      type: "product",
      basePrice: 1299.99,
      vendor: "Dell",
      category: "Office Equipment",
      unitOfMeasure: "unit",
      description: "High-performance laptop for professionals",
    },
    {
      id: 2,
      name: "Microsoft Office 365",
      sku: "MS-OFF-365",
      type: "service",
      basePrice: 99.99,
      vendor: "Microsoft",
      category: "Software Licenses",
      unitOfMeasure: "license/year",
      description: "Annual subscription for Office 365",
    },
    {
      id: 3,
      name: "Ergonomic Office Chair",
      sku: "CHAIR-ERG-001",
      type: "product",
      basePrice: 349.99,
      vendor: "Herman Miller",
      category: "Furniture",
      unitOfMeasure: "unit",
      description: "Premium ergonomic office chair",
    },
    {
      id: 4,
      name: "Financial Audit Service",
      sku: "AUDIT-FIN-001",
      type: "service",
      basePrice: 5000.0,
      vendor: "Deloitte",
      category: "Consulting Services",
      unitOfMeasure: "engagement",
      description: "Comprehensive financial audit service",
    },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === categories.find((c) => c.id === selectedCategory)?.name;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product & Service Bank</h1>
          <p className="text-gray-600 mt-1">Manage your reusable products and services for procurement</p>
        </div>
        <Button onClick={() => setShowAddProduct(true)} className="bg-accent hover:bg-accent-dark">
          <Plus className="w-4 h-4 mr-2" />
          Add Product/Service
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="pricing">Pricing History</TabsTrigger>
        </TabsList>

        {/* Catalog Tab */}
        <TabsContent value="catalog" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or SKU..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {product.type === "product" ? (
                        <Package className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Wrench className="w-5 h-5 text-green-600" />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                    <Badge variant={product.type === "product" ? "default" : "secondary"}>
                      {product.type === "product" ? "Product" : "Service"}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vendor:</span>
                      <span className="font-medium">{product.vendor || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit:</span>
                      <span className="font-medium">{product.unitOfMeasure}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{product.category}</span>
                    </div>
                  </div>

                  <div className="border-t pt-3 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Base Price</span>
                      <span className="text-lg font-bold text-accent">${product.basePrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1">
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No products found matching your search</p>
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Button onClick={() => setShowAddCategory(true)} variant="outline" className="mb-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{category.icon}</div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      {category.productCount} product{category.productCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pricing History Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing History</CardTitle>
              <CardDescription>Track price changes for products and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">Dell Laptop XPS 13</p>
                        <p className="text-sm text-gray-600">Vendor: Dell</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-accent">$1,299.99</p>
                        <p className="text-xs text-gray-500">Effective: 2026-04-01</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add Product/Service</CardTitle>
              <CardDescription>Add a new item to your product and service bank</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Product</option>
                    <option>Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Category</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    {categories.map((cat) => (
                      <option key={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Product Name</label>
                <Input placeholder="e.g., Dell Laptop XPS 13" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">SKU</label>
                  <Input placeholder="e.g., DELL-XPS-13" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Unit of Measure</label>
                  <Input placeholder="e.g., unit, license/year" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Base Price</label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Vendor</label>
                  <Input placeholder="e.g., Dell" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                <Textarea placeholder="Describe this product or service" rows={3} />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                  Cancel
                </Button>
                <Button className="bg-accent hover:bg-accent-dark">Add to Bank</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Category</CardTitle>
              <CardDescription>Create a new product category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Category Name</label>
                <Input placeholder="e.g., Office Equipment" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                <Textarea placeholder="Optional description" rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Icon (Emoji)</label>
                  <Input placeholder="e.g., 🖥️" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Color</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Blue</option>
                    <option>Purple</option>
                    <option>Orange</option>
                    <option>Green</option>
                    <option>Red</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddCategory(false)}>
                  Cancel
                </Button>
                <Button className="bg-accent hover:bg-accent-dark">Create Category</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductBankModule;
