import { services } from './mock-data'
import { loadConditions } from './conditions-loader'
import { loadProfessionals } from './professionals-loader'
import { loadClinics, loadCities } from './clinics-loader'
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
  return loadConditions()
}

export async function getConditionBySlug(slug: string): Promise<Condition | undefined> {
  return loadConditions().find((c) => c.slug === slug)
}

// Professionals
export async function getAllProfessionals(): Promise<Professional[]> {
  return loadProfessionals()
}

export async function getProfessionalBySlug(slug: string): Promise<Professional | undefined> {
  return loadProfessionals().find((p) => p.slug === slug)
}

export async function getProfessionalsByCity(citySlug: string): Promise<Professional[]> {
  return loadProfessionals().filter((p) => p.citySlug === citySlug)
}

export async function getProfessionalsByService(serviceSlug: string): Promise<Professional[]> {
  const service = services.find((s) => s.slug === serviceSlug)
  if (!service) return []
  return loadProfessionals().filter((p) => p.serviceIds.includes(service.id))
}

export async function getProfessionalsByCondition(conditionSlug: string): Promise<Professional[]> {
  const condition = loadConditions().find((c) => c.slug === conditionSlug)
  if (!condition) return []
  // Match by specialty overlap if available, otherwise fall back to conditionIds
  if (condition.specialties && condition.specialties.length > 0) {
    const condSpecialties = condition.specialties.map((s) => s.toLowerCase())
    return loadProfessionals().filter((p) =>
      p.specialties.some((s) => condSpecialties.includes(s.toLowerCase()))
    )
  }
  if (!condition.id) return []
  return loadProfessionals().filter((p) => p.conditionIds.includes(condition.id!))
}

export async function getProfessionalsByCityAndService(
  citySlug: string,
  serviceSlug: string
): Promise<Professional[]> {
  const service = services.find((s) => s.slug === serviceSlug)
  if (!service) return []
  return loadProfessionals().filter(
    (p) => p.citySlug === citySlug && p.serviceIds.includes(service.id)
  )
}

export async function getProfessionalsByCityAndCondition(
  citySlug: string,
  conditionSlug: string
): Promise<Professional[]> {
  const condition = loadConditions().find((c) => c.slug === conditionSlug)
  if (!condition) return []
  if (condition.specialties && condition.specialties.length > 0) {
    const condSpecialties = condition.specialties.map((s) => s.toLowerCase())
    return loadProfessionals().filter(
      (p) =>
        p.citySlug === citySlug &&
        p.specialties.some((s) => condSpecialties.includes(s.toLowerCase()))
    )
  }
  if (!condition.id) return []
  return loadProfessionals().filter(
    (p) => p.citySlug === citySlug && p.conditionIds.includes(condition.id!)
  )
}

// Clinics
export async function getAllClinics(): Promise<Clinic[]> {
  return loadClinics()
}

export async function getClinicBySlug(slug: string): Promise<Clinic | undefined> {
  return loadClinics().find((c) => c.slug === slug)
}

export async function getClinicsByCity(citySlug: string): Promise<Clinic[]> {
  return loadClinics().filter((c) => c.citySlug === citySlug)
}

// Cities
export async function getAllCities(): Promise<City[]> {
  return loadCities()
}

export async function getCityBySlug(slug: string): Promise<City | undefined> {
  return loadCities().find((c) => c.slug === slug)
}

// Helpers
export async function getRelatedProfessionals(
  professional: Professional,
  limit = 3
): Promise<Professional[]> {
  return loadProfessionals()
    .filter(
      (p) =>
        p.id !== professional.id &&
        (p.citySlug === professional.citySlug ||
          p.specialties.some((s) => professional.specialties.includes(s)))
    )
    .slice(0, limit)
}

export async function getClinicsForProfessional(professional: Professional): Promise<Clinic[]> {
  return loadClinics().filter((c) => professional.clinicIds.includes(c.id))
}

export async function getProfessionalsForClinic(clinic: Clinic): Promise<Professional[]> {
  return loadProfessionals().filter((p) => clinic.professionalIds.includes(p.id))
}
