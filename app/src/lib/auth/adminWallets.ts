/**
 * Admin Wallet List
 * Hardcoded list of wallet addresses authorized for admin impersonation
 *
 * To add/remove admins, update this file and deploy
 * All addresses should be Ethereum addresses (0x...)
 */

export const ADMIN_WALLETS = [
  '0x22EdAAE2Fe5e3AC84D9f25723A4d945D8C4c47aD', // Agora Lucas
  '0x3B7fe632732c184BCE18E54cD717306Deef54E06', // OP Eleanor
  '0xfD4bBFB34ce81655a5EBf3fB18597d4BbA1087E2', // OP Sara
  '0x3584af1409456aF9dB967e46CB2dBc28adBd488c', // OP Emily
  '0xef297E3c5f5ABDEC0a520C743Db19417deb41a86', // OP Julian
  '0x13ac7d7da4f9063ba7cabc2ad75f90afb3d0877b', // OP Shaun
].map(addr => addr.toLowerCase())
