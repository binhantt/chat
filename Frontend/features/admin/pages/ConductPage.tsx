"use client";

import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  Switch,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { Cross2Icon, LockClosedIcon, PlusIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createConductRule,
  deleteConductRule,
  getConductRules,
  updateConductRule,
  type ConductRule,
} from "@/features/athu";

export function ConductPage() {
  const [rules, setRules] = useState<ConductRule[]>([]);
  const [phrase, setPhrase] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRules(await getConductRules());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải luật ứng xử");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleCreate = async () => {
    if (!phrase.trim()) {
      setError("Nhập nội dung vi phạm trước khi thêm");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createConductRule({ phrase, note });
      setPhrase("");
      setNote("");
      await fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo luật ứng xử");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rule: ConductRule) => {
    setError(null);
    try {
      const updated = await updateConductRule(rule.id, { isActive: !rule.isActive });
      setRules((current) => current.map((item) => (item.id === rule.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật luật ứng xử");
    }
  };

  const handleDelete = async (rule: ConductRule) => {
    const confirmed = window.confirm(`Xóa luật "${rule.phrase}"?`);
    if (!confirmed) return;

    setError(null);
    try {
      await deleteConductRule(rule.id);
      setRules((current) => current.filter((item) => item.id !== rule.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa luật ứng xử");
    }
  };

  const activeCount = useMemo(
    () => rules.filter((rule) => rule.isActive).length,
    [rules],
  );

  return (
    <Flex direction="column" gap="5">
      <Flex align="center" justify="between" gap="3" wrap="wrap">
        <Box>
          <Heading size="6">Quản lý ứng xử</Heading>
          <Text size="2" color="gray">
            Tin nhắn chứa nội dung đang bật sẽ bị chặn và báo cho người gửi.
          </Text>
        </Box>
        <Button variant="soft" onClick={fetchRules} disabled={loading}>
          <ReloadIcon width={16} height={16} />
          Làm mới
        </Button>
      </Flex>

      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <Card>
          <Flex align="center" gap="3">
            <LockClosedIcon width={28} height={28} color="var(--indigo-9)" />
            <Box>
              <Text size="2" color="gray">Tổng luật</Text>
              <Heading size="5">{rules.length}</Heading>
            </Box>
          </Flex>
        </Card>
        <Card>
          <Text size="2" color="gray">Đang bật</Text>
          <Heading size="5" color="green">{activeCount}</Heading>
        </Card>
        <Card>
          <Text size="2" color="gray">Đang tắt</Text>
          <Heading size="5" color="gray">{rules.length - activeCount}</Heading>
        </Card>
      </Box>

      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">Thêm nội dung vi phạm</Heading>
          <Flex gap="3" align="start" wrap="wrap">
            <TextField.Root
              placeholder="Ví dụ: spam, quấy rối, lừa đảo..."
              value={phrase}
              onChange={(event) => setPhrase(event.target.value)}
              style={{ flex: 1, minWidth: 260 }}
            />
            <Button onClick={handleCreate} disabled={saving}>
              <PlusIcon width={16} height={16} />
              Thêm
            </Button>
          </Flex>
          <TextArea
            placeholder="Ghi chú cho admin nếu cần"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
          />
        </Flex>
      </Card>

      <Card size="2">
        <Flex direction="column" gap="3">
          <Heading size="4">Danh sách luật ứng xử</Heading>
          {loading ? (
            <Text color="gray">Đang tải...</Text>
          ) : rules.length === 0 ? (
            <Text color="gray">Chưa có luật ứng xử nào</Text>
          ) : (
            <Box style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--gray-4)" }}>
                    <th style={{ textAlign: "left", padding: "12px" }}>
                      <Text size="2" color="gray" weight="medium">Nội dung</Text>
                    </th>
                    <th style={{ textAlign: "left", padding: "12px" }}>
                      <Text size="2" color="gray" weight="medium">Ghi chú</Text>
                    </th>
                    <th style={{ textAlign: "left", padding: "12px" }}>
                      <Text size="2" color="gray" weight="medium">Trạng thái</Text>
                    </th>
                    <th style={{ textAlign: "right", padding: "12px" }}>
                      <Text size="2" color="gray" weight="medium">Hành động</Text>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} style={{ borderBottom: "1px solid var(--gray-3)" }}>
                      <td style={{ padding: "12px" }}>
                        <Text size="2" weight="medium">{rule.phrase}</Text>
                      </td>
                      <td style={{ padding: "12px", maxWidth: 420 }}>
                        <Text size="2" color="gray">{rule.note || "Không có ghi chú"}</Text>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <Flex align="center" gap="2">
                          <Switch checked={rule.isActive} onCheckedChange={() => handleToggle(rule)} />
                          <Badge color={rule.isActive ? "green" : "gray"} variant="soft">
                            {rule.isActive ? "Đang chặn" : "Tạm tắt"}
                          </Badge>
                        </Flex>
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <Button variant="ghost" color="red" size="1" onClick={() => handleDelete(rule)}>
                          <Cross2Icon width={14} height={14} />
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Flex>
      </Card>
    </Flex>
  );
}
