import { bsc } from 'wagmi/chains'

export const CONTRACT_ADDRESS = '0xF6543F78DdaC7847C8d98AD9c6Eb1CBbD55002d6' as `0x${string}`

export const CONTRACT_CHAIN = bsc

export const CONTRACT_ABI = [
  {
    name: 'mintCard',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'cardTypeId', type: 'uint8' }],
    outputs: [],
  },
  {
    name: 'mintCards',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'cardTypeIds', type: 'uint8[]' }],
    outputs: [],
  },
  {
    name: 'getOwnedCardTypes',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'addr', type: 'address' }],
    outputs: [{ name: '', type: 'uint8[]' }],
  },
  {
    name: 'CardMinted',
    type: 'event',
    inputs: [
      { name: 'player',     type: 'address', indexed: true  },
      { name: 'tokenId',    type: 'uint256', indexed: false },
      { name: 'cardTypeId', type: 'uint8',   indexed: false },
    ],
  },
] as const
