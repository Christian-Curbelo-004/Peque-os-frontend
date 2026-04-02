"use client"

import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCart } from "@/components/cart-provider"
import Link from "next/link"
import Image from "next/image"

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-background border-border">
        <SheetHeader>
          <SheetTitle className="text-foreground">Tu Carrito</SheetTitle>
          <SheetDescription className="sr-only">
            Productos agregados al carrito
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Tu carrito está vacío</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-card rounded-lg border border-border"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {item.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      ${item.price}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 pb-6 space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
              <Link href="/checkout" onClick={() => onOpenChange(false)}>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Continuar al Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
