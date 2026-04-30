import { Callout } from "@radix-ui/themes";
import type { ReactNode } from "react";

interface StatusCalloutProps {
  children: ReactNode;
  color?: "gray" | "red" | "ruby" | "green" | "cyan" | "amber";
}

export function StatusCallout({
  children,
  color = "ruby",
}: StatusCalloutProps) {
  return (
    <Callout.Root color={color} size="2" role="alert" variant="soft">
      <Callout.Text>{children}</Callout.Text>
    </Callout.Root>
  );
}
