"use client"

import { useState, useMemo, useEffect, useCallback, type FormEvent } from "react"
import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import { Product } from "@/components/cart-provider"
import { Mail, Phone, MapPin, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "sonner"
import api from "@/lib/api"

function mapProduct(p: Record<string, unknown>): Product {
  return {
    id: String(p.id),
    name: p.name as string,
    description: (p.description as string) ?? "",
    price: p.price as number,
    image: (p.image_url as string) ?? "/products/placeholder.jpg",
    enabled: (p.visible as boolean) ?? true,
  }
}

const PRODUCTS_LIMIT = 50

{/* ONE COLOR PER LETTER NEW!!! */ }
const HERO_TITLE_LETTERS = [
  { char: 'P', color: '#F6A6A6' },
  { char: 'E', color: '#9CCFB8' },
  { char: 'Q', color: '#F6D36B' },
  { char: 'U', color: '#D2A7E8' },
  { char: 'E', color: '#F7B77E' },
  { char: 'Ñ', color: '#B8C7E8' },
  { char: 'O', color: '#F4A3B4' },
  { char: 'S', color: '#A6D8D1' },
] as const

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [productsOffset, setProductsOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [contactMessage, setContactMessage] = useState("")
  const [isSendingContact, setIsSendingContact] = useState(false)

  useEffect(() => {
    api.get(`/products.php?limit=${PRODUCTS_LIMIT}&offset=0`).then(({ data }) => {
      const fetched = (data as Record<string, unknown>[]).map(mapProduct)
      setProducts(fetched)
      setProductsOffset(fetched.length)
      setHasMore(fetched.length === PRODUCTS_LIMIT)
    }).catch(() => {
      // fallback: empty list
    }).finally(() => {
      setIsLoading(false)
    })
  }, [])

  const loadMore = useCallback(async () => {
    setIsLoadingMore(true)
    try {
      const { data } = await api.get(`/products.php?limit=${PRODUCTS_LIMIT}&offset=${productsOffset}`)
      const fetched = (data as Record<string, unknown>[]).map(mapProduct)
      setProducts((prev) => [...prev, ...fetched])
      setProductsOffset((prev) => prev + fetched.length)
      setHasMore(fetched.length === PRODUCTS_LIMIT)
    } catch {
      // silently ignore
    } finally {
      setIsLoadingMore(false)
    }
  }, [productsOffset])

  const handleContactSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const message = contactMessage.trim()
    if (!message) {
      toast.error("Escribí un mensaje para enviar por WhatsApp")
      return
    }

    setIsSendingContact(true)
    try {
      await api.post("/contact.php", { message })
      setContactMessage("")
      toast.success("Mensaje enviado correctamente")
    } catch (error: unknown) {
      const messageError =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "No se pudo enviar el mensaje"
      toast.error(messageError)
    } finally {
      setIsSendingContact(false)
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.enabled &&
        (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, products])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Pequeños UY',
    description: 'Sorpresitas, bolsitas y regalos temáticos para cumpleaños infantiles en Uruguay.',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pequenosuy.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pequenosuy.com'}/logo.png`,
    image: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pequenosuy.com'}/logo.png`,
    telephone: '+598 99 123 456',
    email: 'hola@pequenosuy.com',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'UY',
    },
    sameAs: [
      'https://www.instagram.com/pequenosuy',
    ],
    priceRange: '$$',
    currenciesAccepted: 'UYU',
    paymentAccepted: 'Cash, Bank Transfer',
  }

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar onSearch={setSearchQuery} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Hero Section */} {/* ACTUALIZADO  */ }
        <section className="text-center mb-12 sm:mb-16">
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 text-balance tracking-wide"  
            aria-label="PEQUEÑOS"
          >
            {HERO_TITLE_LETTERS.map(({ char, color }, index) => (
              <span
                key={`${char}-${index}`}
                aria-hidden="true"
                className="inline-block drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]"
                style={{ color }}
              >
                {char}
              </span>
            ))}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-4">
            Presentes en sus momentos
          </p>
          <p className="text-sm sm:text-base text-muted-foreground/80 max-w-xl mx-auto text-pretty px-4">
            Artículos artesanales para eventos. 100% personalizados y únicos. {/* NUEVO */ }
            Souvenirs, kits y más con amor
          </p>
        </section>

        {/* Products Grid */}
        <section className="mb-16 sm:mb-20">
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-6 sm:mb-8">
            Nuestros Productos
          </h3>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-8 w-8" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No se encontraron productos
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {hasMore && !searchQuery && (
                <div className="flex justify-center mt-8">
                  <Button variant="outline" onClick={loadMore} disabled={isLoadingMore}>
                    {isLoadingMore ? <Spinner className="h-4 w-4 mr-2" /> : null}
                    Ver más productos
                  </Button>
                </div>
              )}
            </>
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
            <form onSubmit={handleContactSubmit} className="mt-8 max-w-2xl mx-auto space-y-4">
              <div className="space-y-2 text-left">
                <label htmlFor="contact-message" className="text-sm font-medium text-foreground">
                  Escribinos por WhatsApp
                </label>
                <Textarea
                  id="contact-message"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Contanos qué necesitás y te respondemos por WhatsApp."
                  rows={4}
                />
              </div>
              <div className="flex justify-center">
                <Button type="submit" disabled={isSendingContact}>
                  {isSendingContact ? "Enviando..." : "Enviar mensaje"}
                </Button>
              </div>
            </form>
          </div>
        </section>
        {/* FAQ Section */}
        <section className="mt-16 sm:mt-20">
          <div className="text-center mb-8 sm:mb-10">
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
              Preguntas frecuentes
            </h3>
            <p className="text-sm text-muted-foreground">Todo lo que necesitás saber antes de hacer tu pedido.</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible>
              <AccordionItem value="pago">
                <AccordionTrigger className="text-base font-medium text-left">
                  ¿Cómo se paga?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Al hacer tu pedido elegís el método de pago. Si elegís{" "}
                  <span className="text-foreground font-medium">transferencia bancaria</span>, cuando el pedido esté listo nos comunicamos para enviarte los datos. Si elegís{" "}
                  <span className="text-foreground font-medium">efectivo</span>, el pago se hace en el momento de la entrega.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="listo">
                <AccordionTrigger className="text-base font-medium text-left">
                  ¿Cómo sé cuándo mi pedido está listo?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Te notificamos por{" "}
                  <span className="text-foreground font-medium">email</span> al correo que ingresaste. Si además hay que coordinar el pago o los detalles del envío, también te contactamos por{" "}
                  <span className="text-foreground font-medium">WhatsApp</span> al número que proporcionaste.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="pago-online" className="border-b-0">
                <AccordionTrigger className="text-base font-medium text-left">
                  ¿Se puede pagar desde la propia página?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  En la versión actual no es posible realizar el pago directamente desde la página. Sin embargo, es algo que podría sumarse en el futuro como opción para hacer el proceso aún más fácil.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16 sm:mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} pequeños uy. Todos los derechos reservados.
          </p>
          <span className="text-xs sm:text-sm text-muted-foreground">
            Web desarrollada por
            <a href="#" className="mx-1 underline text-primary" target="_blank" rel="noopener noreferrer">Rodrigo Doldán</a>
            y
            <a href="#" className="mx-1 underline text-primary" target="_blank" rel="noopener noreferrer">Christian Curbelo</a>
          </span>
        </div>
      </footer>
    </div>
  )
}
