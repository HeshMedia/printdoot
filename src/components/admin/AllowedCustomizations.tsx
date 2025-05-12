// "use client"

// import { useState } from "react"
// import { 
//   Card, 
//   CardContent, 
//   CardHeader, 
//   CardTitle 
// } from "@/components/ui/card"
// import { 
//   Input 
// } from "@/components/ui/input"
// import { 
//   Button 
// } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog"
// import { 
//   Label 
// } from "@/components/ui/label"
// import { 
//   Plus,
//   Trash2,
//   X
// } from "lucide-react"
// import { Badge } from "@/components/ui/badge"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible"

// interface AllowedCustomizationsProps {
//   customizations: Record<string, string[]>
//   onChange: (key: string, values: string[]) => void
//   onAdd: () => void
//   onRemove: (key: string) => void
// }

// export default function AllowedCustomizations({
//   customizations,
//   onChange,
//   onAdd,
//   onRemove,
// }: AllowedCustomizationsProps) {
//   const [newFieldName, setNewFieldName] = useState("")
//   const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false)
//   const [newValueInput, setNewValueInput] = useState("")
  
//   const handleAddField = () => {
//     if (newFieldName.trim()) {
//       onChange(newFieldName.trim(), [])
//       setNewFieldName("")
//       setIsAddFieldDialogOpen(false)
//     }
//   }
  
//   const handleAddValue = (fieldName: string) => {
//     if (newValueInput.trim()) {
//       const currentValues = [...(customizations[fieldName] || [])]
//       onChange(fieldName, [...currentValues, newValueInput.trim()])
//       setNewValueInput("")
//     }
//   }
  
//   const handleRemoveValue = (fieldName: string, valueToRemove: string) => {
//     const currentValues = [...(customizations[fieldName] || [])]
//     onChange(fieldName, currentValues.filter(value => value !== valueToRemove))
//   }

//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="text-md flex justify-between items-center">
//           Allowed Customizations
//           <Dialog open={isAddFieldDialogOpen} onOpenChange={setIsAddFieldDialogOpen}>
//             <Button 
//               variant="outline" 
//               size="sm" 
//               className="h-8 gap-1"
//               onClick={() => setIsAddFieldDialogOpen(true)}
//             >
//               <Plus className="h-4 w-4" />
//               Add Field
//             </Button>
//             <DialogContent className="sm:max-w-[425px]">
//               <DialogHeader>
//                 <DialogTitle>Add Customization Field</DialogTitle>
//               </DialogHeader>
//               <div className="grid gap-4 py-4">
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="fieldName" className="text-right">
//                     Field Name
//                   </Label>
//                   <Input
//                     id="fieldName"
//                     value={newFieldName}
//                     onChange={(e) => setNewFieldName(e.target.value)}
//                     className="col-span-3"
//                     placeholder="Size, Color, Material, etc."
//                   />
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button variant="outline" onClick={() => setIsAddFieldDialogOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button onClick={handleAddField} disabled={!newFieldName.trim()}>
//                   Add Field
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         {Object.keys(customizations).length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground border border-dashed rounded-lg">
//             <p className="mb-2">No customization fields added yet</p>
//             <Button 
//               variant="outline" 
//               size="sm" 
//               onClick={() => setIsAddFieldDialogOpen(true)}
//               className="gap-1"
//             >
//               <Plus className="h-4 w-4" />
//               Add your first customization field
//             </Button>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {Object.entries(customizations).map(([fieldName, values]) => (
//               <Collapsible key={fieldName} className="border rounded-lg overflow-hidden">
//                 <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
//                   <div className="font-medium">{fieldName}</div>
//                   <div className="flex items-center gap-2">
//                     <Badge variant="outline">
//                       {values.length} {values.length === 1 ? 'value' : 'values'}
//                     </Badge>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         onRemove(fieldName);
//                       }}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                     <CollapsibleTrigger asChild>
//                       <Button variant="ghost" size="icon" className="h-8 w-8">
//                         <Plus className="h-4 w-4" />
//                       </Button>
//                     </CollapsibleTrigger>
//                   </div>
//                 </div>
                
//                 <CollapsibleContent>
//                   <div className="p-4 bg-background border-t">
//                     <ScrollArea className="h-[120px] rounded-md border p-2">
//                       <div className="flex flex-wrap gap-2 p-1">
//                         {values.length === 0 ? (
//                           <p className="text-muted-foreground text-sm">No values added</p>
//                         ) : (
//                           values.map((value, index) => (
//                             <Badge 
//                               key={index}
//                               variant="secondary" 
//                               className="flex items-center gap-1 px-2 py-1"
//                             >
//                               {value}
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 className="h-4 w-4 rounded-full ml-1 p-0"
//                                 onClick={() => handleRemoveValue(fieldName, value)}
//                               >
//                                 <X className="h-3 w-3" />
//                               </Button>
//                             </Badge>
//                           ))
//                         )}
//                       </div>
//                     </ScrollArea>
                    
//                     <div className="flex gap-2 mt-4">
//                       <Input
//                         placeholder="Add a new value"
//                         value={newValueInput}
//                         onChange={(e) => setNewValueInput(e.target.value)}
//                         onKeyDown={(e) => {
//                           if (e.key === 'Enter' && newValueInput.trim()) {
//                             e.preventDefault();
//                             handleAddValue(fieldName);
//                           }
//                         }}
//                       />
//                       <Button 
//                         onClick={() => handleAddValue(fieldName)}
//                         disabled={!newValueInput.trim()}
//                       >
//                         Add
//                       </Button>
//                     </div>
//                   </div>
//                 </CollapsibleContent>
//               </Collapsible>
//             ))}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
// }