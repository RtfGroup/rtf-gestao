import type { Insight } from './insights'
import type { Recomendacao } from './recomendacoes'

export function gerarRelatorioExecutivo(
  insights: Insight[],
  recomendacoes: Recomendacao[],
) {
  let texto = ''

  texto += 'Bom dia!\n\n'

  if (insights.length > 0) {
    texto +=
      'Segue um resumo da situação da empresa hoje:\n\n'

    insights.forEach((item) => {
      texto += `• ${item.descricao}\n`
    })
  }

  if (recomendacoes.length > 0) {
    texto +=
      '\nCom base nesses dados, a RTF AI recomenda:\n\n'

    recomendacoes.forEach((item) => {
      texto += `• ${item.descricao}\n`
    })
  }

  texto +=
    '\nContinue acompanhando o painel para manter a empresa saudável financeiramente.'

  return texto
}