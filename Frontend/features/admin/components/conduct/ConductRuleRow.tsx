import { Badge, Box, Button, Flex, Grid, Switch, Text } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";
import type { ConductRule } from "@/features/athu";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function ConductRuleRow({
  onDelete,
  onToggle,
  pending,
  rule,
}: {
  onDelete: (rule: ConductRule) => void;
  onToggle: (rule: ConductRule, checked: boolean) => void;
  pending: boolean;
  rule: ConductRule;
}) {
  const s = useAdminStyles();
  return (
    <Box className={s.conduct.ruleRow}>
      <Grid align="center" columns={{ initial: "1", lg: "1.35fr 1fr 150px 150px 86px" }} gap="3" p="3">
        <Flex direction="column" gap="2" className={s.conduct.rulePhraseWrapper}>
          <Flex align="center" gap="2" wrap="wrap">
            <Badge color={rule.isActive ? "green" : "gray"} variant="soft">
              {pending ? "Đang lưu" : rule.isActive ? "Đang bật" : "Đang tắt"}
            </Badge>
            <Text size="1" className={s.conduct.ruleIdText}>
              #{rule.id.slice(0, 8)}
            </Text>
          </Flex>
          <Text as="div" size="3" weight="bold" className={s.conduct.rulePhrase}>
            {rule.phrase}
          </Text>
        </Flex>

        <InfoBlock label="Ghi chú" value={rule.note || "Không có ghi chú"} />
        <InfoBlock label="Ngày tạo" value={formatConductDate(rule.createdAt)} />
        <InfoBlock label="Cập nhật" value={formatConductDate(rule.updatedAt)} />

        <Flex align="center" gap="2" justify={{ initial: "start", lg: "end" }}>
          <Switch checked={rule.isActive} disabled={pending} onCheckedChange={(checked) => onToggle(rule, checked)} />
          <Button color="red" onClick={() => onDelete(rule)} size="2" variant="ghost">
            <Cross2Icon />
          </Button>
        </Flex>
      </Grid>
    </Box>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  const s = useAdminStyles();
  return (
    <Box className={s.conduct.ruleInfoBlock}>
      <Text as="div" size="1" className={s.conduct.ruleInfoLabel}>
        {label}
      </Text>
      <Text as="div" size="2" weight="medium" className={s.conduct.ruleInfoValue}>
        {value}
      </Text>
    </Box>
  );
}

function formatConductDate(dateString: string) {
  return new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
