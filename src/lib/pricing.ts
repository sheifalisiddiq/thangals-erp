// Pure pricing calculations for Retail Sales — no UI, no store access. new-sale.tsx calls these
// on every line/overall edit to recompute totals; ledger.ts's confirmSale trusts the already-
// computed Money fields stored on the SalesInvoice/SalesInvoiceLine it's given.

import { addMoney, mulMoneyByBp, subMoney, sumMoney, toGrams, type BasisPoints, type Money } from './decimal'
import type { InventoryItem } from './domain-types'
import type { TaxConfig } from './settings'

export interface PricedLine {
  metalValueMoney: Money
  makingChargeMoney: Money
  stoneChargeMoney: Money
  discountMoney: Money
  lineTotalMoney: Money
}

export function priceLine(input: {
  item: InventoryItem
  ratePerGramMoney: Money
  makingChargeBp?: BasisPoints
  stoneChargeMoney?: Money
  discountMoney?: Money
}): PricedLine {
  const makingChargeBp = input.makingChargeBp ?? input.item.makingChargeBp
  const stoneChargeMoney = input.stoneChargeMoney ?? 0
  const discountMoney = input.discountMoney ?? 0

  const metalValueMoney: Money = Math.round(input.ratePerGramMoney * toGrams(input.item.netWeightMg))
  const makingChargeMoney: Money = mulMoneyByBp(metalValueMoney, makingChargeBp)
  const lineTotalMoney = subMoney(addMoney(metalValueMoney, makingChargeMoney, stoneChargeMoney), discountMoney)

  return { metalValueMoney, makingChargeMoney, stoneChargeMoney, discountMoney, lineTotalMoney }
}

export interface PricedInvoice {
  subtotalMoney: Money
  taxMoney: Money
  totalMoney: Money
}

export function priceInvoice(lines: { lineTotalMoney: Money }[], taxConfig: TaxConfig): PricedInvoice {
  const subtotalMoney = sumMoney(lines.map((l) => l.lineTotalMoney))

  if (!taxConfig.enabled) {
    return { subtotalMoney, taxMoney: 0, totalMoney: subtotalMoney }
  }

  if (taxConfig.inclusive) {
    const taxMoney = subtotalMoney - Math.round((subtotalMoney * 10000) / (10000 + taxConfig.rateBp))
    return { subtotalMoney, taxMoney, totalMoney: subtotalMoney }
  }

  const taxMoney = mulMoneyByBp(subtotalMoney, taxConfig.rateBp)
  return { subtotalMoney, taxMoney, totalMoney: addMoney(subtotalMoney, taxMoney) }
}
