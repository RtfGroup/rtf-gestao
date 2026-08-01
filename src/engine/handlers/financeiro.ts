import type { EventoEngine } from '../types'
import { registrarHistorico } from '../history'
import {
  obterResumoContasReceber,
} from '../../services/financeiro/financeiro.service'

export async function atualizarFinanceiro(
  evento: EventoEngine,
) {
  const resumo = await obterResumoContasReceber()

  await registrarHistorico(
    evento,
    `Financeiro atualizado. Contas: ${resumo.quantidade}. A receber: R$ ${resumo.totalReceber.toFixed(
      2,
    )}`,
    'FINANCEIRO',
  )

  console.log(
    '[RTF ENGINE] Financeiro atualizado',
    resumo,
  )
}