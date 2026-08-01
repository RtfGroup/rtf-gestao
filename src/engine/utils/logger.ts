import type { EventoEngine } from '../types'

export function logEvento(evento: EventoEngine) {
  console.log(
    `[RTF ENGINE] ${evento.evento}`,
    {
      empresa: evento.empresaId,
      origem: evento.origem,
      referencia: evento.referenciaId,
      dados: evento.dados,
    },
  )
}