import { Construction } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PlaceholderPageProps {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-1 items-start justify-center pt-12">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="items-center gap-4">
          <Badge variant="warning" size="md">
            Em construção
          </Badge>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-50">
            <Construction className="h-7 w-7 text-yellow-600" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">{description}</p>
        </CardContent>
      </Card>
    </div>
  )
}
