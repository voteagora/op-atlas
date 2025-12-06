/**
 * Admin Wallet List
 * Hardcoded list of wallet addresses authorized for admin impersonation
 *
 * To add/remove admins, update this file and deploy
 * All addresses should be Ethereum addresses (0x...)
 */

export const ADMIN_WALLETS = [
  '0x22EdAAE2Fe5e3AC84D9f25723A4d945D8C4c47aD', // Agora Lucas
  '0x8ae9d9cbf802df050de5b2749d30d17aea31b8bf', // OP Eleanor
  '0x57De675bb963b341479F98E7c5418Bb3B3de2088', // OP Emily
  '0xc1ef3c8d28f9fadb3d42bb8a0bbbe95c4239f653', // OP Jonas
].map(addr => addr.toLowerCase())
