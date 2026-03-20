"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ImageIcon, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import api, { getImageUrl } from "@/lib/api"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await api.post("upload.php", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      onChange(response.data.path)
    } catch {
      setError("Error al subir la imagen. Intenta de nuevo.")
    } finally {
      setUploading(false)
      // reset so the same file can be re-selected if needed
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {value ? (
        <div className="relative w-full h-40 rounded-md overflow-hidden border border-border bg-muted">
          <Image src={getImageUrl(value)} alt="Preview" fill className="object-contain" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-7 w-7 bg-background/80 hover:bg-background"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center w-full h-40 rounded-md border border-dashed border-border bg-muted cursor-pointer hover:bg-muted/70 transition-colors"
          onClick={() => !uploading && inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
          <span className="mt-2 text-sm text-muted-foreground">
            {uploading ? "Subiendo..." : "Seleccionar imagen"}
          </span>
        </div>
      )}

      {!value && !uploading && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => inputRef.current?.click()}
        >
          Elegir archivo
        </Button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
