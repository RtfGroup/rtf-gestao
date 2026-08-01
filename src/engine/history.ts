import { supabase } from '../lib/supabase'
import type { EventoEngine } from './types'

export async function registrarHistorico(
  evento: EventoEngine,
  descricao: string,
  modulo: string,
) {
  await supabase.from('historico_eventos').insert({
    empresa_id: evento.empresaId,
    modulo,
    evento: evento.evento,
    referencia_id: evento.referenciaId,
    descricao,
    dados: evento.dados,
  })
}