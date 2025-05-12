"use client"

import { useState, useEffect, useRef } from "react";
import { Banner, bannerApi } from "@/lib/api/banners";
import { Loader2, PlusCircle, ImageIcon, Trash2, Check, X, MoveVertical } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { DndContext, useSensor, useSensors, PointerSensor, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const BannerManagementPage = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Reference to the file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DnD sensor for drag and drop sorting
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5, // 5px of movement required before drag starts
    },
  }));

  // Load banners when the component mounts
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const response = await bannerApi.getBanners();
      // Sort banners by display order
      const sortedBanners = [...response.banners].sort((a, b) => a.display_order - b.display_order);
      setBanners(sortedBanners);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast({
        title: "Error",
        description: "Failed to load banners",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create a preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Convert the image to base64
      const base64Image = await fileToBase64(selectedFile);
      const imageExtension = selectedFile.name.split('.').pop() || 'jpg';

      // Find the highest display order
      const highestOrder = banners.length > 0 
        ? Math.max(...banners.map(b => b.display_order)) 
        : -1;

      // Add the banner
      await bannerApi.addBanner(
        base64Image,
        imageExtension,
        highestOrder + 1,
        true // Active by default
      );

      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsDialogOpen(false);
      
      // Refresh banner list
      await fetchBanners();

      toast({
        title: "Success",
        description: "Banner uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast({
        title: "Error",
        description: "Failed to upload banner",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle banner active state toggle
  const handleToggleActive = async (bannerId: number, currentActive: number) => {
    try {
      const banner = banners.find(b => b.id === bannerId);
      if (!banner) return;

      // Update banner active status
      await bannerApi.updateBanner(
        bannerId,
        banner.display_order,
        currentActive === 0 // Toggle active state
      );

      // Refresh banner list
      await fetchBanners();

      toast({
        title: "Success",
        description: "Banner status updated",
      });
    } catch (error) {
      console.error("Error updating banner:", error);
      toast({
        title: "Error",
        description: "Failed to update banner status",
        variant: "destructive",
      });
    }
  };

  // Handle banner deletion
  const handleDelete = async (bannerId: number) => {
    try {
      await bannerApi.deleteBanner(bannerId);
      
      // Remove from local state
      setBanners(banners.filter(banner => banner.id !== bannerId));

      toast({
        title: "Success",
        description: "Banner deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive",
      });
    }
  };

  // Handle drag end event for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = banners.findIndex(banner => banner.id === active.id);
      const newIndex = banners.findIndex(banner => banner.id === over.id);
      
      // Reorder the banners array
      const newBanners = arrayMove(banners, oldIndex, newIndex);
      
      // Update state immediately for visual feedback
      setBanners(newBanners);
      
      // Update display orders in the backend
      try {
        // Create a queue of update promises
        const updatePromises = newBanners.map((banner, index) => 
          bannerApi.updateBanner(banner.id, index, banner.active === 1)
        );
        
        // Wait for all updates to complete
        await Promise.all(updatePromises);
        
        toast({
          title: "Success",
          description: "Banner order updated",
        });
      } catch (error) {
        console.error("Error updating banner order:", error);
        toast({
          title: "Error",
          description: "Failed to update banner order",
          variant: "destructive",
        });
        
        // Revert to original state if there's an error
        await fetchBanners();
      }
    }
  };

  // Helper function to convert a file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the "data:image/jpeg;base64," part
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject('Failed to convert file to base64');
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Banner Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Banner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Banner</DialogTitle>
              <DialogDescription>
                Upload a new banner image for the homepage carousel.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="banner-image">Banner Image</Label>
                <Input
                  id="banner-image" 
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange} 
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500">
                  Recommended size: 1600×600 pixels. Max file size: 2MB.
                </p>
              </div>
              
              {previewUrl && (
                <div className="relative h-40 w-full overflow-hidden rounded-md border">
                  <Image
                    src={previewUrl}
                    alt="Banner preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  disabled={!selectedFile || isUploading}
                  onClick={handleUpload}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Banner"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      ) : banners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-700">No banners found</h2>
            <p className="text-gray-500 mt-2 mb-6">Add your first banner to get started</p>
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Banner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={banners.map(b => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {banners.map((banner) => (
                <SortableBanner
                  key={banner.id}
                  banner={banner}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

// Sortable Banner Item Component
type SortableBannerProps = {
  banner: Banner;
  onToggleActive: (bannerId: number, currentActive: number) => Promise<void>;
  onDelete: (bannerId: number) => Promise<void>;
};

const SortableBanner = ({ banner, onToggleActive, onDelete }: SortableBannerProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: banner.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    await onToggleActive(banner.id, banner.active);
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }

    await onDelete(banner.id);
    setIsConfirmingDelete(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg shadow-sm ${isDragging ? "shadow-lg" : ""}`}
    >
      <div className="flex items-center p-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="mr-3 cursor-grab active:cursor-grabbing p-2 rounded-md hover:bg-gray-100"
        >
          <MoveVertical className="h-5 w-5 text-gray-400" />
        </div>
        
        {/* Banner Image */}
        <div className="relative h-24 w-40 rounded-md overflow-hidden mr-4">
          <Image
            src={banner.image_url}
            alt={`Banner ${banner.id}`}
            fill
            className="object-cover"
          />
        </div>
        
        {/* Banner Info */}
        <div className="flex-1">
          <p className="text-sm text-gray-500">ID: {banner.id}</p>
          <p className="text-sm text-gray-500">
            Created: {new Date(banner.created_at).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">
            Order: {banner.display_order}
          </p>
        </div>
        
        {/* Active Toggle */}
        <div className="flex items-center gap-2 mr-4">
          <span className="text-sm">Active</span>
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Switch
              checked={banner.active === 1}
              onCheckedChange={handleToggle}
            />
          )}
        </div>
        
        {/* Delete Button */}
        <div>
          {isConfirmingDelete ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsConfirmingDelete(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerManagementPage;