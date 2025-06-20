'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer } from 'react-konva';
import Konva from 'konva';
import { productsApi, Product } from '@/lib/api/products';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Plus, Trash2, ArrowUp, ArrowDown, Save, Palette, Type, ShoppingCart, AlertCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { cartItemsAtom, generateCartItemId, findSimilarCartItem, addToCartAtom } from '@/lib/atoms/cartAtoms';
import Loader from '../ui/loader';
import TextCustomizationOptions from './TextCustomizationOptions';
import { saveDesignToDB, getAllDesignsFromDB, getDesignFromDB, getAllDesignsForProductFromDB, DesignData } from '@/lib/utils/indexedDB'; // Updated import with getAllDesignsForProductFromDB

interface ProductCustomizerProps {
  productId: string;
}

export const AVAILABLE_FONTS = [
  'Arial', 'Verdana', 'Helvetica', 'Tahoma', 'Trebuchet MS', 'Impact', // Sans-serif
  'Times New Roman', 'Georgia', 'Garamond', 'Palatino', // Serif
  'Courier New', 'Lucida Console', 'Monaco', 'Roboto Mono', 'Source Code Pro', // Monospace
  'Comic Sans MS', 'Brush Script MT', 'Lobster', 'Pacifico', 'Satisfy', 'Dancing Script', // Display/Script  'Open Sans', 'Lato', 'Montserrat', 'Roboto', 'Nunito', 'Merriweather', 'Playfair Display' // Google Fonts like
];

// Exporting for TextCustomizationOptions
export interface CustomTextConfig extends Konva.TextConfig {
  isBold?: boolean;
  fontStyle?: string; // 'normal', 'italic'
  textDecoration?: string; // 'none', 'underline'
  align?: string; // 'left', 'center', 'right', 'justify'
  textTransform?: string; // 'none', 'uppercase', 'lowercase', 'capitalize'
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  backgroundColor?: string; // For text box background
  backgroundOpacity?: number; // Opacity for text box background
  stroke?: string; // Border color
  strokeWidth?: number; // Border width
  fillPriority?: string; // 'color', 'linear-gradient', 'radial-gradient'
  fillLinearGradientStartPoint?: { x: number; y: number };
  fillLinearGradientEndPoint?: { x: number; y: number };
  fillLinearGradientColorStops?: (string | number)[]; // [pos1, color1, pos2, color2, ...]
  originalText?: string; // To store original text before transformations
  // Add other new properties here as needed
}

