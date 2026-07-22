# Módulo de Estoque

## Objetivo

Controlar toda movimentação de produtos da empresa.

O estoque nunca poderá ser alterado diretamente.

Toda alteração deverá passar pelo motor oficial do ERP.

---

## Motor Oficial

registrar_movimentacao_estoque()

---

## Tipos de Movimentação

ENTRADA

SAÍDA

AJUSTE

INVENTÁRIO

PERDA

PRODUÇÃO

TRANSFERÊNCIA

ESTORNO

---

## Origens

COMPRA

VENDA

PRODUÇÃO

INVENTÁRIO

AJUSTE

DEVOLUÇÃO

XML

---

## Regras

Nenhuma tela altera a tabela estoque.

A tabela movimentacoes_estoque é a fonte oficial da informação.

A tabela estoque representa apenas o saldo consolidado.

Nunca permitir estoque negativo.

Toda movimentação deve registrar:

- Empresa
- Produto
- Tipo
- Origem
- Referência
- Quantidade
- Custo Unitário
- Saldo Anterior
- Saldo Posterior
- Data
- Observação

---

## Fluxo

Evento

↓

registrar_movimentacao_estoque()

↓

movimentacoes_estoque

↓

Atualização da tabela estoque

↓

Dashboard

---

## Objetivo

Garantir rastreabilidade completa de qualquer movimentação realizada no sistema.