"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Package,
  ArrowLeft,
  Save,
  ClipboardList,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Banknote,
  CreditCard,
  Store,
  Users,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/components/auth-provider"
import { Product } from "@/components/cart-provider"
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
import { ImageUpload } from "@/components/image-upload"
import api, { getImageUrl } from "@/lib/api"
import { toast } from "sonner"

type OrderStatus = "pending" | "confirmed" | "cancelled"

type OrderItem = {
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
}

type Order = {
  id: number
  customer_name: string
  customer_phone: string
  customer_email: string
  delivery_type: "pickup" | "delivery"
  address: string | null
  payment_method: "transfer" | "cash"
  status: OrderStatus
  total: number
  notes: string | null
  created_at: string
  items?: OrderItem[]
}

type AdminUser = {
  id: number
  name: string
  email: string
  is_principal: boolean
  created_at: string
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    pending:   { label: "Pendiente",  variant: "secondary" },
    confirmed: { label: "Listo",      variant: "default" },
    cancelled: { label: "Cancelado",  variant: "destructive" },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, logout } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    password: "",
    phone_whatsapp: "",
    callmebot_apikey: "",
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [isSavingProductEdit, setIsSavingProductEdit] = useState(false)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    image: "/products/placeholder.jpg",
    enabled: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [isLoadingMoreOrders, setIsLoadingMoreOrders] = useState(false)
  const [ordersOffset, setOrdersOffset] = useState(0)
  const [hasMoreOrders, setHasMoreOrders] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  const [pendingOrderAction, setPendingOrderAction] = useState<{ id: number; status: OrderStatus } | null>(null)

  const ORDERS_LIMIT = 15

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [isSubmittingUser, setIsSubmittingUser] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null)
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" })
  const [contactMessage, setContactMessage] = useState("")
  const [isSendingContact, setIsSendingContact] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
      return
    }

    if (isAuthenticated) {
      // Load products from API
      setIsLoadingProducts(true)
      api.get("/products.php").then(({ data }) => {
        setProducts((data as Record<string, unknown>[]).map(mapProduct))
      }).catch(() => {
        // fallback: empty list
      }).finally(() => {
        setIsLoadingProducts(false)
      })

      // Load orders (first page)
      setIsLoadingOrders(true)
      api.get(`/pedidos.php?limit=${ORDERS_LIMIT}&offset=0`).then(({ data }) => {
        const fetched = data as Order[]
        setOrders(fetched)
        setOrdersOffset(fetched.length)
        setHasMoreOrders(fetched.length === ORDERS_LIMIT)
      }).catch(() => {
        // silently ignore
      }).finally(() => {
        setIsLoadingOrders(false)
      })

      // Load admin users
      setIsLoadingUsers(true)
      api.get("/users.php").then(({ data }) => {
        setAdminUsers(data as AdminUser[])
      }).catch(() => {
        // silently ignore
      }).finally(() => {
        setIsLoadingUsers(false)
      })

      // Load user profile — from cache first, then fetch once
      const cachedProfile = localStorage.getItem("user_profile")
      if (cachedProfile) {
        setUserProfile({ ...JSON.parse(cachedProfile), password: "" })
      } else {
        setIsLoadingProfile(true)
        api.get("/user.php").then(({ data }) => {
          const profile = {
            name: data.name ?? "",
            email: data.email ?? "",
            phone_whatsapp: data.phone_whatsapp ?? "",
            callmebot_apikey: data.callmebot_apikey ?? "",
          }
          localStorage.setItem("user_profile", JSON.stringify(profile))
          setUserProfile({ ...profile, password: "" })
        }).catch(() => {
          // silently ignore, form stays empty
        }).finally(() => {
          setIsLoadingProfile(false)
        })
      }
    }
  }, [isAuthenticated, isLoading, router])

  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts)
  }

  const handleToggleEnabled = async (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    const newVisible = !product.enabled
    try {
      await api.patch(`/products.php?id=${productId}`, { visible: newVisible })
      const updated = products.map((p) =>
        p.id === productId ? { ...p, enabled: newVisible } : p
      )
      saveProducts(updated)
      toast.success("Producto actualizado")
    } catch {
      toast.error("Error al actualizar la visibilidad")
    }
  }

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId)
    saveProducts(updated)
    setDeleteProductId(null)
    toast.success("Producto eliminado")
  }

  // NUEVO (EDITA PRODUCTO)
  const handleSaveEdit = async () => {
    if (!editingProduct) return

    if (!editingProduct.name || !editingProduct.description || !editingProduct.price) {
      toast.error("Completa todos los campos")
      return
    }

    setIsSavingProductEdit(true)
    try {
      await api.patch(`/products.php?id=${editingProduct.id}`, {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        image_url: editingProduct.image,
        visible: editingProduct.enabled,
        available: editingProduct.enabled,
      })

      const updated = products.map((p) =>
        p.id === editingProduct.id ? editingProduct : p
      )
      saveProducts(updated)
      setEditingProduct(null)
      toast.success("Producto actualizado")
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Error al actualizar el producto"
      toast.error(message)
    } finally {
      setIsSavingProductEdit(false)
    }
  }

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.description || !newProduct.price) {
      toast.error("Completa todos los campos")
      return
    }

    setIsSubmitting(true)
    try {
      const { data } = await api.post("/products.php", {
        name: newProduct.name,
        price: newProduct.price,
        description: newProduct.description,
        image_url: newProduct.image || "/products/placeholder.jpg",
        available: true,
        visible: true,
      })

      const product: Product = {
        id: String(data.id),
        name: data.name,
        description: data.description ?? newProduct.description,
        price: data.price,
        image: data.image_url || newProduct.image || "/products/placeholder.jpg",
        enabled: data.available ?? true,
      }

      saveProducts([...products, product])
      setIsAddingProduct(false)
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        image: "/products/placeholder.jpg",
        enabled: true,
      })
      toast.success("Producto agregado")
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Error al agregar el producto"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveProfile = async () => {
    const body: Record<string, string> = {}
    if (userProfile.name) body.name = userProfile.name
    if (userProfile.email) body.email = userProfile.email
    if (userProfile.password) body.password = userProfile.password
    if (userProfile.phone_whatsapp) body.phone_whatsapp = userProfile.phone_whatsapp
    if (userProfile.callmebot_apikey) body.callmebot_apikey = userProfile.callmebot_apikey

    if (Object.keys(body).length === 0) {
      toast.error("Completá al menos un campo para editar")
      return
    }

    setIsSavingProfile(true)
    try {
      await api.patch("/user.php", body)
      toast.success("Perfil actualizado")
      const updated = {
        name: userProfile.name,
        email: userProfile.email,
        phone_whatsapp: userProfile.phone_whatsapp,
        callmebot_apikey: userProfile.callmebot_apikey,
        ...body,
      }
      localStorage.setItem("user_profile", JSON.stringify({ ...updated, password: undefined }))
      setUserProfile((prev) => ({ ...prev, password: "" }))
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Error al actualizar el perfil"
      toast.error(message)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSendContactMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const message = contactMessage.trim()
    if (!message) {
      toast.error("Escribí un mensaje para enviar")
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

  const confirmOrderAction = (orderId: number, status: OrderStatus) => {
    setPendingOrderAction({ id: orderId, status })
  }

  const handleUpdateOrderStatus = async () => {
    if (!pendingOrderAction) return
    const { id: orderId, status } = pendingOrderAction
    setPendingOrderAction(null)
    setUpdatingOrderId(orderId)
    try {
      await api.patch(`/pedidos.php?id=${orderId}`, { status })
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      )
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status } : prev)
      }
      toast.success(
        status === "confirmed" ? "Pedido confirmado" : "Pedido cancelado"
      )
    } catch {
      toast.error("Error al actualizar el pedido")
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Completá todos los campos")
      return
    }
    setIsSubmittingUser(true)
    try {
      const { data } = await api.post("/users.php", newUser)
      setAdminUsers((prev) => [...prev, data as AdminUser])
      setIsAddingUser(false)
      setNewUser({ name: "", email: "", password: "" })
      toast.success("Usuario creado")
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Error al crear el usuario"
      toast.error(message)
    } finally {
      setIsSubmittingUser(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteUserId) return
    try {
      await api.delete(`/users.php?id=${deleteUserId}`)
      setAdminUsers((prev) => prev.filter((u) => u.id !== deleteUserId))
      setDeleteUserId(null)
      toast.success("Usuario eliminado")
    } catch {
      toast.error("Error al eliminar el usuario")
    }
  }

  const handleSetPrincipal = async (userId: number) => {
    try {
      await api.patch(`/users.php?id=${userId}`, { is_principal: true })
      setAdminUsers((prev) =>
        prev.map((u) => ({ ...u, is_principal: u.id === userId }))
      )
      toast.success("Usuario principal actualizado")
    } catch {
      toast.error("Error al actualizar")
    }
  }

  const loadMoreOrders = async () => {
    setIsLoadingMoreOrders(true)
    try {
      const { data } = await api.get(`/pedidos.php?limit=${ORDERS_LIMIT}&offset=${ordersOffset}`)
      const fetched = data as Order[]
      setOrders((prev) => [...prev, ...fetched])
      setOrdersOffset((prev) => prev + fetched.length)
      setHasMoreOrders(fetched.length === ORDERS_LIMIT)
    } catch {
      toast.error("Error al cargar más pedidos")
    } finally {
      setIsLoadingMoreOrders(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user_profile")
    logout()
    router.replace("/")
  }

  // Show loading while checking auth
  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  // Don't render if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold text-foreground">
              Panel de Administración
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="products" className="gap-2 flex-1 sm:flex-none">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Productos</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 flex-1 sm:flex-none">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 flex-1 sm:flex-none">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 flex-1 sm:flex-none">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configuración</span>
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>Productos</CardTitle>
                <Button onClick={() => setIsAddingProduct(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="flex justify-center py-16">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : <>
                {/* Mobile Cards View */}
                <div className="block sm:hidden space-y-4">
                  {products.map((product) => (
                    <div 
                      key={product.id}
                      className="border border-border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
                          <Image
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-medium">${product.price}</span>
                            <Badge
                              variant={product.enabled ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {product.enabled ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleEnabled(product.id)}
                        >
                          {product.enabled ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => setDeleteProductId(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-16">Imagen</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Descripción
                        </TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                              <Image
                                src={getImageUrl(product.image)}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell className="hidden md:table-cell max-w-xs truncate text-muted-foreground">
                            {product.description}
                          </TableCell>
                          <TableCell>${product.price}</TableCell>
                          <TableCell>
                            <Badge
                              variant={product.enabled ? "default" : "secondary"}
                            >
                              {product.enabled ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleToggleEnabled(product.id)
                                }
                                title={
                                  product.enabled ? "Deshabilitar" : "Habilitar"
                                }
                              >
                                {product.enabled ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingProduct(product)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteProductId(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                </>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="flex justify-center py-16">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No hay pedidos aún</p>
                ) : (
                  <>
                    {/* Mobile Cards */}
                    <div className="block sm:hidden space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-foreground">{order.customer_name}</p>
                              <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString("es-UY")}</p>
                            </div>
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">${order.total}</span>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {order.status === "pending" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-600"
                                    disabled={updatingOrderId === order.id}
                                    onClick={() => confirmOrderAction(order.id, "confirmed")}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive"
                                    disabled={updatingOrderId === order.id}
                                    onClick={() => confirmOrderAction(order.id, "cancelled")}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden sm:block rounded-md border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>#</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Entrega</TableHead>
                            <TableHead>Pago</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="text-muted-foreground text-sm">#{order.id}</TableCell>
                              <TableCell>
                                <p className="font-medium">{order.customer_name}</p>
                                <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                              </TableCell>
                              <TableCell className="text-sm">
                                {order.delivery_type === "pickup" ? "Retiro" : "Envío"}
                              </TableCell>
                              <TableCell className="text-sm">
                                {order.payment_method === "cash" ? "Efectivo" : "Transferencia"}
                              </TableCell>
                              <TableCell className="font-medium">${order.total}</TableCell>
                              <TableCell>
                                <OrderStatusBadge status={order.status} />
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString("es-UY")}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Ver detalles"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {order.status === "pending" && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Marcar como listo"
                                        className="text-green-600 hover:text-green-600"
                                        disabled={updatingOrderId === order.id}
                                        onClick={() => confirmOrderAction(order.id, "confirmed")}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Cancelar pedido"
                                        className="text-destructive hover:text-destructive"
                                        disabled={updatingOrderId === order.id}
                                        onClick={() => confirmOrderAction(order.id, "cancelled")}
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
                {hasMoreOrders && (
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      onClick={loadMoreOrders}
                      disabled={isLoadingMoreOrders}
                    >
                      {isLoadingMoreOrders ? <Spinner className="h-4 w-4 mr-2" /> : null}
                      Cargar más
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>Usuarios</CardTitle>
                <Button onClick={() => setIsAddingUser(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex justify-center py-16">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : adminUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No hay usuarios</p>
                ) : (
                  <>
                    {/* Mobile Cards */}
                    <div className="block sm:hidden space-y-4">
                      {adminUsers.map((user) => (
                        <div key={user.id} className="border border-border rounded-lg p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground">{user.name}</p>
                                {user.is_principal && (
                                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="flex gap-1">
                              {!user.is_principal && (
                                <Button variant="ghost" size="sm" title="Marcar como principal" onClick={() => handleSetPrincipal(user.id)}>
                                  <Star className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteUserId(user.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden sm:block rounded-md border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adminUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell className="text-muted-foreground">{user.email}</TableCell>
                              <TableCell>
                                {user.is_principal ? (
                                  <Badge variant="default" className="gap-1">
                                    <Star className="h-3 w-3 fill-current" />
                                    Principal
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Admin</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                  {!user.is_principal && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Marcar como principal"
                                      onClick={() => handleSetPrincipal(user.id)}
                                    >
                                      <Star className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Eliminar"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => setDeleteUserId(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mi perfil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoadingProfile ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Spinner className="h-4 w-4" />
                      Cargando datos...
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Editá solo los campos que querés cambiar.
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="profile-name">Nombre</Label>
                          <Input
                            id="profile-name"
                            value={userProfile.name}
                            onChange={(e) =>
                              setUserProfile({ ...userProfile, name: e.target.value })
                            }
                            placeholder="Tu nombre"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profile-email">Email</Label>
                          <Input
                            id="profile-email"
                            type="email"
                            value={userProfile.email}
                            onChange={(e) =>
                              setUserProfile({ ...userProfile, email: e.target.value })
                            }
                            placeholder="tu@email.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profile-password">Nueva contraseña</Label>
                          <Input
                            id="profile-password"
                            type="password"
                            value={userProfile.password}
                            onChange={(e) =>
                              setUserProfile({ ...userProfile, password: e.target.value })
                            }
                            placeholder="Dejar vacío para no cambiar"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profile-phone">WhatsApp</Label>
                          <Input
                            id="profile-phone"
                            value={userProfile.phone_whatsapp}
                            onChange={(e) =>
                              setUserProfile({ ...userProfile, phone_whatsapp: e.target.value })
                            }
                            placeholder="+598 99 123 456"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="profile-apikey">CallMeBot API Key</Label>
                          <Input
                            id="profile-apikey"
                            type="password"
                            value={userProfile.callmebot_apikey}
                            onChange={(e) =>
                              setUserProfile({ ...userProfile, callmebot_apikey: e.target.value })
                            }
                            placeholder="Tu API Key de CallMeBot"
                          />
                        </div>
                      </div>
                      <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                        {isSavingProfile ? <Spinner className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Guardar cambios
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Enviar mensaje por WhatsApp</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Escribí el mensaje que querés enviar por WhatsApp.
                  </p>
                  <form onSubmit={handleSendContactMessage} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-message">Mensaje por WhatsApp</Label>
                      <Textarea
                        id="contact-message"
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Escribí acá el mensaje"
                        rows={5}
                      />
                    </div>
                    <Button type="submit" disabled={isSendingContact}>
                      {isSendingContact ? <Spinner className="h-4 w-4 mr-2" /> : <Phone className="h-4 w-4 mr-2" />}
                      Enviar por WhatsApp
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Product Dialog */}
      <Dialog
        open={!!editingProduct}
        onOpenChange={() => setEditingProduct(null)}
      >
        <DialogContent className="bg-card border-border max-w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
            <DialogDescription>
              Modifica los datos del producto
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Precio</Label>
                <Input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Imagen</Label>
                <ImageUpload
                  value={editingProduct.image}
                  onChange={(url) =>
                    setEditingProduct({ ...editingProduct, image: url })
                  }
                />
              </div>
            </div>
          )} 
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSavingProductEdit}>
              {isSavingProductEdit ? <Spinner className="h-4 w-4 mr-2" /> : null} { /* NEW  BUTTON  SAVE PRODUCT EDIT*/}
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
        <DialogContent className="bg-card border-border max-w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar producto</DialogTitle>
            <DialogDescription>
              Completa los datos del nuevo producto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                placeholder="Nombre del producto"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                placeholder="Descripción del producto"
              />
            </div>
            <div className="space-y-2">
              <Label>Precio</Label>
              <Input
                type="number"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: Number(e.target.value) })
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Imagen</Label>
              <ImageUpload
                value={newProduct.image ?? ""}
                onChange={(url) => setNewProduct({ ...newProduct, image: url })}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsAddingProduct(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddProduct} disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Agregar producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
        <DialogContent className="bg-card border-border max-w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar usuario</DialogTitle>
            <DialogDescription>
              El nuevo usuario tendrá acceso al panel de administración
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Contraseña inicial"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsAddingUser(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddUser} disabled={isSubmittingUser}>
              {isSubmittingUser ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Crear usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent className="bg-card border-border max-w-[calc(100%-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteUser}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-card border-border max-w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pedido #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              {selectedOrder && new Date(selectedOrder.created_at).toLocaleString("es-UY")}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estado</span>
                <OrderStatusBadge status={selectedOrder.status} />
              </div>

              <div className="space-y-2">
                <p className="font-medium text-foreground">Cliente</p>
                <div className="space-y-1 text-muted-foreground">
                  <p>{selectedOrder.customer_name}</p>
                  {selectedOrder.customer_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      {selectedOrder.customer_email}
                    </div>
                  )}
                  {selectedOrder.customer_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      {selectedOrder.customer_phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-medium text-foreground">Entrega</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {selectedOrder.delivery_type === "pickup" ? (
                    <><Store className="h-3.5 w-3.5" /> Retiro en local</>
                  ) : (
                    <><MapPin className="h-3.5 w-3.5" /> Envío — {selectedOrder.address}</>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-medium text-foreground">Pago</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {selectedOrder.payment_method === "cash" ? (
                    <><Banknote className="h-3.5 w-3.5" /> Efectivo</>
                  ) : (
                    <><CreditCard className="h-3.5 w-3.5" /> Transferencia</>
                  )}
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Productos</p>
                  <div className="space-y-1">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-muted-foreground">
                        <span>{item.product_name} x{item.quantity}</span>
                        <span>${item.unit_price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between font-semibold border-t border-border pt-3">
                <span>Total</span>
                <span>${selectedOrder.total}</span>
              </div>

              {selectedOrder.notes && (
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Notas</p>
                  <p className="text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}

              {selectedOrder.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive border-destructive/50 hover:bg-destructive/10"
                    disabled={updatingOrderId === selectedOrder.id}
                    onClick={() => confirmOrderAction(selectedOrder.id, "cancelled")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={updatingOrderId === selectedOrder.id}
                    onClick={() => confirmOrderAction(selectedOrder.id, "confirmed")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar listo
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Action Confirmation */}
      <AlertDialog
        open={!!pendingOrderAction}
        onOpenChange={() => setPendingOrderAction(null)}
      >
        <AlertDialogContent className="bg-card border-border max-w-[calc(100%-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingOrderAction?.status === "confirmed"
                ? "¿Confirmar pedido?"
                : "¿Cancelar pedido?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingOrderAction?.status === "confirmed"
                ? "El pedido pasará a estado confirmado y se notificará al cliente."
                : "Esta acción no se puede deshacer. El pedido será marcado como cancelado."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              className={
                pendingOrderAction?.status === "confirmed"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
              onClick={handleUpdateOrderStatus}
            >
              {pendingOrderAction?.status === "confirmed" ? "Confirmar pedido" : "Cancelar pedido"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteProductId}
        onOpenChange={() => setDeleteProductId(null)}
      >
        <AlertDialogContent className="bg-card border-border max-w-[calc(100%-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteProductId && handleDeleteProduct(deleteProductId)
              }
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
