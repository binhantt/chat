import { Callout, Flex, Grid } from "@radix-ui/themes";
import { AdminChartPanel } from "./AdminChartPanel";
import { AdminDashboardHeader } from "./AdminDashboardHeader";
import { AdminRecentUsersPanel } from "./AdminRecentUsersPanel";
import { AdminServerMetricsPanel } from "./AdminServerMetricsPanel";
import { AdminStatGrid } from "./AdminStatGrid";
import { AdminVisitStatsPanel } from "./AdminVisitStatsPanel";
import type { AdminDashboardProps } from "./types";

export function AdminDashboardView({ error, recentUsers, stats }: AdminDashboardProps) {
  return (
    <Flex direction="column" gap="5">
      <AdminDashboardHeader />

      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      <AdminStatGrid stats={stats} />

      <AdminServerMetricsPanel />
      <AdminVisitStatsPanel />

      <Grid columns={{ initial: "1", lg: "2" }} gap="4">
        <AdminChartPanel stats={stats} />
        <AdminRecentUsersPanel users={recentUsers} />
      </Grid>
    </Flex>
  );
}
