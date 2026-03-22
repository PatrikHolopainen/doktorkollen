import Link from 'next/link'
import { MapPin, Phone, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Clinic } from '@/lib/types'

interface ClinicCardProps {
  clinic: Clinic
}

export function ClinicCard({ clinic }: ClinicCardProps) {
  return (
    <Link href={`/klinik/${clinic.slug}`} className="group block">
      <Card className="h-full hover:shadow-md transition-shadow duration-200 border-border group-hover:border-brand/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light">
              <span className="text-brand font-bold text-sm">
                {clinic.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors">
                {clinic.name}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  {clinic.address}, {clinic.city}
                </span>
              </div>
              {clinic.phone && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">{clinic.phone}</span>
                </div>
              )}
            </div>
          </div>

          {clinic.services.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {clinic.services.slice(0, 3).map((service) => (
                <Badge key={service} variant="muted" className="text-xs">
                  {service}
                </Badge>
              ))}
              {clinic.services.length > 3 && (
                <Badge variant="muted" className="text-xs">
                  +{clinic.services.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center text-sm text-brand font-medium">
            <span>Visa klinik</span>
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-150" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
