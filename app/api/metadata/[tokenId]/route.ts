import { createPublicClient, http, fallback } from 'viem'
import { bsc } from 'viem/chains'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract'
import { ALL_CARDS } from '@/lib/cards'

// Public BSC RPC endpoints — Ankr now requires an API key so we use Binance nodes + fallbacks
const client = createPublicClient({
  chain: bsc,
  transport: fallback([
    http('https://bsc-dataseed.binance.org/',  { timeout: 8_000 }),
    http('https://bsc-dataseed1.binance.org/', { timeout: 8_000 }),
    http('https://bsc-dataseed2.binance.org/', { timeout: 8_000 }),
    http('https://bsc.publicnode.com',         { timeout: 8_000 }),
  ]),
})

const BASE_URL = 'https://chaingpt-tcg.vercel.app'

// Vercel max function duration
export const maxDuration = 15

export async function GET(
  _req: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const tokenId = BigInt(params.tokenId)

    const cardTypeId = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'cardTypeOf',
      args: [tokenId],
    })

    const card = ALL_CARDS.find(c => c.id === Number(cardTypeId))

    if (!card) {
      return Response.json({ error: 'Card not found' }, { status: 404 })
    }

    return Response.json(
      {
        name: card.name,
        description: card.description,
        image: `${BASE_URL}${card.image}`,
        attributes: [
          { trait_type: 'Rarity',    value: card.rarity  },
          { trait_type: 'Product',   value: card.product },
          { trait_type: 'Card Type', value: card.id      },
        ],
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600',
        },
      }
    )
  } catch (err) {
    console.error('Metadata fetch error:', err)
    return Response.json({ error: 'Token not found' }, { status: 404 })
  }
}
