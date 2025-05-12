"use client";

import { useState, useEffect } from "react";
import { categoriesApi, Category, CategoryCreateInput } from "@/lib/api/admin/categories";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Alert, 
  AlertDescription 
} from "@/components/ui/alert";
import { 
  Loader2,
  Plus,
  Trash2,
  X,
  AlertCircle
} from "lucide-react";

interface CategoryFormProps {
  initialData?: Category;
  isEditing?: boolean;
  onSubmit: (category: Category) => void;
  onCancel: () => void;
}

// Define the type for the customization format from API
type CustomizationsType = Record<string, Record<string, string>>;

export default function CategoryForm({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  // Basic form state
  const [name, setName] = useState(initialData?.name || "");
  const [image, setImage] = useState("");
  const [imageExtension, setImageExtension] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  
  // Customization fields state - using the nested key-value pairs format
  const [customizations, setCustomizations] = useState<CustomizationsType>(
    initialData?.allowed_customizations || {}
  );
  
  // UI state for adding new fields and values
  const [newFieldName, setNewFieldName] = useState("");
  const [newValueName, setNewValueName] = useState("");
  const [newValueData, setNewValueData] = useState("");
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [isAddValueDialogOpen, setIsAddValueDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basics");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(",")[1];
      const extension = file.name.split(".").pop() || "";

      setImage(base64Data);
      setImageExtension(extension);
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImage("");
    setImageExtension("");
    setImagePreview(null);
  };

  const addCustomizationField = () => {
    if (!newFieldName.trim()) return;
    
    // Don't allow duplicates
    if (customizations[newFieldName]) {
      setError(`Field "${newFieldName}" already exists`);
      return;
    }

    setCustomizations(prev => ({
      ...prev,
      [newFieldName]: {}
    }));
    setNewFieldName("");
    setIsAddFieldDialogOpen(false);
    setError(null);
  };

  const openAddValueDialog = (fieldName: string) => {
    setSelectedField(fieldName);
    setNewValueName("");
    setNewValueData("");
    setIsAddValueDialogOpen(true);
  };

  const addCustomizationValue = () => {
    if (!selectedField || !newValueName.trim()) return;
    
    // Don't allow duplicate keys
    if (customizations[selectedField]?.[newValueName]) {
      setError(`Option "${newValueName}" already exists in ${selectedField}`);
      return;
    }
    
    setCustomizations(prev => ({
      ...prev,
      [selectedField]: {
        ...prev[selectedField],
        [newValueName]: newValueData || newValueName
      }
    }));
    
    setNewValueName("");
    setNewValueData("");
    setIsAddValueDialogOpen(false);
    setError(null);
  };

  const removeCustomizationField = (field: string) => {
    const updated = { ...customizations };
    delete updated[field];
    setCustomizations(updated);
  };

  const removeCustomizationValue = (field: string, key: string) => {
    const fieldValues = { ...customizations[field] };
    delete fieldValues[key];
    
    setCustomizations(prev => ({
      ...prev,
      [field]: fieldValues
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Basic validation
    if (!name.trim()) {
      setError("Category name is required");
      setActiveTab("basics");
      setLoading(false);
      return;
    }

    try {
      // Check if there's at least one customization field for new categories
      if (!isEditing && Object.keys(customizations).length === 0) {
        setError("Please add at least one customization field");
        setActiveTab("customizations");
        setLoading(false);
        return;
      }

      // Prepare data for API - using the correct format for allowed_customizations
      const apiData: CategoryCreateInput = {
        name: name,
        allowed_customizations: customizations,
        image: image || "",
        image_extension: imageExtension || "",
      };

      let result: Category;
      console.log("API Data", apiData);
      if (isEditing && initialData) {
        result = await categoriesApi.updateCategory(initialData.id, apiData);
      } else {
        result = await categoriesApi.createCategory(apiData);
      }

      onSubmit(result);
    } catch (err) {
      console.error("Failed to save category:", err);
      setError("Failed to save category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? `Edit Category: ${initialData?.name}` : "Create New Category"}</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="px-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basics">Basic Details</TabsTrigger>
              <TabsTrigger value="customizations">Customization Options</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="basics" className="pt-4">
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., T-Shirts, Mugs, Posters"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>Category Image</Label>
                  {imagePreview ? (
                    <div className="relative w-40 h-40 border rounded-md overflow-hidden bg-muted/30">
                      <img 
                        src={imagePreview} 
                        alt="Category preview" 
                        className="w-full h-full object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={clearImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center w-40 h-40 border border-dashed rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                          <Plus className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground mt-2">Upload Image</span>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="customizations" className="pt-4">
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Customization Fields</h3>
                  <Dialog open={isAddFieldDialogOpen} onOpenChange={setIsAddFieldDialogOpen}>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setIsAddFieldDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Field
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Customization Field</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <Label htmlFor="field-name">Field Name</Label>
                        <Input
                          id="field-name"
                          value={newFieldName}
                          onChange={(e) => setNewFieldName(e.target.value)}
                          placeholder="e.g., Size, Color, Material"
                          className="mt-2"
                        />
                      </div>
                      <DialogFooter>
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={() => setIsAddFieldDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={addCustomizationField}
                          disabled={!newFieldName.trim()}
                        >
                          Add Field
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {Object.keys(customizations).length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-2">No customization fields added yet</p>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setIsAddFieldDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Field
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {Object.entries(customizations).map(([field, values]) => (
                      <Card key={field}>
                        <CardHeader className="py-3 px-4 bg-muted/30 flex flex-row items-center justify-between space-y-0">
                          <div className="font-medium">{field}</div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openAddValueDialog(field)}
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Add Option
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCustomizationField(field)}
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          {Object.keys(values).length === 0 ? (
                            <p className="text-sm text-muted-foreground">No options added yet</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {Object.entries(values).map(([key, value]) => (
                                <div 
                                  key={key} 
                                  className="flex items-center justify-between px-3 py-2 rounded-md border bg-muted/20"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{key}</span>
                                    {field.toLowerCase() === 'color' && value.startsWith('#') && (
                                      <div 
                                        className="w-4 h-4 rounded-full border" 
                                        style={{ backgroundColor: value }}
                                      />
                                    )}
                                    {value !== key && <span className="text-muted-foreground text-sm">{value}</span>}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeCustomizationValue(field, key)}
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
        
        {/* Dialog for adding option values */}
        <Dialog open={isAddValueDialogOpen} onOpenChange={setIsAddValueDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Add Option to {selectedField}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="option-name">Option Name</Label>
                <Input
                  id="option-name"
                  value={newValueName}
                  onChange={(e) => setNewValueName(e.target.value)}
                  placeholder={selectedField?.toLowerCase() === 'size' ? "e.g., S, M, L, XL" : "e.g., Red, Blue, Green"}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="option-value">Option Value{selectedField?.toLowerCase() === 'color' ? " (Color code)" : ""}</Label>
                <Input
                  id="option-value"
                  value={newValueData}
                  onChange={(e) => setNewValueData(e.target.value)}
                  placeholder={
                    selectedField?.toLowerCase() === 'size' 
                      ? "e.g., 32, 34, 36" 
                      : selectedField?.toLowerCase() === 'color' 
                        ? "e.g., #FF0000" 
                        : "Optional value"
                  }
                />
                <div className="text-xs text-muted-foreground">
                  {selectedField?.toLowerCase() === 'size' 
                    ? "Enter the size value (numeric or descriptive)"
                    : selectedField?.toLowerCase() === 'color'
                      ? "Enter color code (e.g., #FF0000 for red)"
                      : "Leave blank to use the same as option name"
                  }
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setIsAddValueDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={addCustomizationValue}
                disabled={!newValueName.trim()}
              >
                Add Option
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Category" : "Create Category"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}