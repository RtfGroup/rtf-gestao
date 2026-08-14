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

  const produtosNormais = (data ?? []).filter(
  (item) =>
    Number(item.quantidade_atual ?? 0) >
    Number(item.estoque_minimo ?? 0),
)

for (const item of produtosNormais) {
  const produto = Array.isArray(item.produtos)
    ? item.produtos[0]
    : item.produtos

  const nomeProduto =
    produto?.nome ?? 'Produto não identificado'

  const tituloNotificacao =
    `Estoque baixo — ${nomeProduto}`

  await supabase
    .from('notificacoes')
    .update({
      lida: true,
      lida_em: new Date().toISOString(),
    })
    .eq('empresa_id', evento.empresaId)
    .eq('titulo', tituloNotificacao)
    .eq('lida', false)
}

  if (produtosBaixos.length === 0) {
    return
  }

  await registrarHistorico(
    evento,
    `${produtosBaixos.length} produto(s) com estoque baixo.`,
    'ESTOQUE',
  )

  for (const item of produtosBaixos) {
  const produto = Array.isArray(item.produtos)
    ? item.produtos[0]
    : item.produtos

  const nomeProduto =
    produto?.nome ?? 'Produto não identificado'

  const quantidadeAtual = Number(
    item.quantidade_atual ?? 0,
  )

  const estoqueMinimo = Number(
    item.estoque_minimo ?? 0,
  )

  const faltam = Math.max(
    estoqueMinimo - quantidadeAtual,
    0,
  )

  const tituloNotificacao =
  `Estoque baixo — ${nomeProduto}`

const { data: notificacaoExistente } =
  await supabase
    .from('notificacoes')
    .select('id')
    .eq('empresa_id', evento.empresaId)
    .eq('titulo', tituloNotificacao)
    .eq('lida', false)
    .limit(1)

if (
  notificacaoExistente &&
  notificacaoExistente.length > 0
) {
  continue
}

  await criarNotificacao({
    evento,
    titulo: tituloNotificacao,
    mensagem:
      `${nomeProduto} está com ${quantidadeAtual} unidade(s). ` +
      `Mínimo: ${estoqueMinimo}. ` +
      `Reposição sugerida: ${faltam} unidade(s).`,
    tipo: 'ALERTA',
    modulo: 'ESTOQUE',
  })
}

  console.log(
    '[RTF ENGINE] Estoque baixo:',
    produtosBaixos,
  )
}