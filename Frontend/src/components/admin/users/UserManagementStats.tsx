import { Text } from "@radix-ui/themes";

const items = [
  { label: "Nhom quan tri", value: "2 admin", detail: "Full control" },
  { label: "Support & moderation", value: "2 thanh vien", detail: "Response lane" },
  { label: "Can xu ly", value: "1 tai khoan", detail: "Pending review" },
];

export function UserManagementStats() {
  return (
    <>
      {items.map((item) => (
        <div key={item.label} className="overflow-hidden rounded-[24px] bg-white/88 backdrop-blur-xl">
          <div className="space-y-4 p-5">
            <Text size="2" className="font-medium text-slate-500">
              {item.label}
            </Text>
            <Text as="p" className="text-3xl font-semibold tracking-tight text-slate-950">
              {item.value}
            </Text>
            <Text size="2" className="font-medium text-cyan-700">
              {item.detail}
            </Text>
          </div>
        </div>
      ))}
    </>
  );
}
