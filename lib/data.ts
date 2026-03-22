import {
  services,
  conditions,
  professionals,
  clinics,
  cities,
} from './mock-data'
import type { Service, Condition, Professional, Clinic, City } from './types'

// Services
export async function getAllServices(): Promise<Service[]> {
  return services
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  return services.find((s) => s.slug === slug)
}

// Conditions
export async function getAllConditions(): Promise<Condition[]> {
  return conditions
}

export async function getConditionBySlug(slug: string): Promise<Condition | undefined> {
  return conditions.find((c) => c.slug === slug)
}

// Professionals
export async function getAllProfessionals(): Promise<Professional[]> {
  return professionals
}

export async function getProfessionalBySlug(slug: string): Promise<Professional | undefined> {
  return professionals.find((p) => p.slug === slug)
}

export async function getProfessionalsByCity(citySlug: string): Promise<Professional[]> {
  return professionals.filter((p) => p.citySlug === citySlug)
}

export async function getProfessionalsByService(serviceSlug: string): Promise<Professional[]> {
  const service = services.find((s) => s.slug === serviceSlug)
  if (!service) return []
  return professionals.filter((p) => p.serviceIds.includes(service.id))
}

export async function getProfessionalsByCondition(conditionSlug: string): Promise<Professional[]> {
  const condition = conditions.find((c) => c.slug === conditionSlug)
  if (!condition) return []
  return professionals.filter((p) => p.conditionIds.includes(condition.id))
}

export async function getProfessionalsByCityAndService(
  citySlug: string,
  serviceSlug: string
): Promise<Professional[]> {
  const service = services.find((s) => s.slug === serviceSlug)
  if (!service) return []
  return professionals.filter(
    (p) => p.citySlug === citySlug && p.serviceIds.includes(service.id)
  )
}

export async function getProfessionalsByCityAndCondition(
  citySlug: string,
  conditionSlug: string
): Promise<Professional[]> {
  const condition = conditions.find((c) => c.slug === conditionSlug)
  if (!condition) return []
  return professionals.filter(
    (p) => p.citySlug === citySlug && p.conditionIds.includes(condition.id)
  )
}

// Clinics
export async function getAllClinics(): Promise<Clinic[]> {
  return clinics
}

export async function getClinicBySlug(slug: string): Promise<Clinic | undefined> {
  return clinics.find((c) => c.slug === slug)
}

export async function getClinicsByCity(citySlug: string): Promise<Clinic[]> {
  return clinics.filter((c) => c.citySlug === citySlug)
}

// Cities
export async function getAllCities(): Promise<City[]> {
  return cities
}

export async function getCityBySlug(slug: string): Promise<City | undefined> {
  return cities.find((c) => c.slug === slug)
}

// Helpers
export async function getRelatedProfessionals(
  professional: Professional,
  limit = 3
): Promise<Professional[]> {
  return professionals
    .filter(
      (p) =>
        p.id !== professional.id &&
        (p.citySlug === professional.citySlug ||
          p.specialties.some((s) => professional.specialties.includes(s)))
    )
    .slice(0, limit)
}

export async function getClinicsForProfessional(professional: Professional): Promise<Clinic[]> {
  return clinics.filter((c) => professional.clinicIds.includes(c.id))
}

export async function getProfessionalsForClinic(clinic: Clinic): Promise<Professional[]> {
  return professionals.filter((p) => clinic.professionalIds.includes(p.id))
}
