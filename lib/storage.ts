// localStorage helpers for earned-but-not-yet-minted cards.
// Keyed by wallet address so each user has their own pile.

const key = (address: string) => `chaingpt-tcg-earned-${address.toLowerCase()}`

export function getEarnedCards(address: string): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key(address))
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

export function addEarnedCards(address: string, cardIds: number[]): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getEarnedCards(address)
    localStorage.setItem(key(address), JSON.stringify([...existing, ...cardIds]))
  } catch { /* ignore */ }
}

export function removeEarnedCard(address: string, cardTypeId: number): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getEarnedCards(address)
    const idx = existing.indexOf(cardTypeId)
    if (idx !== -1) {
      existing.splice(idx, 1)
      localStorage.setItem(key(address), JSON.stringify(existing))
    }
  } catch { /* ignore */ }
}

export function removeEarnedCards(address: string, cardTypeIds: number[]): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getEarnedCards(address)
    for (const id of cardTypeIds) {
      const idx = existing.indexOf(id)
      if (idx !== -1) existing.splice(idx, 1)
    }
    localStorage.setItem(key(address), JSON.stringify(existing))
  } catch { /* ignore */ }
}
