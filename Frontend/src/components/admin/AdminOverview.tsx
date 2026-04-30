import { DashboardIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { Badge, Flex, Heading, Text } from "@radix-ui/themes";

export function AdminOverview({ userId }: { userId: string }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_22rem]">
      <section className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#155e75_58%,#0ea5e9_100%)] text-white">
        <div className="flex h-full flex-col justify-between gap-8 p-6 lg:p-8">
          <div className="space-y-4">
            <Badge size="2" variant="soft" className="w-fit bg-white/14 px-3 text-white">
              Operations center
            </Badge>

            <div className="space-y-3">
              <Heading size="8" className="max-w-3xl font-sans tracking-tight text-white">
                Admin command dashboard.
              </Heading>
              <Text size="3" className="block max-w-2xl leading-8 text-cyan-50/88">
                Theo doi chat queue, session, quyen truy cap va suc khoe he thong trong mot bo cuc ro rang de xu ly nhanh hon.
              </Text>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
              <Text size="1" className="block uppercase tracking-[0.18em] text-cyan-50/72">
                Queue
              </Text>
              <Text as="p" size="5" weight="bold" className="mt-2 text-white">
                Live
              </Text>
              <Text size="2" className="mt-1 block text-cyan-50/80">
                Monitoring 24/7
              </Text>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
              <Text size="1" className="block uppercase tracking-[0.18em] text-cyan-50/72">
                Session
              </Text>
              <Text as="p" size="5" weight="bold" className="mt-2 text-white">
                Verified
              </Text>
              <Text size="2" className="mt-1 block text-cyan-50/80">
                Route guard active
              </Text>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
              <Text size="1" className="block uppercase tracking-[0.18em] text-cyan-50/72">
                Access
              </Text>
              <Text as="p" size="5" weight="bold" className="mt-2 text-white">
                Scoped
              </Text>
              <Text size="2" className="mt-1 block text-cyan-50/80">
                Role-based control
              </Text>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] bg-white/88 backdrop-blur-xl">
        <div className="flex h-full flex-col justify-between gap-6 p-6">
          <div className="space-y-4">
            <Flex align="center" gap="3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <DashboardIcon width="20" height="20" />
              </div>
              <div>
                <Text size="1" className="block uppercase tracking-[0.18em] text-slate-400">
                  Session active
                </Text>
                <Text as="p" size="5" weight="bold" className="text-slate-950">
                  Admin authenticated
                </Text>
              </div>
            </Flex>

            <Text as="p" size="2" className="leading-6 text-slate-600">
              Cookie hop le, refresh token san sang va route guard da xac thuc thanh cong.
            </Text>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <Text size="1" className="block uppercase tracking-[0.16em] text-slate-400">
                User id
              </Text>
              <Text as="p" size="2" className="mt-2 break-all font-mono text-slate-900">
                {userId}
              </Text>
            </div>

            <Flex align="center" justify="between" className="rounded-2xl bg-slate-50 px-4 py-4">
              <div>
                <Text size="1" className="block uppercase tracking-[0.16em] text-slate-400">
                  Access state
                </Text>
                <Text as="p" size="3" weight="bold" className="mt-1 text-slate-950">
                  Internal only
                </Text>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
                <LockClosedIcon width="18" height="18" />
              </div>
            </Flex>
          </div>
        </div>
      </section>
    </div>
  );
}
