# Módulo Financeiro

## Objetivo

Controlar toda entrada e saída financeira da empresa.

O fluxo de caixa representa somente dinheiro efetivamente recebido ou pago.

---

## Motor Oficial

registrar_movimentacao_financeira()

---

## Fluxo de Entrada

Venda

↓

Conta a Receber (quando necessário)

↓

Recebimento

↓

Fluxo de Caixa

---

## Fluxo de Saída

Compra

↓

Conta a Pagar

↓

Pagamento

↓

Fluxo de Caixa

---

## Tipos

ENTRADA

SAÍDA

TRANSFERÊNCIA

ESTORNO

AJUSTE

---

## Origens

VENDA

COMPRA

DESPESA

RECEITA

TRANSFERÊNCIA

PRODUÇÃO

---

## Regras

Compra não movimenta caixa.

Venda não movimenta caixa.

Somente pagamentos e recebimentos alteram o fluxo de caixa.

Todo lançamento financeiro deve possuir:

- Empresa
- Origem
- Referência
- Valor
- Data
- Usuário
- Observação

Todo lançamento deve ser auditável.

---

## Objetivo

Todo dinheiro que entrar ou sair da empresa deverá passar obrigatoriamente pelo Motor Financeiro.