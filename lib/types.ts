export interface Service {
  id: string
  slug: string
  name: string
  description: string
  longDescription: string
  icon: string
  specialties: string[]
}

export interface Condition {
  id: string
  slug: string
  name: string
  description: string
  symptoms: string[]
  treatments: string[]
  whenToVisit: string
  faq: { question: string; answer: string }[]
  relatedServices: string[]
}

export interface Professional {
  id: string
  slug: string
  name: string
  title: string
  specialties: string[]
  clinicIds: string[]
  citySlug: string
  city: string
  introduction: string
  bookingUrl: string
  lat: number
  lng: number
  imageUrl?: string
  conditionIds: string[]
  serviceIds: string[]
}

export interface Clinic {
  id: string
  slug: string
  name: string
  address: string
  city: string
  citySlug: string
  phone: string
  email: string
  website: string
  bookingUrl: string
  lat: number
  lng: number
  professionalIds: string[]
  services: string[]
  description: string
}

export interface City {
  slug: string
  name: string
  lat: number
  lng: number
}
