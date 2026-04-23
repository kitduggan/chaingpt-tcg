export type Rarity = 'Common' | 'Rare' | 'Mythic'
export type ProductTag = 'AI' | 'Pad' | 'Labs' | 'AIVM' | 'Audit' | 'NFT' | 'Hub'

export interface Card {
  id: number
  name: string
  product: ProductTag
  rarity: Rarity
  description: string
  image?: string
  color?: string
  isProduct?: boolean  // true = AI tool card (max 1 per pack)
  owned?: boolean
}

export const RARITY_COLORS: Record<Rarity, string> = {
  Common:   '#00f5ff',
  Rare: '#ff00ff',
  Mythic:   '#f59e0b',
}

export const RARITY_GRADIENT: Record<Rarity, string> = {
  Common:   'from-[#0d1a2a] to-[#0a0a0f]',
  Rare: 'from-[#1a0a1a] to-[#0a0a0f]',
  Mythic:   'from-[#1a1000] to-[#0a0a0f]',
}

export const RARITY_GLOW: Record<Rarity, string> = {
  Common:   'shadow-[0_0_12px_#00f5ff]',
  Rare: 'shadow-[0_0_20px_#ff00ff]',
  Mythic:   'shadow-[0_0_32px_#f59e0b]',
}

// ── Character Commons (cyan border, Mr. Robotson variants) ──────────────────
const CHARACTER_COMMONS: Card[] = [
  { id: 1,  name: 'Mr. Robotson (AI Maximalist)',    product: 'AI',  rarity: 'Common', description: 'The ultimate AI optimist.',          image: '/card-01-robotson-ai-max.png',      color: '#00f5ff' },
  { id: 2,  name: 'Mr. Robotson (Glow in the Dark)', product: 'AI',  rarity: 'Common', description: 'Lights up the blockchain.',          image: '/card-02-robotson-glow.png',        color: '#00f5ff' },
  { id: 3,  name: 'Mr. Robotson (Floating Pool Toy)',product: 'AI',  rarity: 'Common', description: 'Even robots need a vacation.',       image: '/card-03-robotson-pool.png',        color: '#00f5ff' },
  { id: 4,  name: 'Mr. Robotson (Startup Incubator)',product: 'Labs',rarity: 'Common', description: 'Hatching the next big thing.',       image: '/card-04-robotson-incubator.png',   color: '#00f5ff' },
  { id: 5,  name: 'Mr. Robotson (Launchpad Master)', product: 'Pad', rarity: 'Common', description: 'Mastering every IDO launch.',        image: '/card-05-robotson-launchpad.png',   color: '#00f5ff' },
]

// ── Product Commons (cyan border, AI Hub tools — max 1 per pack) ─────────────
const PRODUCT_COMMONS: Card[] = [
  { id: 6,  name: 'AI Smart Contract Generator', product: 'Hub', rarity: 'Common', description: 'Generates contracts via AI.',         image: '/card-06-smart-contract-gen.png',   color: '#00f5ff', isProduct: true },
  { id: 7,  name: 'AI Smart Contract Auditor',   product: 'Hub', rarity: 'Common', description: 'Audits code in seconds.',             image: '/card-07-smart-contract-audit.png', color: '#00f5ff', isProduct: true },
  { id: 8,  name: 'Cross-Chain Swap',            product: 'Hub', rarity: 'Common', description: 'Bridge any token, any chain.',        image: '/card-08-cross-chain-swap.png',     color: '#00f5ff', isProduct: true },
  { id: 9,  name: 'AI Trading Assistant',        product: 'Hub', rarity: 'Common', description: 'Reads markets, trades smarter.',      image: '/card-09-ai-trading.png',           color: '#00f5ff', isProduct: true },
  { id: 10, name: 'Web3 AI Chatbot',             product: 'Hub', rarity: 'Common', description: 'Answers every on-chain question.',    image: '/card-10-web3-chatbot.png',         color: '#00f5ff', isProduct: true },
  { id: 11, name: 'Crypto Compliance Assistant', product: 'Hub', rarity: 'Common', description: 'Keeps you on the right side of law.', image: '/card-11-crypto-compliance.png',    color: '#00f5ff', isProduct: true },
  { id: 12, name: 'AI Crypto Alerts',            product: 'Hub', rarity: 'Common', description: 'Never miss a market signal.',         image: '/card-12-crypto-alerts.png',        color: '#00f5ff', isProduct: true },
  { id: 13, name: 'AI Crypto News',              product: 'Hub', rarity: 'Common', description: 'Breaking news, AI-summarised.',       image: '/card-13-crypto-news.png',          color: '#00f5ff', isProduct: true },
  { id: 14, name: 'AI Forsight',                 product: 'Hub', rarity: 'Common', description: 'Predicts on-chain trends.',           image: '/card-14-ai-forsight.png',          color: '#00f5ff', isProduct: true },
  { id: 15, name: 'AI NFT Generator',            product: 'NFT', rarity: 'Common', description: 'Mint generative NFTs instantly.',     image: '/card-15-nft-generator.png',        color: '#00f5ff', isProduct: true },
]

