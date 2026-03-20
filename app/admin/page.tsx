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
import { initialProducts, Settings as SettingsType, defaultSettings } from "@/lib/store"
import { ImageUpload } from "@/components/image-upload"
import { getImageUrl } from "@/lib/api"
import { toast } from "sonner"

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, logout } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<SettingsType>(defaultSettings)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    image: "/products/placeholder.jpg",
    enabled: true,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
      return
    }

    if (isAuthenticated) {
      // Load products from localStorage or use initial
      const storedProducts = localStorage.getItem("admin_products")
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts))
      } else {
        setProducts(initialProducts)
        localStorage.setItem("admin_products", JSON.stringify(initialProducts))
      }

      // Load settings
      const storedSettings = localStorage.getItem("admin_settings")
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings))
      }
    }
  }, [isAuthenticated, isLoading, router])

  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts)
    localStorage.setItem("admin_products", JSON.stringify(updatedProducts))
  }

  const handleToggleEnabled = (productId: string) => {
    const updated = products.map((p) =>
      p.id === productId ? { ...p, enabled: !p.enabled } : p
    )
    saveProducts(updated)
    toast.success("Producto actualizado")
  }

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId)
    saveProducts(updated)
    setDeleteProductId(null)
    toast.success("Producto eliminado")
  }

  const handleSaveEdit = () => {
    if (!editingProduct) return
    const updated = products.map((p) =>
      p.id === editingProduct.id ? editingProduct : p
    )
    saveProducts(updated)
    setEditingProduct(null)
    toast.success("Producto actualizado")
  }

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.description || !newProduct.price) {
      toast.error("Completa todos los campos")
      return
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      image: newProduct.image || "/products/placeholder.jpg",
      enabled: true,
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
  }

  const handleSaveSettings = () => {
    localStorage.setItem("admin_settings", JSON.stringify(settings))
    toast.success("Configuración guardada")
  }

  const handleLogout = () => {
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Número de WhatsApp</Label>
                  <Input
                    id="phone"
                    value={settings.phoneNumber}
                    onChange={(e) =>
                      setSettings({ ...settings, phoneNumber: e.target.value })
                    }
                    placeholder="+598 99 123 456"
                  />
                  <p className="text-sm text-muted-foreground">
                    Los pedidos se enviarán a este número
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) =>
                      setSettings({ ...settings, apiKey: e.target.value })
                    }
                    placeholder="Tu API Key"
                  />
                  <p className="text-sm text-muted-foreground">
                    Para integraciones futuras
                  </p>
                </div>
                <Button onClick={handleSaveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar configuración
                </Button>
              </CardContent>
            </Card>
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
            <Button onClick={handleSaveEdit}>Guardar cambios</Button>
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
            <Button onClick={handleAddProduct}>Agregar producto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
