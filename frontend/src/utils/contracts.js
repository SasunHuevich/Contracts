import { ethers } from 'ethers'
import ERC20ABI from '@/abis/ERC20.json'

// Получение контракта токена по адресу
export function getTokenContract(tokenAddress, signer) {
  return new ethers.Contract(
    tokenAddress,
    ERC20ABI,
    signer
  )
}

// Форматирование адреса
export function formatAddress(address) {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

// Оставляем эту функцию для обратной совместимости, но она не используется напрямую
// eslint-disable-next-line no-unused-vars
export function getContracts(signer) {
  console.warn('Функция getContracts устарела, используется прямая инициализация в хранилище');
  return {};
}