import { bsc } from 'wagmi/chains'

export const CONTRACT_ADDRESS = '0xb459256DA7f6913D435Fb6B6a8Db1e65E7019823' as `0x${string}`

export const CONTRACT_CHAIN = bsc

export const CONTRACT_ABI = [
  {
    name: 'openPack',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
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
    name: 'getEarnedCards',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'addr', type: 'address' }],
    outputs: [{ name: '', type: 'uint8[]' }],
  },
  {
    name: 'getOwnedCardTypes',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'addr', type: 'address' }],
    outputs: [{ name: '', type: 'uint8[]' }],
  },
  {
    name: 'nextPackTimestamp',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'PackOpened',
    type: 'event',
    inputs: [
      { name: 'player',    type: 'address',  indexed: true  },
      { name: 'cardTypes', type: 'uint8[]',  indexed: false },
    ],
  },
  {
    name: 'CardMinted',
    type: 'event',
    inputs: [
      { name: 'player',     type: 'address',  indexed: true  },
      { name: 'tokenId',    type: 'uint256',  indexed: false },
      { name: 'cardTypeId', type: 'uint8',    indexed: false },
    ],
  },
] as const
