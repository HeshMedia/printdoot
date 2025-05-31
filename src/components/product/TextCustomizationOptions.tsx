// e:/hesh/printdoot/src/components/product/TextCustomizationOptions.tsx
import React from 'react';
import { AVAILABLE_FONTS, CustomTextConfig } from './ProductCustomizerNew';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Palette, CaseSensitive, Eraser, Baseline, Pipette, Layers, Sparkles, VenetianMask, MoveUp, MoveDown, RotateCcw, Maximize, Minimize, Blend } from 'lucide-react'; // Example icons

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  tooltip?: string;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon, tooltip, children }) => {
  const headerContent = (
    <summary className="font-semibold cursor-pointer flex items-center py-2 px-1 hover:bg-slate-50 rounded-md">
      {icon && <span className="mr-2 h-4 w-4 text-slate-600">{icon}</span>}
      <span className="text-sm text-slate-700">{title}</span>
    </summary>
  );

  return (
    <details className="mb-1 border border-slate-200 rounded-md bg-white shadow-sm">
      {tooltip ? (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>{headerContent}</TooltipTrigger>
            <TooltipContent side="right" align="center" className="text-xs">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        headerContent
      )}
      <div className="mt-1 p-3 border-t border-slate-200 bg-slate-50/50">
        {children}
      </div>
    </details>
  );
};

interface TextCustomizationOptionsProps {
  currentSelectedTextNode: CustomTextConfig | null;
  handleObjectManipulation: (id: string, newAttrs: Partial<CustomTextConfig>) => void;
}

