# Módulo de Vendas

## Objetivo

Controlar todas as vendas realizadas pela empresa.

A venda representa apenas a negociação comercial, não o recebimento do dinheiro.

---

## Fluxo

Cliente

↓

Nova Venda

↓

Adicionar Produtos

↓

Calcular Totais

↓

Confirmar Venda

↓

Registrar Movimentações de Estoque

↓

Gerar Conta a Receber (quando necessário)

↓

Receber Pagamento

↓

Registrar Movimentação Financeira

↓

Fluxo de Caixa

---

## Status

RASCUNHO

CONFIRMADA

CANCELADA

---

## Regras

Uma venda em rascunho não altera estoque.

Uma venda em rascunho não gera financeiro.

Somente vendas confirmadas movimentam estoque.

O recebimento pode ser à vista ou parcelado.

O cancelamento deve estornar todas as movimentações de estoque e financeiras.

---

## Funcionalidades Futuras

Orçamento

Pedido de venda

Cupom fiscal

Nota Fiscal Eletrônica (NF-e)

Leitor de código de barras

Descontos por item

Descontos gerais

Programa de fidelidade

Integração com delivery

Múltiplas formas de pagamento

Histórico completo de vendas por cliente