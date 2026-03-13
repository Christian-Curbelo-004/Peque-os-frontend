"use client"

import Image from "next/image"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Product, useCart } from "@/components/cart-provider"
import { toast } from "sonner"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product)
    toast.success(`${product.name} agregado al carrito`)
  }

  return (
    <Card className="group overflow-hidden border-border bg-card hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-square relative overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardContent className="p-3 sm:p-4">
        <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base line-clamp-1">{product.name}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-base sm:text-lg font-bold text-foreground">
            ${product.price}
          </span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm px-2 sm:px-3"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Agregar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
