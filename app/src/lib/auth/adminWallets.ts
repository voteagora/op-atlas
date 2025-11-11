/**
 * Admin Wallet List
 * Hardcoded list of wallet addresses authorized for admin impersonation
 *
 * To add/remove admins, update this file and deploy
 * All addresses should be Ethereum addresses (0x...)
 */

export const ADMIN_WALLETS = [
  '0x22EdAAE2Fe5e3AC84D9f25723A4d945D8C4c47aD',
].map(addr => addr.toLowerCase())
