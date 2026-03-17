import { redirect } from "next/navigation"

export default function PropertiesPage({ searchParams }: { searchParams: { city?: string } }) {
  if (searchParams.city) redirect(`/properties/${searchParams.city.toLowerCase()}`)
  redirect("/")
}