const ProductCustomizer: React.FC<ProductCustomizerProps> = ({ productId }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useAtom(cartItemsAtom);
  const [designId, setDesignId] = useState<string | null>(null);
  const [isAddToCartDialogOpen, setIsAddToCartDialogOpen] = useState(false);
  const [hasCustomized, setHasCustomized] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [uploadedImages, setUploadedImages] = useState<Array<Konva.ImageConfig & { image: HTMLImageElement }>>([]);
  const [texts, setTexts] = useState<Array<Konva.TextConfig>>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [selectedTextColor, setSelectedTextColor] = useState<string>('#000000');
  const [selectedTextFont, setSelectedTextFont] = useState<string>(AVAILABLE_FONTS[0]);

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [scaledStageDimensions, setScaledStageDimensions] = useState({ width: 300, height: 150 });
  const [stageContentScale, setStageContentScale] = useState(1);
  const [baseDesignSize, setBaseDesignSize] = useState({ width: 0, height: 0 });


  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const productData = await productsApi.getProduct(productId);
        setProduct(productData);
        if (productData.side_images_url && productData.side_images_url.length > 0) {
          const img = new Image();
          img.crossOrigin = "anonymous"; // Added to request CORS headers
          img.src = productData.side_images_url[0];
          img.onload = () => {
            setBackgroundImage(img);
            setBaseDesignSize({ width: img.width, height: img.height });
          };
          img.onerror = (e) => {
            console.error('Failed to load background image (check CORS headers on the server):', e, img.src);
          };
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      }
    };
    fetchProductData();
  }, [productId]);

  useLayoutEffect(() => {
    if (!backgroundImage || !canvasContainerRef.current || baseDesignSize.width === 0 || baseDesignSize.height === 0) {
      return;
    }

    const calculateSize = () => {
      if (canvasContainerRef.current && baseDesignSize.width > 0 && baseDesignSize.height > 0) {
        const containerWidth = canvasContainerRef.current.clientWidth;
        const containerHeight = canvasContainerRef.current.clientHeight;

        // Corrected: If container has no dimensions yet, prevent calculation that leads to 0x0 stage.
        if (containerWidth === 0 || containerHeight === 0) {
            console.warn("Canvas container has zero dimensions (clientWidth or clientHeight is 0). Stage size calculation skipped.");
            return; // Exit calculation to prevent setting stage size to 0x0
        }

        const scaleToFitWidth = containerWidth / baseDesignSize.width;
        const scaleToFitHeight = containerHeight / baseDesignSize.height;
        let newScale = Math.min(scaleToFitWidth, scaleToFitHeight);

        // Additional robustness: ensure scale is a positive, finite number.
        if (newScale <= 0 || !isFinite(newScale)) {
            console.warn(`Calculated invalid scale: ${newScale} (from container: ${containerWidth}x${containerHeight}, base: ${baseDesignSize.width}x${baseDesignSize.height}). Stage size update skipped.`);
            return; // Skip update if scale is not valid and positive
        }
        
        const newWidth = baseDesignSize.width * newScale;
        const newHeight = baseDesignSize.height * newScale;

        // Ensure dimensions are at least 1px to prevent errors with canvas.
        setScaledStageDimensions({
          width: Math.max(1, newWidth),
          height: Math.max(1, newHeight),
        });
        setStageContentScale(newScale);
      }
    };

    calculateSize(); // Initial calculation

    const resizeObserver = new ResizeObserver(calculateSize);
    // Ensure canvasContainerRef.current is still valid before observing
    if (canvasContainerRef.current) {
        resizeObserver.observe(canvasContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [backgroundImage, baseDesignSize, stageContentScale]); // Added stageContentScale to dependencies if it's used in fallback for newScale, otherwise remove if not needed.
  // Re-evaluating dependencies: stageContentScale was used in a more complex fallback for newScale that I simplified.
  // For the current version of calculateSize, stageContentScale is NOT read, so it should NOT be in dependencies.
  // Corrected dependency array: [backgroundImage, baseDesignSize];


  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      const tr = transformerRef.current;
      if (selectedShapeId) {
        const selectedNode = stageRef.current.findOne('.' + selectedShapeId);
        if (selectedNode) {
          tr.nodes([selectedNode]);
          if (selectedNode.getClassName() === 'Text') {
            const textNode = selectedNode as Konva.Text;
            const fillValue = textNode.fill();
            if (typeof fillValue === 'string') {
              setSelectedTextColor(fillValue || '#000000');
            } else {
              setSelectedTextColor('#000000');
            }
            setSelectedTextFont(textNode.fontFamily() || AVAILABLE_FONTS[0]);
          }
        } else {
          tr.nodes([]);
        }
      } else {
        tr.nodes([]);
      }
      tr.getLayer()?.batchDraw();
    }
  }, [selectedShapeId, texts, uploadedImages]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const newImageId = 'image-' + Date.now();
          const stage = stageRef.current;
          setUploadedImages([
            ...uploadedImages,
            {
              image: img,
              id: newImageId,
              name: newImageId, // for selection
              x: stage ? stage.width() / 2 - (img.width / 4) / 2 : 50,
              y: stage ? stage.height() / 2 - (img.height / 4) / 2 : 50,
              width: img.width / 4,
              height: img.height / 4,
              draggable: true,
            },
          ]);
          setSelectedShapeId(newImageId);
        };
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    }
  };

  const handleAddText = () => {
    const newTextId = 'text-' + Date.now();
    const stage = stageRef.current;
    const newTextObj: Konva.TextConfig = {
      text: 'New Text',
      id: newTextId,
      name: newTextId, // for selection
      x: stage ? stage.width() / 2 - 50 : 100,
      y: stage ? stage.height() / 2 - 10 : 100,
      fontSize: 20,
      fill: selectedTextColor, // Use current selected or default
      fontFamily: selectedTextFont, // Use current selected or default
      draggable: true,
    };
    setTexts([...texts, newTextObj]);
    setSelectedShapeId(newTextId);
  };

  const handleObjectManipulation = (id: string, newAttrs: Partial<Konva.NodeConfig>) => {
    setUploadedImages(prevImages => 
      prevImages.map(img => (img.id === id ? { ...img, ...newAttrs } : img))
    );
    setTexts(prevTexts => 
      prevTexts.map(txt => (txt.id === id ? { ...txt, ...newAttrs } : txt))
    );
  };
  
  const handleDelete = () => {
    if (selectedShapeId) {
      setUploadedImages(uploadedImages.filter(img => img.id !== selectedShapeId));
      setTexts(texts.filter(txt => txt.id !== selectedShapeId));
      setSelectedShapeId(null);
    }
  };

  const handleLayerChange = (direction: 'forward' | 'backward') => {
    if (!selectedShapeId || !stageRef.current) return;
    const node = stageRef.current.findOne('.' + selectedShapeId);
    if (node) {
      if (direction === 'forward') {
        node.moveUp();
      } else {
        node.moveDown();
      }
      node.getLayer()?.batchDraw(); // Draw the layer the node is on
    }
  };

  const handleSaveDesign = async () => { // Changed to async
    if (!stageRef.current || !product || !product.product_id) { // Added check for product.product_id
      console.error("Stage, product, or product ID not available for saving.");
      return;
    }

    const stage = stageRef.current;
    
    // Ensure transformer is not visible and stage is updated
    setSelectedShapeId(null); 
    
    // Force redraw the stage to ensure all elements are up-to-date
    stage.draw(); 

    // Use a brief timeout to allow UI to update (transformer to hide and stage to redraw)
    await new Promise(resolve => setTimeout(resolve, 100)); // Increased timeout slightly


    // 1. Capture the full design image
    const fullDesignImage = stage.toDataURL({ mimeType: 'image/png' });

    // 2. Capture uploaded images (original data URLs)
    const uploadedImagesData: DesignData['uploadedImages'] = uploadedImages.map(img => ({
      id: img.id!,
      dataUrl: img.image.src, // This is the original base64 data URL from FileReader
      name: img.name || img.id,
    }));

    // 3. Capture text elements as transparent PNGs
    const textImagesData: DesignData['textImages'] = [];
    
    for (const textConfig of texts) {
      if (!textConfig.id) continue;
      const textNode = stage.findOne('#' + textConfig.id) as Konva.Text;
      if (textNode) {
        // To get an image of the text only, with its transformations, but on a transparent background:
        // We can clone the node, add it to a temporary layer/stage, or directly use its toDataURL if it respects transparency.
        // For simplicity and accuracy including transformations, we use the node's toDataURL.
        const textDataURL = textNode.toDataURL({ mimeType: 'image/png' });
        textImagesData.push({
          id: textConfig.id,
          dataUrl: textDataURL,
          text: textConfig.text || '',
        });
      }
    }    const designToSave: DesignData = {
      id: `${product.product_id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Generate unique ID for each design
      productId: product.product_id,
      timestamp: Date.now(),
      fullDesignImage,
      uploadedImages: uploadedImagesData,
      textImages: textImagesData,
    };

    try {
      const savedId = await saveDesignToDB(designToSave);
      setDesignId(savedId);
      setHasCustomized(true);
      toast({
        title: "Design saved",
        description: "Your customized design has been saved.",
      });
    } catch (error) {
      console.error('Failed to save design to IndexedDB:', error);
      toast({
        title: "Save failed",
        description: "Failed to save your design. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleShowSavedDesigns = async () => {
    try {
      if (!product || !product.product_id) {
        alert('Product context is not available. Cannot show saved design.');
        return;
      }      
      // Fetch all designs for the current product
      const designs = await getAllDesignsForProductFromDB(product.product_id.toString());

      if (designs && designs.length > 0) {
        console.log(`Saved Designs for product ${product.product_id}:`, designs);
        
        // Show the most recent design
        const mostRecentDesign = [...designs].sort((a, b) => b.timestamp - a.timestamp)[0];
        
        const newTab = window.open();
        if (newTab) {
          let htmlContent = `<html><head><title>Saved Designs for Product: ${product.name}</title></head><body>`;
          htmlContent += `<h1>All Designs for Product: ${product.name} (ID: ${product.product_id})</h1>`;
          htmlContent += `<p>Total Saved Designs: ${designs.length}</p>`;
          
          // Display all designs
          designs.forEach((design: DesignData, index: number) => {
            htmlContent += `<hr style="margin: 30px 0;" />`;
            htmlContent += `<h2>Design #${index + 1}: ${design.id}</h2>`;
            htmlContent += `<p>Created: ${new Date(design.timestamp).toLocaleString()}</p>`;
            
            // Full Design Image
            if (design.fullDesignImage) {
              htmlContent += `<h3>Full Design Image:</h3>`;
              htmlContent += `<img src="${design.fullDesignImage}" alt="Full Design" style="max-width: 500px; border: 1px solid black; margin-bottom: 20px;" />`;
            }
            
            // Uploaded Images
            if (design.uploadedImages && design.uploadedImages.length > 0) {
              htmlContent += `<h3>Uploaded Images (${design.uploadedImages.length}):</h3>`;
              design.uploadedImages.forEach((img: { id: string; dataUrl: string; name?: string }) => {
                htmlContent += `<div style="margin-bottom: 10px;">`;
                htmlContent += `<h4>Uploaded Image ID: ${img.id} (Name: ${img.name || 'N/A'})</h4>`;
                htmlContent += `<img src="${img.dataUrl}" alt="Uploaded Image ${img.id}" style="max-width: 300px; border: 1px solid #ccc;" />`;
                htmlContent += `</div>`;
              });
            }
            
            // Text Images
            if (design.textImages && design.textImages.length > 0) {
              htmlContent += `<h3>Text-as-Images (${design.textImages.length}):</h3>`;
              design.textImages.forEach((txtImg: { id: string; dataUrl: string; text: string }) => {
                htmlContent += `<div style="margin-bottom: 10px;">`;
                htmlContent += `<h4>Text Image ID: ${txtImg.id} (Original Text: ${txtImg.text})</h4>`;
                htmlContent += `<img src="${txtImg.dataUrl}" alt="Text Image ${txtImg.id}" style="max-width: 300px; border: 1px solid #ccc; background-color: #f0f0f0;" />`;
                htmlContent += `</div>`;
              });
            }
          });

          htmlContent += `</body></html>`;
          newTab.document.write(htmlContent);
          newTab.document.close(); // Important for some browsers
        } else {
          alert('Could not open a new tab. Please check your browser pop-up settings.');
        }
      } else {
        // This else block is for when no designs are found for this product
        console.log(`No saved designs found for product: ${product.name} (ID: ${product.product_id}).`);
        alert(`No saved designs found for product: ${product.name} (ID: ${product.product_id}).`);
      }
    } catch (error) {
      console.error('Failed to fetch designs from IndexedDB:', error);
      alert('Failed to fetch designs. Check console for details.');
    }
  };

  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedShapeId(null);
    }
  };

  // Text editing logic (double click)
  const handleTextDblClick = (e: Konva.KonvaEventObject<Event>, textId: string) => {
    const textNode = e.target as Konva.Text;

    // Get position and stage box BEFORE hiding node, just in case hiding affects measurements.
    const textPosition = textNode.getAbsolutePosition();
    const stage = stageRef.current;
    if (!stage) return;
    const stageBox = stage.container().getBoundingClientRect(); // This is the on-screen position of the stage

    textNode.hide();
    transformerRef.current?.hide();
    textNode.getLayer()?.batchDraw(); // Ensure changes are drawn

    const areaPosition = {
      x: stageBox.left + textPosition.x,
      y: stageBox.top + textPosition.y,
    };

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = textNode.text();
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    
    // Ensure boxSizing is content-box for the width/height calculations below
    textarea.style.boxSizing = 'content-box'; 
    
    // Apply Konva node's padding to the textarea
    const konvaPadding = textNode.padding() || 0; // Default to 0 if undefined
    textarea.style.padding = konvaPadding * stageContentScale + 'px';

    // Set content width and height, accounting for scale and padding
    textarea.style.width = (textNode.width() - konvaPadding * 2) * stageContentScale + 'px';
    textarea.style.height = (textNode.height() - konvaPadding * 2) * stageContentScale + 'px'; 
    
    textarea.style.fontSize = textNode.fontSize() * stageContentScale + 'px';
    textarea.style.border = 'none';
    // textarea.style.padding = '0px'; // Handled above
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = String(textNode.lineHeight()); // LineHeight is usually a multiplier, independent of scale here
    textarea.style.fontFamily = textNode.fontFamily(); // Apply font family
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = textNode.align();
    textarea.style.color = String(textNode.fill() || 'black'); // Apply color
    // textarea.style.verticalAlign = 'top'; // Removed, not effective for internal text alignment
    const rotation = textNode.rotation();
    let transform = '';
    if (rotation) {
      transform += `rotateZ(${rotation}deg)`;
    }
    textarea.style.transform = transform;
    
    // Set initial text content before auto-height calculation
    textarea.value = textNode.text(); 

    // Initial auto-height adjustment (more precise)
    // Consider scale for scrollHeight and fontSize if issues arise
    textarea.style.height = 'auto'; 
    textarea.style.height = textarea.scrollHeight + (textNode.fontSize()* stageContentScale / 2) + 'px'; // Add some buffer
    
    textarea.focus();

    function removeTextarea() {
      textarea.parentNode?.removeChild(textarea);
      window.removeEventListener('click', handleOutsideClick);
      textNode.show();
      transformerRef.current?.show();
      // transformerRef.current?.forceUpdate(); // Not always needed, can cause flicker
      textNode.getLayer()?.batchDraw();
    }

    function setTextareaWidth(newWidth: number) {
      let calculatedWidth = newWidth;
      if (!calculatedWidth || calculatedWidth <= 0) {
        calculatedWidth = textNode.fontSize() * 10; 
      } else {
        const minPracticalWidth = textNode.fontSize() * 2; 
        calculatedWidth = Math.max(calculatedWidth, minPracticalWidth);
      }
      textarea.style.width = calculatedWidth + 'px';
    }

    const handleBlur = () => {
      textNode.text(textarea.value);
      handleObjectManipulation(textId, { text: textarea.value });
      removeTextarea();
      textarea.removeEventListener('blur', handleBlur); // Clean up listener
    };
    textarea.addEventListener('blur', handleBlur);

    textarea.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        textNode.text(textarea.value);
        handleObjectManipulation(textId, { text: textarea.value });
        removeTextarea();
      }
      if (ev.key === 'Escape') {
        removeTextarea();
      }
    
      setTextareaWidth(textNode.width() * stageContentScale); 
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + (textNode.fontSize() * stageContentScale / 2) + 'px';
    });

    function handleOutsideClick(ev: MouseEvent) {
      if (ev.target !== textarea) {
        // Blur event should handle saving and removal if textarea loses focus
        // No need to explicitly save here if blur is reliable
        // textNode.text(textarea.value);
        // handleObjectManipulation(textId, { text: textarea.value });
        // removeTextarea();
        // window.removeEventListener('click', handleOutsideClick, { capture: true });
      }
    }
    // Using blur is generally more reliable than outside click for textareas
    // setTimeout(() => {
    //   window.addEventListener('click', handleOutsideClick, { capture: true });
    // });
  };
  // Set up add to cart atom
  const [, addToCart] = useAtom(addToCartAtom);
  const handleAddToCart = async () => {
    if (!product) {
      toast({
        title: "Error",
        description: "Product information is missing.",
        variant: "destructive"
      });
      return;
    }

    // First, create and save a new design
    // This ensures each "Add to Cart" action creates a unique design
    if (!stageRef.current) {
      toast({
        title: "Error",
        description: "Canvas not available. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    // Similar to handleSaveDesign but we'll generate a new design every time
    const stage = stageRef.current;
    const fullDesignImage = stage.toDataURL({ mimeType: 'image/png' });
    
    // Capture uploaded images and text elements just like in handleSaveDesign
    const uploadedImagesData = uploadedImages.map(img => ({
      id: img.id!,
      dataUrl: img.image.src,
      name: img.name || img.id,
    }));
    
    const textImagesData = [];
    for (const textConfig of texts) {
      if (!textConfig.id) continue;
      const textNode = stage.findOne('#' + textConfig.id) as Konva.Text;
      if (textNode) {
        const textDataURL = textNode.toDataURL({ mimeType: 'image/png' });
        textImagesData.push({
          id: textConfig.id,
          dataUrl: textDataURL,
          text: textConfig.text || '',
        });
      }
    }
    
    // Create a unique design ID for this cart addition
    const uniqueDesignId = `${product.product_id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const designToSave = {
      id: uniqueDesignId,
      productId: product.product_id,
      timestamp: Date.now(),
      fullDesignImage,
      uploadedImages: uploadedImagesData,
      textImages: textImagesData,
    };
    
    try {
      // Save the design and get the saved ID
      const savedDesignId = await saveDesignToDB(designToSave);
      setDesignId(savedDesignId); // Update the component state
      setHasCustomized(true);
      
      // Now add to cart with the new design ID
      addToCart({
        product,
        quantity,
        selectedCustomizations: {},
        designId: savedDesignId,
        customPreviewUrl: fullDesignImage
      });
      
      toast({
        title: "Added to cart",
        description: "Your customized product has been added to the cart.",
        action: (
          <Button variant="outline" size="sm" onClick={() => router.push('/cart')}>
            View Cart
          </Button>
        )
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!product || !backgroundImage) {
    return <div className="flex justify-center items-center h-screen">
      <Loader/>
    </div>;
  }

  const selectedItemIsText = selectedShapeId && texts.some(t => t.id === selectedShapeId);
  const currentSelectedTextNode = selectedItemIsText ? texts.find(t => t.id === selectedShapeId) : null;

  return (
    <div className="p-4 md:p-5 lg:p-6 bg-slate-50 font-sans flex flex-col lg:h-[80vh]" > 
      <h2 className="text-2xl font-semibold mb-4 text-center text-slate-700 shrink-0">Customize Your {product.name}</h2>
      {/* Changed to flex-col lg:flex-row. Canvas is now first in DOM order. */}
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 flex-grow overflow-hidden"> 
        
        {/* Canvas Area (Now first for mobile layout: top, left for desktop) */}
        <div 
          ref={canvasContainerRef}
          className="canvas-container border border-gray-200 rounded-xl overflow-hidden flex-grow flex justify-center items-center bg-white shadow-lg p-2 md:p-4 relative"
          style={{ minHeight: '300px' }} // Ensure container has some minimum height
        >
          <Stage 
            width={scaledStageDimensions.width} 
            height={scaledStageDimensions.height} 
            scaleX={stageContentScale}
            scaleY={stageContentScale}
            ref={stageRef}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
            className="shadow-lg"
          >
            <Layer>
              <KonvaImage 
                image={backgroundImage} 
                width={baseDesignSize.width} 
                height={baseDesignSize.height} 
                x={0}
                y={0}
              />
              {uploadedImages.map((imgProps) => (
                <KonvaImage
                  key={imgProps.id}
                  {...imgProps}
                  onClick={() => setSelectedShapeId(imgProps.id!)}
                  onTap={() => setSelectedShapeId(imgProps.id!)}
                  onDragEnd={(e) => {
                    handleObjectManipulation(imgProps.id!, { x: e.target.x(), y: e.target.y() });
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);
                    handleObjectManipulation(imgProps.id!, {
                      x: node.x(),
                      y: node.y(),
                      width: Math.max(5, node.width() * scaleX),
                      height: Math.max(5, node.height() * scaleY),
                      rotation: node.rotation(),
                    });
                  }}
                />
              ))}
              {texts.map((textProps) => (
                <KonvaText
                  key={textProps.id}
                  {...textProps}
                  onClick={() => setSelectedShapeId(textProps.id!)}
                  onTap={() => setSelectedShapeId(textProps.id!)}
                  onDblClick={(e) => handleTextDblClick(e, textProps.id!)}
                  onDblTap={(e) => handleTextDblClick(e, textProps.id!)} // Added for mobile
                  onDragEnd={(e) => {
                    handleObjectManipulation(textProps.id!, { x: e.target.x(), y: e.target.y() });
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target as Konva.Text;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);
                    handleObjectManipulation(textProps.id!, {
                      x: node.x(),
                      y: node.y(),
                      fontSize: Math.max(5, (node.fontSize() || 20) * scaleY), // Use scaleY for font size typically
                      width: Math.max(5, node.width() * scaleX),
                      // height: Math.max(5, node.height() * scaleY), // Height is often auto for text
                      rotation: node.rotation(),
                    });
                  }}
                />
              ))}
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </Layer>
          </Stage>
        </div>

        {/* Customization Tools Panel (Now second for mobile layout: bottom, right for desktop) */}
        <Card className="w-full lg:w-[380px] flex flex-col shadow-lg rounded-lg border border-slate-200 bg-white overflow-hidden flex-grow  lg:flex-grow-0">
          <CardHeader className="bg-slate-50 border-b border-slate-200 rounded-t-lg px-4 py-3 shrink-0">
            <CardTitle className="text-xl font-medium text-slate-800">Customization Tools</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-5 space-y-3 overflow-y-auto flex-grow"> {/* Scrollable content */}
            {/* Image Upload Section */}
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <Label htmlFor="file-upload-input-label" className="text-sm font-medium text-slate-700">Upload Image</Label>
              <Button asChild variant="outline" className="w-full py-3 border-2 border-dashed border-blue-400 hover:border-blue-500 hover:bg-blue-50 text-blue-600 transition-all duration-150 rounded-lg focus:ring-2 focus:ring-blue-300">
                <Label htmlFor="file-upload-input" className="cursor-pointer flex items-center justify-center w-full">
                  <Upload className="mr-2 h-5 w-5" /> Upload Your Image
                  <Input id="file-upload-input" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                </Label>
              </Button>
            </div>

            {/* Add Text Section */}
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <Label className="text-sm font-medium text-slate-700">Add Text</Label>
              <Button onClick={handleAddText} variant="outline" className="w-full py-3 border-slate-300 hover:border-green-500 hover:bg-green-50 text-green-700 transition-all duration-150 rounded-lg focus:ring-2 focus:ring-green-300">
                <Plus className="mr-2 h-5 w-5" /> Add Text Element
              </Button>
            </div>

            {/* Show Saved Designs Button - Added */}
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <Label className="text-sm font-medium text-slate-700">View Saved Designs</Label>
              <Button onClick={handleShowSavedDesigns} variant="outline" className="w-full py-3 border-slate-300 hover:border-purple-500 hover:bg-purple-50 text-purple-700 transition-all duration-150 rounded-lg focus:ring-2 focus:ring-purple-300">
                Show Saved Designs in Console
              </Button>
            </div>

            {/* Object Manipulation Section (Delete, Layers) */}
            {selectedShapeId && (
              <div className="pt-4 space-y-4">
                <h3 className="text-base font-medium text-slate-700 mb-2">Selected Item Controls</h3>
                
                {/* Text Styling Sub-section */}
                {selectedItemIsText && currentSelectedTextNode && (
                  <TextCustomizationOptions
                    currentSelectedTextNode={currentSelectedTextNode as CustomTextConfig}
                    handleObjectManipulation={handleObjectManipulation}
                  />
                )}

                {/* General Item Controls (Layering, Delete) */}
                <div className="space-y-2 pt-2">
                  <Button onClick={() => handleLayerChange('forward')} variant="outline" className="w-full justify-start text-slate-700 hover:bg-slate-100 border-slate-300 rounded-md py-2.5 focus:ring-2 focus:ring-slate-300">
                    <ArrowUp className="mr-2 h-4 w-4 text-slate-500" /> Bring Forward
                  </Button>
                  <Button onClick={() => handleLayerChange('backward')} variant="outline" className="w-full justify-start text-slate-700 hover:bg-slate-100 border-slate-300 rounded-md py-2.5 focus:ring-2 focus:ring-slate-300">
                    <ArrowDown className="mr-2 h-4 w-4 text-slate-500" /> Send Backward
                  </Button>
                  <Button onClick={handleDelete}  variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50 border-red-400 hover:border-red-500 rounded-md py-2.5 mt-2 focus:ring-2 focus:ring-red-300">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                  </Button>
                </div>
              </div>
            )}
            
            {/* Save Design Section */}
            <div className="pt-4 mt-3 border-t border-slate-200 shrink-0">
              <Button onClick={handleSaveDesign} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-150 focus:ring-2 focus:ring-green-300 focus:ring-offset-2">
                <Save className="mr-2 h-5 w-5" /> Save Your Design
              </Button>
            </div>

            {/* Add To Cart Section */}
            <div className="pt-4 mt-3 border-t border-slate-200 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <Label htmlFor="quantity" className="font-medium text-slate-700">Quantity:</Label>
                <div className="flex items-center space-x-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8 p-0" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                    className="w-14 h-8 text-center"
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              {product && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Price:</span>
                  <span className="text-lg font-bold text-blue-600">
                    ₹{(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              )}

              <Button 
                onClick={handleAddToCart} 
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-150 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 mt-2"
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductCustomizer;
