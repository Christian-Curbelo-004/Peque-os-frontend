"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Check, CreditCard, Banknote, MapPin, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/components/cart-provider"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import api from "@/lib/api"

type Step = "payment" | "delivery" | "contact" | "success"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [step, setStep] = useState<Step>("payment")
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [deliveryMethod, setDeliveryMethod] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Tu carrito está vacío</p>
          <Link href="/">
            <Button>Volver a la tienda</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleNext = () => {
    if (step === "payment" && !paymentMethod) {
      toast.error("Selecciona un método de pago")
      return
    }
    if (step === "delivery" && !deliveryMethod) {
      toast.error("Selecciona un método de entrega")
      return
    }

    if (step === "payment") setStep("delivery")
    else if (step === "delivery") setStep("contact")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    if (deliveryMethod === "envio" && !formData.address) {
      toast.error("Por favor ingresa tu dirección de envío")
      return
    }

    setIsSubmitting(true)

    try {
      await api.post("/pedidos.php", {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email,
        delivery_type: deliveryMethod === "retiro" ? "pickup" : "delivery",
        address: deliveryMethod === "envio" ? formData.address : undefined,
        payment_method: paymentMethod === "efectivo" ? "cash" : "transfer",
        notes: formData.notes || undefined,
        items: items.map((item) => ({
          product_id: Number(item.id),
          quantity: item.quantity,
        })),
      })
      clearCart()
      setStep("success")
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Error al enviar el pedido. Intentá de nuevo."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { id: "payment", label: "Pago" },
    { id: "delivery", label: "Entrega" },
    { id: "contact", label: "Datos" },
  ]

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              ¡Pedido creado con éxito!
            </h2>
            <p className="text-muted-foreground mb-6">
              Te notificaremos por mail cuando tu pedido esté listo. Si necesitamos
              coordinar algún detalle de entrega o pago, nos comunicaremos con vos.
            </p>
            <Link href="/">
              <Button className="w-full">Volver a la tienda</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-foreground mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === s.id || steps.findIndex((x) => x.id === step) > i
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {steps.findIndex((x) => x.id === step) > i ? (
                  <Check className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "ml-2 text-sm hidden sm:inline",
                  step === s.id ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className="w-12 sm:w-24 h-px bg-border mx-4" />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle>Método de pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    <label
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                        paymentMethod === "efectivo"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="efectivo" />
                      <Banknote className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Efectivo</p>
                        <p className="text-sm text-muted-foreground">
                          Pagas al momento de la entrega
                        </p>
                      </div>
                    </label>
                    <label
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                        paymentMethod === "transferencia"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="transferencia" />
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">
                          Transferencia bancaria
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Te enviamos los datos por WhatsApp
                        </p>
                      </div>
                    </label>
                  </RadioGroup>
                  <Button onClick={handleNext} className="w-full mt-6">
                    Continuar
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === "delivery" && (
              <Card>
                <CardHeader>
                  <CardTitle>Método de entrega</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={setDeliveryMethod}
                    className="space-y-3"
                  >
                    <label
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                        deliveryMethod === "retiro"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="retiro" />
                      <Store className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">
                          Retiro en local
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Coordinamos día y hora por WhatsApp
                        </p>
                      </div>
                    </label>
                    <label
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                        deliveryMethod === "envio"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="envio" />
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">
                          Coordinar envío
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Coordinamos el envío y costo por WhatsApp
                        </p>
                      </div>
                    </label>
                  </RadioGroup>
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setStep("payment")}
                      className="flex-1"
                    >
                      Atrás
                    </Button>
                    <Button onClick={handleNext} className="flex-1">
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "contact" && (
              <Card>
                <CardHeader>
                  <CardTitle>Tus datos</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+598 99 123 456"
                        required
                      />
                    </div>
                    {deliveryMethod === "envio" && (
                      <div className="space-y-2">
                        <Label htmlFor="address">Dirección de envío *</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                          }
                          placeholder="Calle, número, esquina, barrio, ciudad"
                          required
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas adicionales</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="Alguna aclaración sobre tu pedido (opcional)"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep("delivery")}
                        className="flex-1"
                      >
                        Atrás
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Enviando..." : "Enviar pedido"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        x{item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      ${item.price * item.quantity}
                    </p>
                  </div>
                ))}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
