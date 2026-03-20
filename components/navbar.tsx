"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, User, X, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/components/cart-provider"
import { CartSheet } from "@/components/cart-sheet"

interface NavbarProps {
  onSearch?: (query: string) => void
}

export function Navbar({ onSearch }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const { totalItems } = useCart()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            {/* Logo + Brand name */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="pequeños uy"
                  width={56}
                  height={56}
                  className="rounded-full"
                />
              </Link>
              <span className="hidden md:block text-base font-semibold text-foreground">
                Pequeños
              </span>
            </div>

            {/* Desktop search — centered */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 justify-center px-8">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    onSearch?.(e.target.value)
                  }}
                  className="pl-10 bg-card border-border"
                />
              </div>
            </form>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Search icon — mobile only */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              >
                {isMobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </Button>

              {/* Contact — desktop only */}
              <Link href="#contacto" className="hidden md:block">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>

              <Link href="/login">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile search bar */}
          {isMobileSearchOpen && (
            <div className="md:hidden py-3 border-t border-border">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    autoFocus
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      onSearch?.(e.target.value)
                    }}
                    className="pl-10 bg-card"
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      </nav>

      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  )
}
