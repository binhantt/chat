import { Badge, Flex, Text } from "@radix-ui/themes";
import { PersonIcon } from "@radix-ui/react-icons";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/ui";
import { LoginForm } from "./LoginForm";

interface AuthPageProps {
  badge?: string;
  titleLine1?: string;
  titleHighlight?: string;
  description?: string;
  children?: ReactNode;
  mode?: "admin" | "user";
}

export function AuthPage({
  badge = "Admin",
  titleLine1 = "Chao mung den",
  titleHighlight = "Trang Admin",
  description = "Quan ly tai khoan, phien chat va van hanh he thong trong mot khong gian gon, ro va de theo doi.",
  children,
  mode = "admin",
}: AuthPageProps) {
  const isUserMode = mode === "user";

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-200/40 blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-200/40 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] rounded-full bg-indigo-200/30 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[32px] bg-white/70 shadow-[0_20px_80px_-15px_rgba(0,0,0,0.1)] ring-1 ring-slate-200 backdrop-blur-xl lg:h-[calc(100dvh-4rem)] lg:max-h-[850px] lg:flex-row">
        <div
          className={`relative flex flex-col overflow-hidden p-8 lg:p-12 ${
            isUserMode ? "lg:w-[48%]" : "lg:w-[45%]"
          } border-b border-slate-200 lg:border-b-0 lg:border-r`}
        >
          <div
            className={`absolute inset-0 -z-10 ${
              isUserMode
                ? "bg-[radial-gradient(circle_at_top_left,_rgba(103,232,249,0.32),_transparent_38%),linear-gradient(180deg,_rgba(240,249,255,0.92)_0%,_rgba(255,255,255,0.95)_100%)]"
                : "bg-gradient-to-br from-cyan-50/50 via-transparent to-white/80"
            }`}
          />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <BrandMark />
            <Badge color="cyan" size="2" variant="soft" radius="full">
              {badge}
            </Badge>
          </div>

          <Flex
            direction="column"
            align="center"
            gap="5"
            className={`z-10 mx-auto my-auto text-center ${
              isUserMode ? "max-w-lg pt-12 lg:pt-14" : "max-w-md pt-16 lg:pt-20"
            }`}
          >
            <div
              className={`flex items-center justify-center rounded-full text-cyan-600 shadow-sm ${
                isUserMode ? "h-24 w-24 bg-white/80" : "h-20 w-20 bg-cyan-100"
              }`}
            >
              <PersonIcon width="32" height="32" />
            </div>
            <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-slate-900 lg:text-5xl">
              {titleLine1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                {titleHighlight}
              </span>
            </h1>
            <Text size="3" className="max-w-md text-balance leading-7 text-slate-600">
              {description}
            </Text>

            <div className={`grid w-full gap-3 pt-3 ${isUserMode ? "sm:grid-cols-1" : "sm:grid-cols-3"}`}>
              <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_12px_30px_-20px_rgba(14,165,233,0.18)] backdrop-blur">
                <Text size="1" className="block uppercase tracking-[0.18em] text-slate-400">
                  {isUserMode ? "Signin" : "Access"}
                </Text>
                <Text as="p" size="3" weight="bold" className="mt-2 text-slate-900">
                  {isUserMode ? "Google workspace" : "Bao mat"}
                </Text>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_12px_30px_-20px_rgba(14,165,233,0.18)] backdrop-blur">
                <Text size="1" className="block uppercase tracking-[0.18em] text-slate-400">
                  {isUserMode ? "Access" : "Session"}
                </Text>
                <Text as="p" size="3" weight="bold" className="mt-2 text-slate-900">
                  {isUserMode ? "Phan quyen tu dong" : "On track"}
                </Text>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_12px_30px_-20px_rgba(14,165,233,0.18)] backdrop-blur">
                <Text size="1" className="block uppercase tracking-[0.18em] text-slate-400">
                  {isUserMode ? "Session" : "Support"}
                </Text>
                <Text as="p" size="3" weight="bold" className="mt-2 text-slate-900">
                  {isUserMode ? "Mot cham dang nhap" : "San sang"}
                </Text>
              </div>
            </div>
          </Flex>
        </div>

        <div
          className={`flex overflow-y-auto bg-white/40 p-8 lg:p-12 ${
            isUserMode ? "justify-start lg:w-[52%]" : "justify-center lg:w-[55%]"
          }`}
        >
          <div
            className={`w-full ${
              isUserMode ? "max-w-xl pt-12 lg:max-w-2xl lg:pt-14" : "max-w-md pt-16 xl:max-w-lg lg:pt-20"
            }`}
          >
            {children ?? <LoginForm />}
          </div>
        </div>
      </div>
    </main>
  );
}
