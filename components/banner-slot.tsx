export type BannerSlotName =
  | "HOME_HERO"
  | "HOME_FEED"
  | "PRODUCT_LIST_TOP"
  | "CHECKOUT_BOTTOM";

export interface BannerSlotProps {
  slot: BannerSlotName;
}

/**
 * Placeholder for the future advertising-banner system (spec §16: schema
 * staged in AdBanner/Advertiser, no fetch/render logic yet). Renders
 * nothing until a real implementation queries AdBanner by slot+date range.
 */
export function BannerSlot(_props: BannerSlotProps) {
  return null;
}
