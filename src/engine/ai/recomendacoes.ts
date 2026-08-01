import { supabase } from '../../lib/supabase'

export interface Recomendacao {
  titulo: string
  descricao: string
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA'
}

export async function gerarRecomendacoes(
  empresaId: string,
): Promise<Recomendacao[]> {
  const recomendacoes: Recomendacao[] = []

  const { data: estoque } = await supabase
    .from('estoque')
    .select(`
      quantidade_atual,
      produtos (
        nome,
        estoque_minimo
      )
    `)
    .eq('empresa_id', empresaId)

  const produtosCriticos =
    (estoque ?? []).filter((item: any) => {
      const produto = Array.isArray(item.produtos)
        ? item.produtos[0]
        : item.produtos

      return (
        Number(item.quantidade_atual ?? 0) <=
        Number(produto?.estoque_minimo ?? 0)
      )
    })

  if (produtosCriticos.length > 0) {
    recomendacoes.push({
      titulo: 'Repor estoque',
      descricao:
        'Existem produtos abaixo do estoque mínimo. Faça uma compra o quanto antes.',
      prioridade: 'ALTA',
    })
  }

  const { data: contas } = await supabase
    .from('contas_receber')
    .select('saldo_pendente,status')
    .eq('empresa_id', empresaId)
    .neq('status', 'RECEBIDO')

  const totalReceber = (contas ?? []).reduce(
    (total, conta) =>
      total + Number(conta.saldo_pendente ?? 0),
    0,
  )

  if (totalReceber > 1000) {
    recomendacoes.push({
      titulo: 'Cobrar clientes',
      descricao: `Você possui ${new Intl.NumberFormat(
        'pt-BR',
        {
          style: 'currency',
          currency: 'BRL',
        },
      ).format(totalReceber)} em aberto.`,
      prioridade: 'MEDIA',
    })
  }

  return recomendacoes
}