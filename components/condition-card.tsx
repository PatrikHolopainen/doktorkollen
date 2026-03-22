import Link from 'next/link'
import { ArrowRight, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Condition } from '@/lib/types'

interface ConditionCardProps {
  condition: Condition
}

export function ConditionCard({ condition }: ConditionCardProps) {
  return (
    <Link href={`/tillstand/${condition.slug}`} className="group block">
      <Card className="h-full hover:shadow-md transition-shadow duration-200 border-border group-hover:border-brand/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-health-light">
              <Activity className="h-5 w-5 text-health" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors">
                {condition.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {condition.description}
              </p>
            </div>
          </div>

          {condition.symptoms.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground font-medium mb-1">Vanliga symptom:</p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {condition.symptoms.slice(0, 3).join(', ')}
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center text-sm text-brand font-medium">
            <span>Läs mer</span>
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-150" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
