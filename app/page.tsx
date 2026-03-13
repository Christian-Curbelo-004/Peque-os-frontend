"use client"

import { useState, useMemo, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import { initialProducts } from "@/lib/store"
import { Product } from "@/components/cart-provider"
import { Mail, Phone, MapPin, Instagram } from "lucide-react"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>(initialProducts)

  // Load products from localStorage if admin has modified them
  useEffect(() => {
    const storedProducts = localStorage.getItem("admin_products")
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts))
    }
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.enabled &&
        (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, products])

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={setSearchQuery} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <section className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-2 text-balance">
            Pequeños
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-4">
            Presentes en sus momentos
          </p>
          <p className="text-sm sm:text-base text-muted-foreground/80 max-w-xl mx-auto text-pretty px-4">
            Bolsitas y kits temáticos para cumpleaños infantiles. 
            Personajes favoritos, dulces y mucha diversión.
          </p>
        </section>

        {/* Products Grid */}
        <section className="mb-16 sm:mb-20">
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-6 sm:mb-8">
            Nuestros Productos
          </h3>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No se encontraron productos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section id="contacto" className="scroll-mt-20">
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 md:p-12">
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-6 sm:mb-8 text-center">
              Contacto
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-accent flex items-center justify-center">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm sm:text-base">Teléfono</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    +598 99 123 456
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-accent flex items-center justify-center">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm sm:text-base">Email</p>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">
                    hola@pequenosuy.com
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-accent flex items-center justify-center">
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm sm:text-base">Instagram</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    @pequenosuy
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-accent flex items-center justify-center">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm sm:text-base">Ubicación</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Montevideo, Uruguay
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16 sm:mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2024 pequeños uy. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
