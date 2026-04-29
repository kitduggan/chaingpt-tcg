import { bsc } from 'wagmi/chains'

export const CONTRACT_ADDRESS = '0xB7Bd47f14DFd7Ebd43bfadf020bFA6062622F885' as `0x${string}`

export const CONTRACT_CHAIN = bsc

export const CONTRACT_ABI = [
  {
    name: 'mintPack',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
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
    name: 'nextMintTimestamp',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'PackMinted',
    type: 'event',
    inputs: [
      { name: 'minter',    type: 'address',   indexed: true  },
      { name: 'tokenIds',  type: 'uint256[]', indexed: false },
      { name: 'cardTypes', type: 'uint8[]',   indexed: false },
    ],
  },
] as const
