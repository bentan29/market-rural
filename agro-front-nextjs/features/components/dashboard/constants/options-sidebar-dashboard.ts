import { AccountSetting02Icon, DashboardSquare01Icon, FavouriteIcon,  PaymentSuccess01Icon,  SendIcon, TractorIcon } from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

export type NavItem = {
  title: string
  url: string
  icon?: IconSvgElement
  items?: {
    title: string
    url: string
  }[]
}

export const data: {
  userMenus: NavItem[]
  sellerMenus: NavItem[]
} = {


  userMenus: [
    {
      title: "Panel",
      url: "/dashboard",
      icon: DashboardSquare01Icon,
    },
    {
      title: "Cuenta",
      url: "/cuenta",
      icon: AccountSetting02Icon,
      items: [
        { title: "Configuración", url: "/cuenta/configuracion" },
        { title: "Cambiar contraseña", url: "/cuenta/cambiar-contrasena" },
        { title: "Quiero publicar", url: "/publicar" },
      ],
    },
    {
      title: "Mis favoritos",
      url: "/dashboard/favoritos",
      icon: FavouriteIcon,
    },
  ],

  sellerMenus: [
    {
      title: "Mensajes",
      url: "/dashboard/",
      icon: SendIcon,
    },
    {
      title: "Publicaciones",
      url: "/dashboard/publicaciones",
      icon: TractorIcon,
    },
    {
      title: "Suscripción",
      url: "/dashboard/suscripcion",
      icon: PaymentSuccess01Icon,
    },
  ],
}