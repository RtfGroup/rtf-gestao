import { eventBus } from './eventBus'
import { logEvento } from './utils/logger'
import { registrarHistorico } from './history'
import type { EventoEngine } from './types'
import { vendaCriada } from './handlers/vendas'
import { compraCriada } from './handlers/compras'
import { verificarEstoque } from './handlers/estoque'
import { atualizarFinanceiro } from './handlers/financeiro'

export async function executarAutomacao(
  evento: EventoEngine,
) {
  logEvento(evento)

  await registrarHistorico(
    evento,
    `Evento ${evento.evento} executado.`,
    'ENGINE',
  )

  if (evento.evento === 'VENDA_CRIADA') {
    await vendaCriada(evento)
  }

  if (evento.evento === 'COMPRA_CRIADA') {
    await compraCriada(evento)
  }

  if (
    evento.evento === 'VENDA_CRIADA' ||
    evento.evento === 'COMPRA_CRIADA'
  ) {
    await verificarEstoque(evento)
  }

  if (
    evento.evento === 'VENDA_CRIADA' ||
    evento.evento === 'COMPRA_CRIADA' ||
    evento.evento === 'CONTA_RECEBIDA' ||
    evento.evento === 'CONTA_PAGA'
  ) {
    await atualizarFinanceiro(evento)
  }

  await eventBus.emit(evento)
}