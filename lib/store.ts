import { Product } from "@/components/cart-provider"

// Productos para fiestas infantiles
export const initialProducts: Product[] = [
  {
    id: "1",
    name: "Bolsita Frozen",
    description: "Bolsa de sorpresitas con diseño de Elsa y Anna, incluye stickers y dulces",
    price: 150,
    image: "/products/frozen.jpg",
    enabled: true,
  },
  {
    id: "2",
    name: "Bolsita Mickey Mouse",
    description: "Sorpresitas temáticas de Mickey con juguetes y golosinas",
    price: 150,
    image: "/products/mickey.jpg",
    enabled: true,
  },
  {
    id: "3",
    name: "Kit Patrulla Canina",
    description: "Set completo de sorpresitas con personajes de Paw Patrol",
    price: 180,
    image: "/products/paw-patrol.jpg",
    enabled: true,
  },
  {
    id: "4",
    name: "Bolsita Princesas",
    description: "Bolsa mágica con sorpresas de las princesas Disney",
    price: 160,
    image: "/products/princesas.jpg",
    enabled: true,
  },
  {
    id: "5",
    name: "Kit Superhéroes",
    description: "Sorpresitas de Spiderman, Batman y más superhéroes",
    price: 170,
    image: "/products/superheroes.jpg",
    enabled: true,
  },
  {
    id: "6",
    name: "Bolsita Unicornio",
    description: "Bolsa con temática de unicornios, brillos y magia",
    price: 140,
    image: "/products/unicornio.jpg",
    enabled: true,
  },
]

export interface Settings {
  phoneNumber: string
  apiKey: string
}

export const defaultSettings: Settings = {
  phoneNumber: "",
  apiKey: "",
}
