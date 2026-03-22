import Link from 'next/link'
import {
  Brain,
  Activity,
  Heart,
  Scan,
  Bone,
  Users,
  Zap,
  Stethoscope,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Service } from '@/lib/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  Activity,
  Heart,
  Scan,
  Bone,
  Users,
  Zap,
  Stethoscope,
}

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = iconMap[service.icon] ?? Stethoscope

  return (
    <Link href={`/tjanst/${service.slug}`} className="group block">
      <Card className="h-full hover:shadow-md transition-shadow duration-200 border-border group-hover:border-brand/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light group-hover:bg-brand group-hover:text-white transition-colors duration-200">
              <Icon className="h-6 w-6 text-brand group-hover:text-white transition-colors duration-200" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors">
                {service.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {service.description}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center text-sm text-brand font-medium">
            <span>Läs mer</span>
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-150" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
