/**
 * Admin Wallet List
 * Hardcoded list of wallet addresses authorized for admin impersonation
 *
 * To add/remove admins, update this file and deploy
 * All addresses should be Ethereum addresses (0x...)
 */

export const ADMIN_WALLETS = [
  '0x22EdAAE2Fe5e3AC84D9f25723A4d945D8C4c47aD', // Agora Lucas
  '0x8ae9d9cbf802df050de5b2749d30d17aea31b8bf', // OP Eleanor - dev
  '0x3B7fe632732c184BCE18E54cD717306Deef54E06', // OP Eleanor - prod primary
  '0x981c43838c802f434758c5B4A69BF93655b97A10', // OP Eleanor - prod other
  '0x57De675bb963b341479F98E7c5418Bb3B3de2088', // OP Emily
  '0xc1ef3c8d28f9fadb3d42bb8a0bbbe95c4239f653', // OP Jonas
  '0xA622279f76ddbed4f2CC986c09244262Dba8f4Ba', // Agora Jeff
].map(addr => addr.toLowerCase())
