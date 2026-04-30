"use client";

import {
  Button,
  Callout,
  Checkbox,
  Flex,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  EyeNoneIcon,
  EyeOpenIcon,
  InfoCircledIcon,
  LockClosedIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { useAuthSession } from "../hooks/useAuthSession";

export function LoginForm() {
  const {
    email,
    password,
    rememberEmail,
    showPassword,
    errors,
    submitError,
    isSubmitting,
    isFormValid,
    handleEmailChange,
    handlePasswordChange,
    handleRememberEmailChange,
    handleEmailBlur,
    handlePasswordBlur,
    handleSubmit,
    togglePasswordVisibility,
  } = useAuthSession();

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">Dang nhap</h2>
        <p className="text-slate-500">Dung tai khoan admin de tiep tuc</p>
      </div>

      {submitError && (
        <Callout.Root color="red" role="alert" className="bg-red-50 border border-red-200">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text className="text-red-700">{submitError}</Callout.Text>
        </Callout.Root>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email cong viec
            </label>
            <TextField.Root
              id="email"
              autoComplete="email"
              color={errors.email ? "ruby" : "cyan"}
              inputMode="email"
              name="email"
              placeholder="admin@example.com"
              size="3"
              type="email"
              value={email}
              variant="surface"
              onBlur={handleEmailBlur}
              onChange={(event) => handleEmailChange(event.target.value)}
              className="bg-white border-slate-200/80 shadow-sm"
            >
              <TextField.Slot>
                <PersonIcon height="16" width="16" className="text-slate-400" />
              </TextField.Slot>
            </TextField.Root>
            {errors.email && (
              <Text as="p" color="red" size="2" className="mt-1">
                {errors.email}
              </Text>
            )}
          </div>

          <div className="space-y-2">
            <Flex justify="between" align="center">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Mat khau
              </label>
            </Flex>
            <TextField.Root
              id="password"
              autoComplete="current-password"
              color={errors.password ? "ruby" : "cyan"}
              name="password"
              placeholder="........"
              size="3"
              type={showPassword ? "text" : "password"}
              value={password}
              variant="surface"
              onBlur={handlePasswordBlur}
              onChange={(event) => handlePasswordChange(event.target.value)}
              className="bg-white border-slate-200/80 shadow-sm"
            >
              <TextField.Slot>
                <LockClosedIcon height="16" width="16" className="text-slate-400" />
              </TextField.Slot>
              <TextField.Slot side="right">
                <button
                  type="button"
                  tabIndex={-1}
                  className="text-slate-400 hover:text-slate-700 transition-colors px-2 outline-none"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeNoneIcon width="18" height="18" /> : <EyeOpenIcon width="18" height="18" />}
                </button>
              </TextField.Slot>
            </TextField.Root>
            {errors.password && (
              <Text as="p" color="red" size="2" className="mt-1">
                {errors.password}
              </Text>
            )}
          </div>
        </div>

        <Flex align="center" justify="between" className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <Checkbox
              checked={rememberEmail}
              onCheckedChange={handleRememberEmailChange}
              size="2"
              color="cyan"
              className="group-hover:opacity-80"
              variant="surface"
            />
            <Text size="2" className="text-slate-600 group-hover:text-slate-900 transition-colors font-medium">
              Nho tai khoan
            </Text>
          </label>
          <a
            href="#"
            className="text-sm font-medium text-cyan-600 hover:text-cyan-700 hover:underline underline-offset-4 transition-all"
          >
            Quen mat khau?
          </a>
        </Flex>

        <Button
          className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.98] shadow-md shadow-cyan-500/20"
          color="cyan"
          disabled={!isFormValid || isSubmitting}
          size="4"
          type="submit"
        >
          {isSubmitting ? "Dang xu ly..." : "Dang nhap"}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-500">Khong chia se thong tin dang nhap.</p>
      </div>
    </div>
  );
}
