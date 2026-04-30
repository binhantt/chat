import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { BrandMark } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[8%] top-[-18%] h-[22rem] w-[22rem] rounded-full bg-cyan-200/40 blur-[120px]" />
        <div className="absolute bottom-[-12%] right-[-6%] h-[24rem] w-[24rem] rounded-full bg-blue-200/35 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] bg-[size:34px_34px] opacity-40" />
      </div>

      <section className="relative w-full max-w-5xl overflow-hidden rounded-[32px] bg-white/78 shadow-[0_20px_80px_-24px_rgba(15,23,42,0.18)] ring-1 ring-white/80 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(103,232,249,0.26),_transparent_36%),linear-gradient(180deg,_rgba(240,249,255,0.82)_0%,_rgba(255,255,255,0.92)_100%)]" />
        <div className="relative z-10 flex items-center justify-between gap-4 p-8 lg:p-12">
          <BrandMark />
          <div className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
            404
          </div>
        </div>

        <div className="relative z-10 flex min-h-[32rem] flex-col items-center justify-center px-8 pb-12 pt-4 text-center lg:min-h-[40rem] lg:px-12">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/80 text-cyan-700 shadow-sm">
            <ExclamationTriangleIcon width="34" height="34" />
          </div>
          <p className="mb-3 font-mono text-sm uppercase tracking-[0.22em] text-slate-400">Page not found</p>
          <h1 className="text-6xl font-semibold leading-none tracking-tight text-slate-950 lg:text-8xl">
            404
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Trang nay khong ton tai hoac da duoc thay doi duong dan.
          </p>
        </div>
      </section>
    </main>
  );
}