// ── Rares (pink border, team members) ────────────────────────────────────
const RARES: Card[] = [
  { id: 16, name: 'Ilan',    product: 'AI',   rarity: 'Rare', description: 'Founder, ChainGPT.',        image: '/card-16-ilan.png',    color: '#ff00ff' },
  { id: 17, name: 'Gintare', product: 'Pad',  rarity: 'Rare', description: 'CEO, ChainGPT Pad.',        image: '/card-17-gintare.png', color: '#ff00ff' },
  { id: 18, name: 'Jay',     product: 'AIVM', rarity: 'Rare', description: 'CMO, AIVM.',                image: '/card-18-jay.png',     color: '#ff00ff' },
  { id: 19, name: 'Ariel',   product: 'AI',   rarity: 'Rare', description: 'COO, ChainGPT.',            image: '/card-19-ariel.png',   color: '#ff00ff' },
]

// ── Mythic (gold border) ─────────────────────────────────────────────────────
const MYTHICS: Card[] = [
  { id: 20, name: 'Golden Mr. Robotson', product: 'AI', rarity: 'Mythic', description: 'Mythic Rare. One of the rarest cards in existence.', image: '/card-20-golden-robotson.png', color: '#f59e0b' },
]

export const ALL_CARDS: Card[] = [
  ...CHARACTER_COMMONS,
  ...PRODUCT_COMMONS,
  ...RARES,
  ...MYTHICS,
]

// ── Pack logic ───────────────────────────────────────────────────────────────

export interface PackResult {
  cards: Card[]
  isGodPack: boolean
}

// God Pack: all 4 rares + mythic in the center slot
function buildGodPack(): Card[] {
  const shuffled = [...RARES].sort(() => Math.random() - 0.5)
  // [rare, rare, MYTHIC, rare, rare]
  return [shuffled[0], shuffled[1], MYTHICS[0], shuffled[2], shuffled[3]]
}

// Rules:
//   • 3% chance of God Pack (5 cards: 4 rares + mythic)
//   • Otherwise 3 cards per pack
//   • Max 1 product card (isProduct) per pack
//   • Rarity odds per slot: Mythic 5%, Rare 18%, Common 77%
//   • Result shuffled so rare position isn't predictable
export function getRandomPack(): PackResult {
  // 3% chance: God Pack
  if (Math.random() < 0.03) {
    return { cards: buildGodPack(), isGodPack: true }
  }

  const usedIds = new Set<number>()

  const pick = (pool: Card[]) => {
    const available = pool.filter(c => !usedIds.has(c.id))
    if (!available.length) return null
    const card = available[Math.floor(Math.random() * available.length)]
    usedIds.add(card.id)
    return card
  }

  const pack: Card[] = []
  let hasProduct  = false
  let hasMythic   = false
  let hasRare = false

  for (let i = 0; i < 3; i++) {
    const roll = Math.random()
    let card: Card | null = null

    if (!hasMythic && roll < 0.05) {
      card = pick(MYTHICS)
      if (card) hasMythic = true
    } else if (!hasRare && roll < 0.23) {
      card = pick(RARES)
      if (card) hasRare = true
    } else if (!hasProduct && roll < 0.55) {
      card = pick(PRODUCT_COMMONS)
      if (card) hasProduct = true
    }

    if (!card) card = pick(CHARACTER_COMMONS)
    if (card) pack.push(card)
  }

  const hasBothRareAndMythic = pack.some(c => c.rarity === 'Rare') && pack.some(c => c.rarity === 'Mythic')

  if (hasBothRareAndMythic) {
    const rank = (c: Card) => c.rarity === 'Rare' ? 0 : c.rarity === 'Mythic' ? 2 : 1
    pack.sort((a, b) => rank(a) - rank(b))
  } else {
    const rank = (c: Card) => c.rarity === 'Mythic' ? 2 : c.rarity === 'Rare' ? 2 : 0
    pack.sort((a, b) => rank(a) - rank(b))
  }

  return { cards: pack, isGodPack: false }
}
