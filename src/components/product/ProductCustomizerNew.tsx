'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer } from 'react-konva';
import Konva from 'konva';
import { productsApi, Product } from '@/lib/api/products';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react';

interface ProductCustomizerProps {
  productId: string;
}

const ProductCustomizer: React.FC<ProductCustomizerProps> = ({ productId }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [uploadedImages, setUploadedImages] = useState<Array<Konva.ImageConfig & { image: HTMLImageElement }>>([]);
  const [texts, setTexts] = useState<Array<Konva.TextConfig>>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const productData = await productsApi.getProduct(productId);
        setProduct(productData);
        if (productData.side_images_url && productData.side_images_url.length > 0) {
          const img = new Image();
          img.src = productData.side_images_url[0];
          img.onload = () => {
            setBackgroundImage(img);
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

  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      const tr = transformerRef.current;
      if (selectedShapeId) {
        const selectedNode = stageRef.current.findOne('.' + selectedShapeId);
        if (selectedNode) {
          tr.nodes([selectedNode]);
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
      fill: '#000000',
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

  const handleSaveDesign = () => {
    if (stageRef.current) {
      setSelectedShapeId(null); 
      setTimeout(() => { 
        const dataURL = stageRef.current?.toDataURL({ mimeType: 'image/png' });
        if (dataURL) {
          const link = document.createElement('a');
          link.download = `${product?.name || 'custom-design'}.png`;
          link.href = dataURL;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }, 100);
    }
  };
  
  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedShapeId(null);
    }
  };

  // Text editing logic (double click)
  const handleTextDblClick = (e: Konva.KonvaEventObject<MouseEvent>, textId: string) => {
    const textNode = e.target as Konva.Text;

    // Get position and stage box BEFORE hiding node, just in case hiding affects measurements.
    const textPosition = textNode.getAbsolutePosition();
    const stage = stageRef.current;
    if (!stage) return;
    const stageBox = stage.container().getBoundingClientRect();

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
    const konvaPadding = textNode.padding();
    textarea.style.padding = konvaPadding + 'px';

    // Set content width and height
    textarea.style.width = (textNode.width() - konvaPadding * 2) + 'px';
    textarea.style.height = (textNode.height() - konvaPadding * 2) + 'px'; 
    
    textarea.style.fontSize = textNode.fontSize() + 'px';
    textarea.style.border = 'none';
    // textarea.style.padding = '0px'; // Replaced by konvaPadding
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = String(textNode.lineHeight());
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = textNode.align();
    textarea.style.color = String(textNode.fill() || 'black');
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
    textarea.style.height = 'auto'; 
    textarea.style.height = textarea.scrollHeight + 'px'; 
    
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
      const scale = textNode.getAbsoluteScale().x;
      setTextareaWidth(textNode.width() * scale);
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + textNode.fontSize() + 'px';
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

  if (!product || !backgroundImage) {
    return <div className="flex justify-center items-center h-screen">Loading customizer...</div>;
  }

  const canvasWidth = backgroundImage.width;
  const canvasHeight = backgroundImage.height;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-center md:text-left">Customize {product.name}</h2>
      <div className="flex flex-col md:flex-row-reverse gap-6">
        
        <Card className="w-full md:w-auto md:min-w-[300px] lg:min-w-[350px] self-start"> 
          <CardHeader>
            <CardTitle>Customization Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload-input-label" className="text-sm font-medium">Upload Image</Label>
              <Button asChild variant="outline" className="w-full mt-1">
                <Label htmlFor="file-upload-input" className="cursor-pointer flex items-center justify-center w-full">
                  <Upload className="mr-2 h-4 w-4" /> Upload Image
                  <Input id="file-upload-input" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                </Label>
              </Button>
            </div>

            <div>
              <Label className="text-sm font-medium">Add Text</Label>
              <Button onClick={handleAddText} variant="outline" className="w-full mt-1">
                <Plus className="mr-2 h-4 w-4" /> Add Text
              </Button>
            </div>

            {selectedShapeId && (
              <div className="space-y-2 pt-4 mt-4 border-t">
                <Label className="text-sm font-medium">Selected Item Controls</Label>
                <Button onClick={handleDelete} variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                </Button>
                <Button onClick={() => handleLayerChange('forward')} variant="outline" className="w-full">
                  <ArrowUp className="mr-2 h-4 w-4" /> Bring Forward
                </Button>
                <Button onClick={() => handleLayerChange('backward')} variant="outline" className="w-full">
                  <ArrowDown className="mr-2 h-4 w-4" /> Send Backward
                </Button>
              </div>
            )}
            
            <div className="pt-4 mt-4 border-t">
              <Button onClick={handleSaveDesign} className="w-full bg-green-600 hover:bg-green-700 text-white">
                <Save className="mr-2 h-4 w-4" /> Save Design
              </Button>
            </div>
          </CardContent>
        </Card>

        <div 
          className="canvas-container border border-gray-300 rounded-lg overflow-hidden flex-grow flex justify-center items-center bg-gray-50 shadow-inner"
        >
          <Stage 
            width={canvasWidth} 
            height={canvasHeight} 
            ref={stageRef}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
            className="shadow-lg"
          >
            <Layer>
              <KonvaImage image={backgroundImage} width={canvasWidth} height={canvasHeight} />
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
                // Optionally, enable more resize anchors
                // enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']}
                // rotateEnabled={true}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};

export default ProductCustomizer;