const TextCustomizationOptions: React.FC<TextCustomizationOptionsProps> = ({
  currentSelectedTextNode,
  handleObjectManipulation,
}) => {
  if (!currentSelectedTextNode || !currentSelectedTextNode.id) {
    return <div className="p-4 text-sm text-center text-slate-500">Select a text element to see customization options.</div>;
  }

  const nodeId = currentSelectedTextNode.id;

  const handleChange = (key: keyof CustomTextConfig, value: any) => {
    let newAttrs: Partial<CustomTextConfig> = { [key]: value };
    if (key === 'textTransform') {
        let currentText = currentSelectedTextNode.text || '';
        if (value === 'uppercase') newAttrs.text = currentText.toUpperCase();
        else if (value === 'lowercase') newAttrs.text = currentText.toLowerCase();
        else if (value === 'capitalize') newAttrs.text = currentText.replace(/\b\w/g, char => char.toUpperCase());
        else newAttrs.text = currentSelectedTextNode.originalText || currentText; // Assuming originalText is stored if needed
        // Store original text if transforming for the first time
        if (value !== 'none' && !currentSelectedTextNode.originalText) {
            newAttrs.originalText = currentText;
        }
    }
    handleObjectManipulation(nodeId, newAttrs);
  };
  
  const handleStyleToggle = (style: 'bold' | 'italic' | 'underline') => {
    let newAttrs: Partial<CustomTextConfig> = {};
    switch (style) {
      case 'bold':
        newAttrs.fontWeight = currentSelectedTextNode.fontWeight === 'bold' ? 'normal' : 'bold';
        break;
      case 'italic':
        const currentFontStyle = currentSelectedTextNode.fontStyle || '';
        if (currentFontStyle.includes('italic')) {
          newAttrs.fontStyle = currentFontStyle.replace('italic', '').replace('bold', '').trim();
          if (currentSelectedTextNode.fontWeight === 'bold') newAttrs.fontStyle = ('bold ' + newAttrs.fontStyle).trim();
        } else {
          newAttrs.fontStyle = (currentFontStyle.replace('normal', '').trim() + ' italic').trim();
        }
        if (newAttrs.fontStyle === '') newAttrs.fontStyle = 'normal';
        break;
      case 'underline':
        newAttrs.textDecoration = currentSelectedTextNode.textDecoration === 'underline' ? '' : 'underline';
        break;
    }
    handleObjectManipulation(nodeId, newAttrs);
  };

  return (
    <div className="space-y-2 text-xs">
      <CollapsibleSection title="Font & Basic Styling" icon={<Palette size={14} />} tooltip="Adjust font, size, color, and basic styles.">
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            <Label htmlFor="text-color-picker-adv" className="text-xs font-medium text-slate-600 mb-1 block">Color</Label>
            <Input
              id="text-color-picker-adv"
              type="color"
              value={String(currentSelectedTextNode.fill || '#000000')}
              onChange={(e) => handleChange('fill', e.target.value)}
              className="w-full h-9 p-1"
            />
          </div>
          <div>
            <Label htmlFor="text-font-size" className="text-xs font-medium text-slate-600 mb-1 block">Size</Label>
            <Input
              id="text-font-size"
              type="number"
              min="1"
              value={currentSelectedTextNode.fontSize || 20}
              onChange={(e) => handleChange('fontSize', parseInt(e.target.value, 10) || 1)}
              className="w-full h-9"
            />
          </div>
        </div>
        <div className="mb-2">
          <Label htmlFor="text-font-family" className="text-xs font-medium text-slate-600 mb-1 block">Font Family</Label>
          <Select
            value={currentSelectedTextNode.fontFamily || AVAILABLE_FONTS[0]}
            onValueChange={(value) => handleChange('fontFamily', value)}
          >
            <SelectTrigger id="text-font-family" className="h-9 text-xs">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {AVAILABLE_FONTS.map(font => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }} className="text-xs">
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex space-x-1">
          <Button variant={currentSelectedTextNode.fontWeight === 'bold' ? 'secondary' : 'outline'} size="sm" onClick={() => handleStyleToggle('bold')} title="Bold" className="flex-1 h-8"><Bold size={14}/></Button>
          <Button variant={(currentSelectedTextNode.fontStyle || '').includes('italic') ? 'secondary' : 'outline'} size="sm" onClick={() => handleStyleToggle('italic')} title="Italic" className="flex-1 h-8"><Italic size={14}/></Button>
          <Button variant={currentSelectedTextNode.textDecoration === 'underline' ? 'secondary' : 'outline'} size="sm" onClick={() => handleStyleToggle('underline')} title="Underline" className="flex-1 h-8"><Underline size={14}/></Button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Alignment & Spacing" icon={<AlignLeft size={14} />} tooltip="Control text alignment, line height, and letter spacing.">
        <div className="space-y-2">
            <div>
                <Label className="text-xs font-medium text-slate-600 mb-1 block">Alignment</Label>
                <div className="flex space-x-1">
                    <Button variant={currentSelectedTextNode.align === 'left' ? 'secondary' : 'outline'} size="sm" onClick={() => handleChange('align', 'left')} title="Align Left" className="flex-1 h-8"><AlignLeft size={14}/></Button>
                    <Button variant={currentSelectedTextNode.align === 'center' ? 'secondary' : 'outline'} size="sm" onClick={() => handleChange('align', 'center')} title="Align Center" className="flex-1 h-8"><AlignCenter size={14}/></Button>
                    <Button variant={currentSelectedTextNode.align === 'right' ? 'secondary' : 'outline'} size="sm" onClick={() => handleChange('align', 'right')} title="Align Right" className="flex-1 h-8"><AlignRight size={14}/></Button>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="text-line-height" className="text-xs font-medium text-slate-600 mb-1 block">Line Height</Label>
                    <Input id="text-line-height" type="number" step="0.1" min="0.1" value={currentSelectedTextNode.lineHeight || 1.2} onChange={e => handleChange('lineHeight', parseFloat(e.target.value) || 1)} className="w-full h-9"/>
                </div>
                <div>
                    <Label htmlFor="text-letter-spacing" className="text-xs font-medium text-slate-600 mb-1 block">Letter Spacing</Label>
                    <Input id="text-letter-spacing" type="number" step="0.1" value={currentSelectedTextNode.letterSpacing || 0} onChange={e => handleChange('letterSpacing', parseFloat(e.target.value) || 0)} className="w-full h-9"/>
                </div>
            </div>
        </div>
      </CollapsibleSection>
      
      <CollapsibleSection title="Transformations" icon={<CaseSensitive size={14} />} tooltip="Apply text transformations like uppercase, lowercase, or capitalize.">
        <div>
            <Label className="text-xs font-medium text-slate-600 mb-1 block">Case</Label>
            <Select value={currentSelectedTextNode.textTransform || 'none'} onValueChange={value => handleChange('textTransform', value)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select case" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="none" className="text-xs">Normal</SelectItem>
                    <SelectItem value="uppercase" className="text-xs">Uppercase</SelectItem>
                    <SelectItem value="lowercase" className="text-xs">Lowercase</SelectItem>
                    <SelectItem value="capitalize" className="text-xs">Capitalize</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Visual Effects" icon={<Sparkles size={14} />} tooltip="Add shadow and control opacity.">
        <div className="space-y-3">
          <div>
            <Label htmlFor="text-opacity" className="text-xs font-medium text-slate-600 mb-1 block">Text Opacity</Label>
            <Input
              id="text-opacity"
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={currentSelectedTextNode.opacity ?? 1}
              onChange={(e) => handleChange('opacity', parseFloat(e.target.value) || 1)}
              className="w-full h-9"
            />
          </div>
          <div className="border-t border-slate-200 pt-3">
            <Label className="text-xs font-medium text-slate-600 mb-2 block">Text Shadow</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="text-shadow-color" className="text-xs font-medium text-slate-500 mb-1 block">Color</Label>
                <Input
                  id="text-shadow-color"
                  type="color"
                  value={currentSelectedTextNode.shadowColor || '#000000'}
                  onChange={(e) => handleChange('shadowColor', e.target.value)}
                  className="w-full h-9 p-1"
                />
              </div>
              <div>
                <Label htmlFor="text-shadow-blur" className="text-xs font-medium text-slate-500 mb-1 block">Blur</Label>
                <Input
                  id="text-shadow-blur"
                  type="number"
                  min="0"
                  value={currentSelectedTextNode.shadowBlur || 0}
                  onChange={(e) => handleChange('shadowBlur', parseInt(e.target.value, 10) || 0)}
                  className="w-full h-9"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <Label htmlFor="text-shadow-offset-x" className="text-xs font-medium text-slate-500 mb-1 block">Offset X</Label>
                <Input
                  id="text-shadow-offset-x"
                  type="number"
                  value={currentSelectedTextNode.shadowOffsetX || 0}
                  onChange={(e) => handleChange('shadowOffsetX', parseInt(e.target.value, 10) || 0)}
                  className="w-full h-9"
                />
              </div>
              <div>
                <Label htmlFor="text-shadow-offset-y" className="text-xs font-medium text-slate-500 mb-1 block">Offset Y</Label>
                <Input
                  id="text-shadow-offset-y"
                  type="number"
                  value={currentSelectedTextNode.shadowOffsetY || 0}
                  onChange={(e) => handleChange('shadowOffsetY', parseInt(e.target.value, 10) || 0)}
                  className="w-full h-9"
                />
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Background" icon={<Pipette size={14} />} tooltip="Set background color for the text box.">
        <div className="space-y-3">
          <div>
            <Label htmlFor="text-bg-color" className="text-xs font-medium text-slate-600 mb-1 block">Background Color</Label>
            <Input
              id="text-bg-color"
              type="color"
              value={currentSelectedTextNode.backgroundColor || '#ffffff'}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="w-full h-9 p-1"
            />
          </div>
          <div>
            <Label htmlFor="text-bg-opacity" className="text-xs font-medium text-slate-600 mb-1 block">Background Opacity</Label>
            <Input
              id="text-bg-opacity"
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={currentSelectedTextNode.backgroundOpacity ?? 1}
              onChange={(e) => handleChange('backgroundOpacity', parseFloat(e.target.value) || 1)}
              className="w-full h-9"
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Border & Outline" icon={<Eraser size={14} />} tooltip="Define text outline (stroke).">
        <div className="space-y-3">
          <div>
            <Label htmlFor="text-stroke-color" className="text-xs font-medium text-slate-600 mb-1 block">Outline Color</Label>
            <Input
              id="text-stroke-color"
              type="color"
              value={currentSelectedTextNode.stroke || '#000000'}
              onChange={(e) => handleChange('stroke', e.target.value)}
              className="w-full h-9 p-1"
            />
          </div>
          <div>
            <Label htmlFor="text-stroke-width" className="text-xs font-medium text-slate-600 mb-1 block">Outline Width</Label>
            <Input
              id="text-stroke-width"
              type="number"
              min="0"
              value={currentSelectedTextNode.strokeWidth || 0}
              onChange={(e) => handleChange('strokeWidth', parseInt(e.target.value, 10) || 0)}
              className="w-full h-9"
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Gradient Fill" icon={<Blend size={14} />} tooltip="Apply gradient fills to your text.">
         <div className="space-y-3">
            <div>
                <Label htmlFor="text-fill-priority" className="text-xs font-medium text-slate-600 mb-1 block">Fill Type</Label>
                <Select 
                    value={currentSelectedTextNode.fillPriority || 'color'}
                    onValueChange={(value) => handleChange('fillPriority', value)}
                >
                    <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select fill type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="color" className="text-xs">Solid Color</SelectItem>
                        <SelectItem value="linear-gradient" className="text-xs">Linear Gradient</SelectItem>
                        {/* Radial gradient can be added if supported by CustomTextConfig */}
                    </SelectContent>
                </Select>
            </div>

            {currentSelectedTextNode.fillPriority === 'linear-gradient' && (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="text-gradient-start-color" className="text-xs font-medium text-slate-500 mb-1 block">Start Color</Label>
                            <Input
                                id="text-gradient-start-color"
                                type="color"
                                value={currentSelectedTextNode.fillLinearGradientColorStops?.[1] || '#000000'}
                                onChange={(e) => {
                                    const stops = currentSelectedTextNode.fillLinearGradientColorStops || [0, '#000000', 1, '#ffffff'];
                                    handleChange('fillLinearGradientColorStops', [stops[0], e.target.value, stops[2], stops[3]]);
                                }}
                                className="w-full h-9 p-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="text-gradient-end-color" className="text-xs font-medium text-slate-500 mb-1 block">End Color</Label>
                            <Input
                                id="text-gradient-end-color"
                                type="color"
                                value={currentSelectedTextNode.fillLinearGradientColorStops?.[3] || '#ffffff'}
                                onChange={(e) => {
                                    const stops = currentSelectedTextNode.fillLinearGradientColorStops || [0, '#000000', 1, '#ffffff'];
                                    handleChange('fillLinearGradientColorStops', [stops[0], stops[1], stops[2], e.target.value]);
                                }}
                                className="w-full h-9 p-1"
                            />
                        </div>
                    </div>
                    {/* Basic point controls - can be expanded */}
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <Label htmlFor="text-gradient-start-x" className="text-xs font-medium text-slate-500 mb-1 block">Start X</Label>
                            <Input id="text-gradient-start-x" type="number" step="10" value={currentSelectedTextNode.fillLinearGradientStartPoint?.x ?? 0} onChange={e => handleChange('fillLinearGradientStartPoint', { ...(currentSelectedTextNode.fillLinearGradientStartPoint || {x:0, y:0}), x: parseInt(e.target.value) || 0 })} className="w-full h-9"/>
                        </div>
                        <div>
                            <Label htmlFor="text-gradient-start-y" className="text-xs font-medium text-slate-500 mb-1 block">Start Y</Label>
                            <Input id="text-gradient-start-y" type="number" step="10" value={currentSelectedTextNode.fillLinearGradientStartPoint?.y ?? 0} onChange={e => handleChange('fillLinearGradientStartPoint', { ...(currentSelectedTextNode.fillLinearGradientStartPoint || {x:0, y:0}), y: parseInt(e.target.value) || 0 })} className="w-full h-9"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-3">
                         <div>
                            <Label htmlFor="text-gradient-end-x" className="text-xs font-medium text-slate-500 mb-1 block">End X</Label>
                            <Input id="text-gradient-end-x" type="number" step="10" value={currentSelectedTextNode.fillLinearGradientEndPoint?.x ?? 50} onChange={e => handleChange('fillLinearGradientEndPoint', { ...(currentSelectedTextNode.fillLinearGradientEndPoint || {x:50, y:50}), x: parseInt(e.target.value) || 0 })} className="w-full h-9"/>
                        </div>
                        <div>
                            <Label htmlFor="text-gradient-end-y" className="text-xs font-medium text-slate-500 mb-1 block">End Y</Label>
                            <Input id="text-gradient-end-y" type="number" step="10" value={currentSelectedTextNode.fillLinearGradientEndPoint?.y ?? 50} onChange={e => handleChange('fillLinearGradientEndPoint', { ...(currentSelectedTextNode.fillLinearGradientEndPoint || {x:50, y:50}), y: parseInt(e.target.value) || 0 })} className="w-full h-9"/>
                        </div>
                    </div>
                </>
            )}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default TextCustomizationOptions;
