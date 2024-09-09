export function getShopDomain(fullDomain: string): string {
  return fullDomain.split(".", 1)[0]; // remove ".myshopify.com" from domain
}