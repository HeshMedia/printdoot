"use client"

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from "react"
import { 
  fetchTextBanners,
  TextBannerResponse
} from "@/lib/api/text-banners"

// Context type definition
interface TextBannerContextType {
  banners: TextBannerResponse[]
  isLoading: boolean
  error: Error | null
  refreshBanners: () => Promise<void>
}

// Create the context with default values
const TextBannerContext = createContext<TextBannerContextType>({
  banners: [],
  isLoading: false,
  error: null,
  refreshBanners: async () => {}
})

// Provider component
export function TextBannerProvider({ children }: { children: ReactNode }) {
  const [banners, setBanners] = useState<TextBannerResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // Function to fetch banners from the API
  const refreshBanners = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchTextBanners(true) // Only fetch active banners
      setBanners(data.text_banners)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch text banners"))
      console.error("Error fetching text banners:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch banners on component mount
  useEffect(() => {
    refreshBanners()
  }, [])

  return (
    <TextBannerContext.Provider 
      value={{ 
        banners, 
        isLoading, 
        error, 
        refreshBanners 
      }}
    >
      {children}
    </TextBannerContext.Provider>
  )
}

// Custom hook for consuming the context
export function useTextBanner() {
  return useContext(TextBannerContext)
}