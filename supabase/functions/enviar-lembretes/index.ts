// Edge Function — `enviar-lembretes` (Fase 4, §6.F10)
// Varre agendamentos confirmados, envia lembretes 24h e 1h antes
// (no MVP, "envio" significa marcar `enviado_em` e logar a tentativa;
// quando integrarmos um provider — Resend, SendGrid — basta plugar aqui).
//
// Cada execução grava um registro em `execucoes_jobs` (§9.2) para que
// uma falha do cron seja detectável, não silenciosa.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { log, obterRequestId } from '../_shared/log.ts'

const FN_NOME = 'enviar-lembretes'
const JOB_NOME = 'enviar_lembretes'

Deno.serve(async (req: Request) => {
  const requestId = obterRequestId(req)
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const sb = createClient(supabaseUrl, serviceRoleKey)

  const t0 = performance.now()
  let processados = 0
  let falhas = 0

  // Marca início do job
  const { data: jobRow } = await sb
    .from('execucoes_jobs')
    .insert({ job_nome: JOB_NOME, status: 'ok' })
    .select('id')
    .single()

  try {
    // Agendamentos confirmados nas próximas 25h.
    const agora = new Date()
    const limite = new Date(agora.getTime() + 25 * 60 * 60 * 1000)

    const { data: agendamentos, error } = await sb
      .from('agendamentos')
      .select('id, inicio, fim, paciente_profile_id, nutricionista_id')
      .eq('status', 'confirmado')
      .gte('inicio', agora.toISOString())
      .lte('inicio', limite.toISOString())

    if (error) throw error

    for (const a of agendamentos ?? []) {
      const minsAteConsulta = (new Date(a.inicio).getTime() - agora.getTime()) / 60000

      // Decide qual tipo de lembrete cabe agora.
      const tipos: Array<'24h' | '1h'> = []
      if (minsAteConsulta <= 24 * 60 && minsAteConsulta >= 23 * 60) tipos.push('24h')
      if (minsAteConsulta <= 60 && minsAteConsulta >= 0) tipos.push('1h')

      for (const tipo of tipos) {
        // Já existe e foi enviado?
        const { data: existente } = await sb
          .from('lembretes')
          .select('id, enviado_em')
          .eq('agendamento_id', a.id)
          .eq('tipo', tipo)
          .maybeSingle()

        if (existente?.enviado_em) continue

        try {
          // TODO: integrar provider de e-mail (Resend / SES) quando configurado.
          // Por ora, "envio" é apenas marcar enviado_em e logar.
          const lembreteId =
            existente?.id ??
            (
              await sb
                .from('lembretes')
                .insert({ agendamento_id: a.id, tipo, canal: 'email' })
                .select('id')
                .single()
            ).data?.id

          if (!lembreteId) throw new Error('lembrete_id ausente')

          await sb.from('lembretes').update({ enviado_em: new Date().toISOString() }).eq('id', lembreteId)

          await sb.rpc('registrar_evento', {
            p_tipo: 'lembrete_enviado',
            p_request_id: requestId,
            p_entidade: 'agendamento',
            p_entidade_id: a.id,
            p_payload: { tipo },
          })
          processados++
        } catch (err) {
          falhas++
          await sb.rpc('registrar_evento', {
            p_tipo: 'lembrete_falhou',
            p_request_id: requestId,
            p_entidade: 'agendamento',
            p_entidade_id: a.id,
            p_payload: { tipo, mensagem: (err as Error).message },
            p_severidade: 'erro',
          })
        }
      }
    }

    await sb
      .from('execucoes_jobs')
      .update({
        finalizado_em: new Date().toISOString(),
        itens_processados: processados,
        itens_falha: falhas,
        status: falhas === 0 ? 'ok' : 'parcial',
      })
      .eq('id', jobRow!.id)

    log({
      fn: FN_NOME,
      request_id: requestId,
      duracao_ms: Math.round(performance.now() - t0),
      status: falhas === 0 ? 'ok' : 'parcial',
      payload: { processados, falhas },
    })

    return new Response(JSON.stringify({ processados, falhas }), {
      headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    await sb
      .from('execucoes_jobs')
      .update({
        finalizado_em: new Date().toISOString(),
        status: 'erro',
        detalhe: { mensagem: (err as Error).message },
      })
      .eq('id', jobRow!.id)

    log({
      fn: FN_NOME,
      request_id: requestId,
      severidade: 'erro',
      status: 'erro',
      duracao_ms: Math.round(performance.now() - t0),
      payload: { mensagem: (err as Error).message },
    })

    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
})
