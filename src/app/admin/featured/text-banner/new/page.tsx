"use client"

import { TextBannerForm } from "@/components/admin/TextBannerForm"

export default function NewTextBannerPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Text Banner</h1>
      <TextBannerForm />
    </div>
  )
}