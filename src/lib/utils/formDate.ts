export const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

/**
 * Format a date into a human-readable relative format
 * (e.g., "2 days ago", "just now", etc.)
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 30) {
    // If more than 30 days, show the actual date
    return date.toLocaleDateString("en-US", { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
  
  if (days > 0) {
    return days === 1 ? "1 day ago" : `${days} days ago`
  }
  
  if (hours > 0) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`
  }
  
  if (minutes > 0) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`
  }
  
  return "just now"
}
