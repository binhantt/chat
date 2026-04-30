"use client";

import { Button } from "@radix-ui/themes";
import { ArrowRightIcon } from "@radix-ui/react-icons";

export function GoogleLoginForm() {
  return (
    <div className="w-full max-w-xl rounded-[28px] bg-white/88 p-8 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.22)] ring-1 ring-white/80 backdrop-blur xl:p-10">
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-4xl font-semibold tracking-tight text-slate-950">Dang nhap Google</h2>
          <p className="text-base leading-7 text-slate-600">Su dung tai khoan Google de tiep tuc.</p>
        </div>

        <Button
          className="h-14 w-full text-lg font-semibold shadow-md shadow-cyan-500/20"
          color="cyan"
          size="4"
          type="button"
        >
          Dang nhap Google
          <ArrowRightIcon width="18" height="18" />
        </Button>
      </div>
    </div>
  );
}
