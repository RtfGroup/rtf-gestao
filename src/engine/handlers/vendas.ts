import type { EventoEngine } from '../types'
import { registrarHistorico } from '../history'

export async function vendaCriada(
  evento: EventoEngine,
) {
  await registrarHistorico(
    evento,
    'Venda criada.',
    'VENDAS',
  )

  console.log(
    '[RTF ENGINE] Processando venda...',
    evento.dados,
  )
}