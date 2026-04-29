import { createPublicClient, http } from 'viem'
import { bsc } from 'viem/chains'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract'
import { ALL_CARDS } from '@/lib/cards'

const client = createPublicClient({
  chain: bsc,
  transport: http(),
})

const BASE_URL = 'https://chaingpt-tcg.vercel.app'

export async function GET(
  _req: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const tokenId = BigInt(params.tokenId)

    // Look up which card type this token is
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

    return Response.json({
      name: card.name,
      description: card.description,
      image: `${BASE_URL}${card.image}`,
      attributes: [
        { trait_type: 'Rarity',   value: card.rarity  },
        { trait_type: 'Product',  value: card.product },
        { trait_type: 'Card Type', value: card.id     },
      ],
    })
  } catch {
    return Response.json({ error: 'Token not found' }, { status: 404 })
  }
}
