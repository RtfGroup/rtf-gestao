import { supabase } from '../lib/supabase'
import type { EventoEngine } from './types'

export type TipoNotificacao =
  | 'INFO'
  | 'SUCESSO'
  | 'ALERTA'
  | 'ERRO'

interface CriarNotificacaoDTO {
  evento: EventoEngine
  titulo: string
  mensagem: string
  tipo?: TipoNotificacao
  modulo?: string
  referenciaId?: string
}

export async function criarNotificacao({
  evento,
  titulo,
  mensagem,
  tipo = 'INFO',
  modulo = 'ENGINE',
  referenciaId,
}: CriarNotificacaoDTO) {
  const { error } = await supabase
    .from('notificacoes')
    .insert({
      empresa_id: evento.empresaId,
      titulo,
      mensagem,
      tipo,
      modulo,
      referencia_id:
        referenciaId ?? evento.referenciaId ?? null,
      lida: false,
    })

  if (error) {
    throw error
  }
}