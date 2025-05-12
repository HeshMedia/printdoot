import ProductForm from "@/components/admin/products/product-form"

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Product</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <ProductForm />
      </div>
    </div>
  )
}

