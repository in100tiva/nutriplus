import { Catalogo } from '@/features/marketplace/catalogo'

/**
 * Página dentro do shell do paciente para iniciar uma nova consulta.
 * Mesmo catálogo da rota pública, mas dentro do dashboard.
 */
export function PacienteMarcarPage() {
  return (
    <div className="fade-up" data-screen-label="paciente-marcar">
      <div className="page-head">
        <div>
          <div className="eyebrow">Marcar nova consulta</div>
          <h1>Escolha um nutricionista</h1>
          <p className="sub">
            Você verá os horários disponíveis na página do profissional. A consulta nasce
            confirmada — sem etapa de pagamento no MVP.
          </p>
        </div>
      </div>
      <Catalogo />
    </div>
  )
}
