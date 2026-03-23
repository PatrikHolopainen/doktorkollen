import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Professional } from '@/lib/types'

interface ProfessionalCardProps {
  professional: Professional
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  return (
    <Link href={`/vardgivare/${professional.slug}`} className="group block">
      <Card className="h-full hover:shadow-md transition-shadow duration-200 border-border group-hover:border-brand/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 shrink-0">
              <AvatarFallback className="text-base">
                {getInitials(professional.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors truncate">
                {professional.name}
              </h3>
              <p className="text-sm text-muted-foreground">{professional.title}</p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5 text-brand shrink-0" />
                <span className="text-xs text-muted-foreground">{professional.city}</span>
              </div>
            </div>
          </div>

          {professional.specialties.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {professional.specialties.slice(0, 3).map((spec) => (
                <Badge key={spec} variant="brand" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {professional.specialties.length > 3 && (
                <Badge variant="muted" className="text-xs">
                  +{professional.specialties.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center text-sm text-brand font-medium">
            <span>Visa profil</span>
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-150" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
