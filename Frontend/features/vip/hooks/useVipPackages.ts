import { vipPackages } from "../store/vipStore";
import { sortVipPackages } from "../utils/sortVipPackages";

export function useVipPackages() {
  return sortVipPackages(vipPackages);
}
