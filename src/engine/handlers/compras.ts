import type { EventoEngine } from '../types'
import { registrarHistorico } from '../history'

export async function compraCriada(
  evento: EventoEngine,
) {
  await registrarHistorico(
    evento,
    'Compra criada.',
    'COMPRAS',
  )

  console.log(
    '[RTF ENGINE] Processando compra...',
    evento.dados,
  )
}