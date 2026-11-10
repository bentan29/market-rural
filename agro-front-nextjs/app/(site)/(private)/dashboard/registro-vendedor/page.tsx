import { Suspense } from "react"
import { redirect } from "next/navigation"
import { SellerFormApp } from "@/features/components/dashboard/registro-vendedor/RegisterSellerForm-App"
import { requireUser } from "@/lib/auth/get-user"
import { getPreviousSeller } from "@/features/actions/private/seller/get-my-seller-profile.action"

async function SellerGate() {
  
  const user = await requireUser()

  //- Quien ya es vendedor no necesita el formulario
  if (user.role === "SELLER") redirect("/dashboard/publicaciones/crear")
  if (user.role !== "USER") redirect("/dashboard")

  //- Si ya fue vendedor y se dio de baja, precargamos sus datos anteriores
  const previous = await getPreviousSeller()

  return (
    <SellerFormApp
      defaultValues={
        previous
          ? {
              displayName: previous.displayName,
              about: previous.about ?? "",
              phone: previous.phone,
              whatsapp: previous.whatsapp ?? "",
              website: previous.website ?? "",
              country: previous.country,
              location: previous.location,
            }
          : { displayName: user.fullName ?? "" }
      }
      reactivation={previous ? { listingsCount: previous.listingsCount } : undefined}
    />
  )
}

export default function RegistroVendedorPage() {
  return (
    <div className="mx-auto w-full max-w-xl rounded-xl bg-teal-950 p-4 md:p-6">
      <Suspense fallback={<div className="h-128 rounded-xl border border-white/15 bg-white/5" />}>
        <SellerGate />
      </Suspense>
    </div>
  )
}