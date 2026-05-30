import type { VipPackage } from "../types";

export function sortVipPackages(packages: VipPackage[]) {
  return [...packages].sort((first, second) => first.sortOrder - second.sortOrder);
}
