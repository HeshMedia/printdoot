"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { topbarApi, CreateTopbarTitleInput, TopbarTitleResponse, UpdateTopbarTitleInput } from "@/lib/api/topbar";
import { categoriesApi, Category } from "@/lib/api/admin/categories"; // For fetching category names
import { productsApi, Product } from "@/lib/api/admin/products"; // For fetching product names
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit, PlusCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface CategoryProductSelectorProps {
  selectedItems: Record<string, string[]>; // { categoryId: [productId1, productId2] }
  onChange: (selected: Record<string, string[]>) => void;
  allCategories: Category[];
  allProducts: Product[];
}

function CategoryProductSelector({
  selectedItems,
  onChange,
  allCategories,
  allProducts,
}: CategoryProductSelectorProps) {
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [currentProducts, setCurrentProducts] = useState<string[]>([]);

  const handleAddCategoryProducts = () => {
    if (currentCategory && currentProducts.length > 0) {
      const newSelectedItems = { ...selectedItems };
      newSelectedItems[currentCategory] = [
        ...(newSelectedItems[currentCategory] || []),
        ...currentProducts,
      ];
      // Remove duplicates
      newSelectedItems[currentCategory] = Array.from(new Set(newSelectedItems[currentCategory]));
      onChange(newSelectedItems);
      setCurrentCategory("");
      setCurrentProducts([]);
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    const { [categoryId]: _, ...rest } = selectedItems;
    onChange(rest);
  };

  const handleRemoveProductFromCategory = (categoryId: string, productId: string) => {
    const updatedCategoryProducts = (selectedItems[categoryId] || []).filter(pid => pid !== productId);
    if (updatedCategoryProducts.length === 0) {
      handleRemoveCategory(categoryId);
    } else {
      onChange({ ...selectedItems, [categoryId]: updatedCategoryProducts });
    }
  };

  const getCategoryName = (id: string) => allCategories.find(c => c.id.toString() === id)?.name || id;
  const getProductName = (id: string) => allProducts.find(p => p.product_id === id)?.name || id;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <Label htmlFor="categorySelect">Category</Label>
          <select
            id="categorySelect"
            value={currentCategory}
            onChange={(e) => setCurrentCategory(e.target.value)}
            className="w-full p-2 border rounded-md mt-1"
          >
            <option value="">Select Category</option>
            {allCategories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <Label>Products (select multiple)</Label>
          <select
            multiple
            value={currentProducts}
            onChange={(e) => setCurrentProducts(Array.from(e.target.selectedOptions, option => option.value))}
            className="w-full p-2 border rounded-md mt-1 h-32"
            disabled={!currentCategory}
          >
            {allProducts
              .filter(p => p.category_name === getCategoryName(currentCategory)) // Basic filter, adjust if category_id is available on product
              .map((prod) => (
                <option key={prod.product_id} value={prod.product_id}>
                  {prod.name}
                </option>
              ))}
          </select>
        </div>
      </div>
      <Button type="button" onClick={handleAddCategoryProducts} disabled={!currentCategory || currentProducts.length === 0}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add to Title
      </Button>

      {Object.keys(selectedItems).length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-md font-semibold">Selected Categories & Products:</h4>
          {Object.entries(selectedItems).map(([catId, prodIds]) => (
            <div key={catId} className="p-3 border rounded-md bg-gray-50">
              <div className="flex justify-between items-center">
                <h5 className="font-medium text-gray-700">{getCategoryName(catId)}</h5>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveCategory(catId)}>
                  <XCircle className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                {prodIds.map(prodId => (
                  <li key={prodId} className="text-sm text-gray-600 flex justify-between items-center">
                    {getProductName(prodId)}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveProductFromCategory(catId, prodId)}>
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopbarAdminPage() {
  const router = useRouter();
  const [topbarTitles, setTopbarTitles] = useState<TopbarTitleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState<TopbarTitleResponse | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [categoriesAndProducts, setCategoriesAndProducts] = useState<Record<string, string[]>>({});
  const [isActive, setIsActive] = useState(true);

  // For selectors
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); 

  useEffect(() => {
    fetchTopbarTitles();
    fetchAuxiliaryData();
  }, []);

  const fetchAuxiliaryData = async () => {
    try {
      const [catResponse, prodResponse] = await Promise.all([
        categoriesApi.getCategories(), // Assuming this fetches all for admin purposes
        productsApi.getProducts(0, 1000) // Fetch up to 1000 products
      ]);
      setAllCategories(catResponse.categories);
      setAllProducts(prodResponse.products);
    } catch (err) {
      toast.error("Failed to load categories or products for selection.");
      console.error(err);
    }
  };

  const fetchTopbarTitles = async () => {
    setIsLoading(true);
    try {
      const response = await topbarApi.getTopbars();
      setTopbarTitles(response.titles.sort((a, b) => a.display_order - b.display_order));
    } catch (err) {
      setError("Failed to load topbar titles.");
      toast.error("Failed to load topbar titles.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDisplayOrder(0);
    setCategoriesAndProducts({});
    setIsActive(true);
    setEditingTitle(null);
    setIsFormOpen(false);
  };

  const handleEdit = (t: TopbarTitleResponse) => {
    setEditingTitle(t);
    setTitle(t.title);
    setDisplayOrder(t.display_order);
    setCategoriesAndProducts(t.categories_and_products || {});
    setIsActive(t.active === 1);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload: CreateTopbarTitleInput | UpdateTopbarTitleInput = {
      title,
      display_order: Number(displayOrder),
      categories_and_products: categoriesAndProducts,
      ...(editingTitle ? { active: isActive ? 1 : 0 } : {}), // Active only for update, create implies active
    };

    try {
      if (editingTitle) {
        await topbarApi.updateTopbarTitle(editingTitle.id, payload as UpdateTopbarTitleInput);
        toast.success(`Topbar title "${title}" updated successfully.`);
      } else {
        await topbarApi.createTopbarTitle(payload as CreateTopbarTitleInput);
        toast.success(`Topbar title "${title}" created successfully.`);
      }
      fetchTopbarTitles();
      resetForm();
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      toast.error(err.message || "Failed to save topbar title.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (titleId: number, titleName: string) => {
    if (window.confirm(`Are you sure you want to delete the title "${titleName}"?`)) {
      try {
        await topbarApi.deleteTopbarTitle(titleId);
        toast.success(`Title "${titleName}" deleted successfully.`);
        fetchTopbarTitles();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete title.");
      }
    }
  };
  
  const handleRemoveProduct = async (titleId: number, categoryId: string, productId: string, titleName: string) => {
    if (window.confirm(`Are you sure you want to remove product ID ${productId} from category ID ${categoryId} in title "${titleName}"?`)) {
      try {
        await topbarApi.removeProductFromCategoryInTitle(titleId, categoryId, productId);
        toast.success(`Product removed successfully from title "${titleName}".`);
        fetchTopbarTitles(); // Refresh the list to show changes
      } catch (err: any) {
        toast.error(err.message || "Failed to remove product.");
      }
    }
  };


  if (isLoading && !isFormOpen) {
    return <div className="p-6">Loading topbar configurations...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manage Topbar</h1>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }} disabled={isFormOpen && !editingTitle}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Title
        </Button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white shadow-md rounded-lg space-y-6">
          <h2 className="text-xl font-medium mb-4">{editingTitle ? "Edit" : "Create New"} Topbar Title</h2>
          <div>
            <Label htmlFor="title">Title Name</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label>Categories and Products</Label>
            <CategoryProductSelector
              selectedItems={categoriesAndProducts}
              onChange={setCategoriesAndProducts}
              allCategories={allCategories}
              allProducts={allProducts}
            />
          </div>

          {editingTitle && (
            <div className="flex items-center space-x-2">
              <Checkbox id="isActive" checked={isActive} onCheckedChange={(checked: any) => setIsActive(Boolean(checked))} />
              <Label htmlFor="isActive">Active</Label>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex space-x-3">
            <Button type="submit" disabled={isSubmitting || allCategories.length === 0 || allProducts.length === 0}>
              {isSubmitting ? (editingTitle ? "Updating..." : "Creating...") : (editingTitle ? "Update Title" : "Create Title")}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
           { (allCategories.length === 0 || allProducts.length === 0) && 
            <p className="text-sm text-yellow-600">Loading categories and products for selection. Please wait...</p>}
        </form>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-xl font-medium p-4 border-b">Existing Topbar Titles</h2>
        {topbarTitles.length === 0 && !isLoading && (
          <p className="p-4 text-gray-500">No topbar titles found. Add one to get started!</p>
        )}
        {topbarTitles.length > 0 && (
          <ul className="divide-y">
            {topbarTitles.map((t) => (
              <li key={t.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{t.title} <span className={`text-xs px-2 py-0.5 rounded-full ${t.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{t.active ? "Active" : "Inactive"}</span></h3>
                    <p className="text-sm text-gray-500">Order: {t.display_order}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(t)}>
                      <Edit className="mr-1 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(t.id, t.title)}>
                      <Trash2 className="mr-1 h-4 w-4" /> Delete Title
                    </Button>
                  </div>
                </div>
                {t.categories_and_products && Object.keys(t.categories_and_products).length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-200">
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Categories & Products:</h4>
                    {Object.entries(t.categories_and_products).map(([catId, prodIds]) => (
                      <div key={catId} className="mb-2">
                        <p className="text-sm font-semibold text-gray-700">{allCategories.find(c=>c.id.toString() === catId)?.name || `Category ID: ${catId}`}</p>
                        <ul className="list-disc pl-5 text-xs text-gray-500">
                          {prodIds.map(prodId => (
                            <li key={prodId} className="flex justify-between items-center">
                              {allProducts.find(p=>p.product_id === prodId)?.name || `Product ID: ${prodId}`}
                              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleRemoveProduct(t.id, catId, prodId, t.title)}>
                                <Trash2 className="h-3 w-3 text-red-400 hover:text-red-600" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
