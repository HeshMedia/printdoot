import React from 'react'
import {  PackageOpen, Ruler } from 'lucide-react'

interface Dimension {
  length?: number
  breadth?: number
  height?: number
  radius?: number
  label?: string
}

interface ProductDimensionsProps {
  dimensions: Dimension[] | Dimension | null
  weight?: number
  material?: string
}

const ProductDimensions: React.FC<ProductDimensionsProps> = ({
  dimensions,
  weight,
  material
}) => {
  // Handle missing dimension data
  if (!dimensions) {
    return null
  }

  // Handle legacy format (convert to array)
  const dimensionsArray = Array.isArray(dimensions) ? dimensions : [dimensions]
  
  // Filter out empty dimension objects
  const validDimensions = dimensionsArray.filter(dim => 
    dim.length || dim.breadth || dim.height || dim.radius
  )
  
  // If no valid dimensions, hide the component
  if (validDimensions.length === 0) {
    return null
  }

  // Helper function to format a dimension value, omitting values that are 0 or undefined
  const formatDimension = (value?: number) => {
    if (!value || value === 0) return '';
    return `${value} cm`;
  }

  // Helper function to build the dimensions string without question marks
  const buildDimensionsString = (dim: Dimension) => {
    if (dim.radius) {
      return `${formatDimension(dim.radius)} (radius)`.trim();
    }
    
    const length = formatDimension(dim.length);
    const breadth = formatDimension(dim.breadth);
    const height = formatDimension(dim.height);
    
    // Create an array of the non-empty dimension values
    const parts = [length, breadth, height].filter(part => part !== '');
    
    // If no parts are valid, return empty string
    if (parts.length === 0) return '';
    
    // Join parts with the × symbol
    return parts.join(' × ');
  };

  return (
    <div className="space-y-4">
      <h3 className="flex items-center font-medium">
        <Ruler className="h-5 w-5 mr-2" />
        Product Specifications
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {validDimensions.map((dim, index) => {
          // Get the formatted dimensions string
          const dimensionsString = buildDimensionsString(dim);
          
          // Skip this dimension if the string is empty
          if (!dimensionsString) return null;
          
          return (
            <div key={index} className="bg-muted p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">
                {dim.label || `Dimensions${validDimensions.length > 1 ? ` (${index + 1})` : ''}`}
              </div>
              <div className="font-medium">
                {dimensionsString}
              </div>
            </div>
          );
        })}
        
        {weight && weight > 0 && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-xs text-muted-foreground">Weight</div>
            <div className="font-medium">{weight} g</div>
          </div>
        )}
        
        {material && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-xs text-muted-foreground">Material</div>
            <div className="font-medium">{material}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDimensions