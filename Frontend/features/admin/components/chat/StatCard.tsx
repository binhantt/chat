import { Card, Flex, Heading, Text } from "@radix-ui/themes";

interface StatCardProps {
  title: string;
  value: number;
  color?: "green" | "gray" | "red";
}

export function StatCard({ title, value, color }: StatCardProps) {
  return (
    <Card size="1" style={{ flex: 1 }}>
      <Flex direction="column" gap="1" align="center" justify="center">
        <Text size="2" color="gray">{title}</Text>
        <Heading size="7" color={color}>{value}</Heading>
      </Flex>
    </Card>
  );
}