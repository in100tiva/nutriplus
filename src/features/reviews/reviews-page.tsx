import { useState, useMemo } from 'react'
import {
  MessageSquare,
  Send,
  Star,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  Select,
  Textarea,
  StarRating,
  EmptyState,
} from '@/components/ui'
import { formatDate, formatRating } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Review {
  id: string
  patientName: string
  patientAvatarUrl: string | null
  rating: number
  comment: string
  date: string
  reply: string | null
  repliedAt: string | null
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_REVIEWS: Review[] = [
  {
    id: 'rv1',
    patientName: 'Ana Carolina Silva',
    patientAvatarUrl: null,
    rating: 5,
    comment: 'Profissional excelente! Muito atencioso e detalhista. O plano alimentar que recebi foi perfeito para minhas necessidades. Já estou vendo resultados em poucas semanas.',
    date: '2026-02-22',
    reply: 'Muito obrigado pelo feedback, Ana! Fico feliz que esteja satisfeita com os resultados. Continue firme no plano!',
    repliedAt: '2026-02-22',
  },
  {
    id: 'rv2',
    patientName: 'Bruno Oliveira Santos',
    patientAvatarUrl: null,
    rating: 5,
    comment: 'Atendimento muito humanizado. Senti que realmente se importou com a minha saúde e não apenas com números. Recomendo demais!',
    date: '2026-02-20',
    reply: null,
    repliedAt: null,
  },
  {
    id: 'rv3',
    patientName: 'Carla Mendes Ferreira',
    patientAvatarUrl: null,
    rating: 4,
    comment: 'Ótima consulta! Explicou tudo com muita clareza. Só achei o tempo de espera um pouco longo, mas o atendimento em si foi excelente.',
    date: '2026-02-18',
    reply: 'Obrigado pelo retorno, Carla! Vou trabalhar para melhorar o tempo de espera. Fico feliz que tenha gostado da consulta.',
    repliedAt: '2026-02-19',
  },
  {
    id: 'rv4',
    patientName: 'Fernanda Rodrigues Lima',
    patientAvatarUrl: null,
    rating: 5,
    comment: 'Melhor profissional de nutrição que já consultei. A abordagem é muito moderna e baseada em evidências científicas. Super recomendo!',
    date: '2026-02-15',
    reply: 'Fernanda, agradeço muito suas palavras! Busco sempre me atualizar para oferecer o melhor atendimento. Até a próxima consulta!',
    repliedAt: '2026-02-16',
  },
  {
    id: 'rv5',
    patientName: 'Gabriel Pereira Souza',
    patientAvatarUrl: null,
    rating: 4,
    comment: 'Consulta muito produtiva. O plano alimentar foi bem personalizado. Gostaria de ter mais opções de horários disponíveis.',
    date: '2026-02-12',
    reply: null,
    repliedAt: null,
  },
  {
    id: 'rv6',
    patientName: 'Igor Martins Barbosa',
    patientAvatarUrl: null,
    rating: 5,
    comment: 'Desde que comecei o acompanhamento, minha relação com a comida mudou completamente. Perdi peso de forma saudável e me sinto muito melhor.',
    date: '2026-02-08',
    reply: 'Igor, que alegria ler isso! A mudança de mentalidade é o mais importante. Continue assim!',
    repliedAt: '2026-02-09',
  },
  {
    id: 'rv7',
    patientName: 'Juliana Araujo Campos',
    patientAvatarUrl: null,
    rating: 3,
    comment: 'Bom atendimento, mas senti falta de um acompanhamento mais próximo entre as consultas. O plano alimentar em si foi bom.',
    date: '2026-02-05',
    reply: 'Juliana, agradeço o feedback sincero! Vou implementar check-ins semanais para melhorar o acompanhamento. Obrigado pela sugestão.',
    repliedAt: '2026-02-06',
  },
  {
    id: 'rv8',
    patientName: 'Lucas Nascimento Dias',
    patientAvatarUrl: null,
    rating: 5,
    comment: 'Atendimento nota 10! Muito paciente para explicar cada detalhe do plano. A plataforma online também é muito prática.',
    date: '2026-02-01',
    reply: null,
    repliedAt: null,
  },
  {
    id: 'rv9',
    patientName: 'Mariana Teixeira Gomes',
    patientAvatarUrl: null,
    rating: 4,
    comment: 'Gostei muito da consulta. Abordagem diferenciada e focada nas minhas necessidades reais.',
    date: '2026-01-28',
    reply: 'Obrigado, Mariana! Cada paciente é único e merece um plano personalizado. Até breve!',
    repliedAt: '2026-01-29',
  },
  {
    id: 'rv10',
    patientName: 'Pedro Henrique Cardoso',
    patientAvatarUrl: null,
    rating: 5,
    comment: 'Profissional extremamente competente. Os resultados dos meus exames melhoraram significativamente após seguir as orientações.',
    date: '2026-01-20',
    reply: 'Pedro, fico muito feliz com a melhora nos exames! É gratificante ver a evolução dos pacientes. Vamos manter esse ritmo!',
    repliedAt: '2026-01-21',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReviewsPage() {
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const filtered = useMemo(() => {
    if (ratingFilter === 'all') return MOCK_REVIEWS
    return MOCK_REVIEWS.filter((r) => r.rating === parseInt(ratingFilter))
  }, [ratingFilter])

  // Statistics
  const totalReviews = MOCK_REVIEWS.length
  const averageRating = MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / totalReviews
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: MOCK_REVIEWS.filter((r) => r.rating === rating).length,
    percentage: (MOCK_REVIEWS.filter((r) => r.rating === rating).length / totalReviews) * 100,
  }))

  const handleReply = (reviewId: string) => {
    console.log(`Reply to review ${reviewId}: ${replyText}`)
    setReplyingTo(null)
    setReplyText('')
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Avaliações</h1>
        <p className="mt-1 text-sm text-gray-500">
          Veja as avaliações dos seus pacientes e responda aos feedbacks.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Average Rating Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avaliação Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">{formatRating(averageRating)}</p>
                <StarRating value={averageRating} readOnly size="md" className="mt-1" />
                <p className="text-sm text-gray-500 mt-1">{totalReviews} avaliações</p>
              </div>
              <div className="flex-1 border-l border-gray-200 pl-4">
                {ratingCounts.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-2 py-0.5">
                    <span className="text-xs text-gray-500 w-3">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 shrink-0" />
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{totalReviews}</p>
                <p className="text-xs text-green-600">Total de avaliações</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {MOCK_REVIEWS.filter((r) => r.reply).length}
                </p>
                <p className="text-xs text-blue-600">Respostas enviadas</p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {MOCK_REVIEWS.filter((r) => !r.reply).length}
                </p>
                <p className="text-xs text-yellow-600">Aguardando resposta</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {MOCK_REVIEWS.filter((r) => r.rating === 5).length}
                </p>
                <p className="text-xs text-purple-600">Nota máxima</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <div className="flex items-end gap-3">
          <Select
            label="Filtrar por nota"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            wrapperClassName="min-w-[180px]"
          >
            <option value="all">Todas as notas</option>
            <option value="5">5 estrelas</option>
            <option value="4">4 estrelas</option>
            <option value="3">3 estrelas</option>
            <option value="2">2 estrelas</option>
            <option value="1">1 estrela</option>
          </Select>
          <p className="text-sm text-gray-500 pb-2">
            {filtered.length} avaliação{filtered.length !== 1 ? 'ões' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </Card>

      {/* Reviews List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-6 w-6" />}
          title="Nenhuma avaliação encontrada"
          description="Não há avaliações com essa nota."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <div className="p-4">
                {/* Review Header */}
                <div className="flex items-start gap-3">
                  <Avatar name={review.patientName} src={review.patientAvatarUrl} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.patientName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRating value={review.rating} readOnly size="sm" />
                          <span className="text-xs text-gray-500">{formatDate(review.date)}</span>
                        </div>
                      </div>
                      {!review.reply && (
                        <Badge variant="warning" size="sm">Aguardando resposta</Badge>
                      )}
                    </div>

                    {/* Review Comment */}
                    <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                  </div>
                </div>

                {/* Professional Reply */}
                {review.reply && (
                  <div className="mt-4 ml-12 rounded-lg bg-blue-50 p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="info" size="sm">Sua resposta</Badge>
                      {review.repliedAt && (
                        <span className="text-xs text-blue-500">
                          {formatDate(review.repliedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-blue-800">{review.reply}</p>
                  </div>
                )}

                {/* Reply Form */}
                {!review.reply && replyingTo !== review.id && (
                  <div className="mt-3 ml-12">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(review.id)
                        setReplyText('')
                      }}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Responder
                    </Button>
                  </div>
                )}

                {replyingTo === review.id && (
                  <div className="mt-3 ml-12 flex flex-col gap-2">
                    <Textarea
                      placeholder="Escreva sua resposta..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyText('')
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReply(review.id)}
                        disabled={!replyText.trim()}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Enviar Resposta
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
