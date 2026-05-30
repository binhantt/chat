import { StarFilledIcon } from "@radix-ui/react-icons";
import { UserHero } from "@/features/user-layout/components";
import { VipStatusPanel } from "./VipStatusPanel";

export function VipHero() {
  return (
    <UserHero
      badge="VIP đang chuẩn bị"
      description="Nâng cấp trải nghiệm trò chuyện với các quyền lợi mở rộng. Trang này sẵn sàng cho luồng mua gói khi backend thanh toán được bật."
      icon={<StarFilledIcon />}
      title="Gói VIP cho trải nghiệm trò chuyện cá nhân hóa hơn."
    >
      <VipStatusPanel />
    </UserHero>
  );
}
