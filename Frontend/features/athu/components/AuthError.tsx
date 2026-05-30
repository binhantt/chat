"use client";

import { Callout } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

type AuthErrorProps = {
  message: string | null;
};

export function AuthError({ message }: AuthErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <Callout.Root color="red" size="1" variant="surface">
      <Callout.Icon>
        <ExclamationTriangleIcon />
      </Callout.Icon>
      <Callout.Text>{message}</Callout.Text>
    </Callout.Root>
  );
}
