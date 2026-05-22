// Edge Function — `criar-sala-daily` (Fase 2, §6.F4)
// Provisiona uma sala no Daily.co para um agendamento e salva a URL no banco.
// Emite log estruturado JSON e registra evento em `eventos_sistema` (§9.3).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { comLog, log, obterRequestId } from '../_shared/log.ts'

const FN_NOME = 'criar-sala-daily'

interface Payload {
  agendamento_id: string
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const requestId = obterRequestId(req)
  const authHeader = req.headers.get('Authorization')

  if (!authHeader) {
    log({ fn: FN_NOME, severidade: 'aviso', status: 'erro', request_id: requestId, payload: { motivo: 'sem_auth' } })
    return jsonErro(401, 'unauthorized')
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const dailyKey = Deno.env.get('DAILY_API_KEY')
  // Cliente em nome do usuário (respeita RLS) — para validar acesso.
  const sbUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })
  // Cliente service role — para atualizar daily_room_url e registrar evento.
  const sbAdmin = createClient(supabaseUrl, serviceRoleKey)

  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return jsonErro(400, 'invalid_body')
  }

  if (!body.agendamento_id) return jsonErro(400, 'agendamento_id required')

  return comLog(
    { fn: FN_NOME, request_id: requestId, entidade: 'agendamento', entidade_id: body.agendamento_id },
    async () => {
      // 1. Verifica que o usuário tem acesso ao agendamento (RLS).
      const { data: ag, error: agErr } = await sbUser
        .from('agendamentos')
        .select('id, daily_room_url, fim, nutricionista_id, paciente_profile_id')
        .eq('id', body.agendamento_id)
        .maybeSingle()

      if (agErr || !ag) {
        await sbAdmin.rpc('registrar_evento', {
          p_tipo: 'sala_daily_acesso_negado',
          p_request_id: requestId,
          p_entidade: 'agendamento',
          p_entidade_id: body.agendamento_id,
          p_severidade: 'aviso',
        })
        return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 })
      }

      if (ag.daily_room_url) {
        return new Response(JSON.stringify({ url: ag.daily_room_url, reused: true }), {
          headers: { 'content-type': 'application/json' },
        })
      }

      // 2. Cria sala no Daily.co (se chave configurada).
      let roomUrl: string | null = null
      if (dailyKey) {
        const expiresEpoch = Math.floor(new Date(ag.fim).getTime() / 1000) + 60 * 30
        const resp = await fetch('https://api.daily.co/v1/rooms', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${dailyKey}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            privacy: 'public',
            properties: {
              exp: expiresEpoch,
              enable_chat: true,
              enable_screenshare: true,
            },
          }),
        })
        if (!resp.ok) {
          const txt = await resp.text()
          await sbAdmin.rpc('registrar_evento', {
            p_tipo: 'sala_daily_falha',
            p_request_id: requestId,
            p_entidade: 'agendamento',
            p_entidade_id: ag.id,
            p_payload: { http_status: resp.status, body: txt.slice(0, 500) },
            p_severidade: 'erro',
          })
          throw new Error(`daily_api_${resp.status}`)
        }
        const data = await resp.json()
        roomUrl = data.url as string
      } else {
        // Em dev sem chave configurada, usamos um placeholder identificável.
        roomUrl = `https://nutriplus-mvp.daily.co/sala-${ag.id.slice(0, 8)}`
      }

      // 3. Atualiza o agendamento com a URL.
      const { error: updErr } = await sbAdmin
        .from('agendamentos')
        .update({ daily_room_url: roomUrl })
        .eq('id', ag.id)
      if (updErr) throw updErr

      await sbAdmin.rpc('registrar_evento', {
        p_tipo: 'sala_daily_criada',
        p_request_id: requestId,
        p_entidade: 'agendamento',
        p_entidade_id: ag.id,
        p_payload: { mock: !dailyKey },
      })

      return new Response(JSON.stringify({ url: roomUrl }), {
        headers: { 'content-type': 'application/json' },
      })
    },
  )
})

function jsonErro(status: number, msg: string): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}
