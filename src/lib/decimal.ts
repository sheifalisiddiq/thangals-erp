// Decimal-safe primitives: all money/weight/rate arithmetic in the app goes through these.
// Money and weight are stored as integers so float rounding error never accumulates across postings.

export type Money = number // integer minor units (e.g. AED fils: 1 AED = 100)
export type WeightMg = number // integer milligrams
export type BasisPoints = number // integer, 10000 = 100.00%

export function toMoney(displayAmount: number): Money {
  return Math.round(displayAmount * 100)
}

export function fromMoney(m: Money): number {
  return m / 100
}

export function addMoney(...vals: Money[]): Money {
  return vals.reduce((sum, v) => sum + v, 0)
}

export function subMoney(a: Money, b: Money): Money {
  return a - b
}

export function sumMoney(vals: Money[]): Money {
  return vals.reduce((sum, v) => sum + v, 0)
}

export function mulMoneyByBp(m: Money, bp: BasisPoints): Money {
  return Math.round((m * bp) / 10000)
}

export function isNonNegative(m: Money): boolean {
  return m >= 0
}

export function toGrams(mg: WeightMg): number {
  return mg / 1000
}

export function fromGrams(g: number): WeightMg {
  return Math.round(g * 1000)
}

export function sumWeight(vals: WeightMg[]): WeightMg {
  return vals.reduce((sum, v) => sum + v, 0)
}
