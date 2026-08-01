import { criarNotificacao } from '../notifications'
import { supabase } from '../../lib/supabase'
import type { EventoEngine } from '../types'
import { registrarHistorico } from '../history'

export async function verificarEstoque(
  evento: EventoEngine,
) {
  const { data, error } = await supabase
    .from('estoque')
    .select(`
      produto_id,
      quantidade_atual,
      estoque_minimo,
      produtos (
        nome
      )
    `)
    .eq('empresa_id', evento.empresaId)

  if (error) {
    throw error
  }
console.log('ESTOQUE:', data)
  const produtosBaixos = (data ?? []).filter(
    (item) =>
      Number(item.quantidade_atual ?? 0) <=
      Number(item.estoque_minimo ?? 0),
  )

  if (produtosBaixos.length === 0) {
    return
  }

  await registrarHistorico(
    evento,
    `${produtosBaixos.length} produto(s) com estoque baixo.`,
    'ESTOQUE',
  )

  await criarNotificacao({
  evento,
  titulo: 'Estoque Baixo',
  mensagem: `${produtosBaixos.length} produto(s) estão abaixo do estoque mínimo.`,
  tipo: 'ALERTA',
  modulo: 'ESTOQUE',
})

  console.log(
    '[RTF ENGINE] Estoque baixo:',
    produtosBaixos,
  )
}