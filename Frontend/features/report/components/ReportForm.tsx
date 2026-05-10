"use client";

import { Flex, Text, Card, TextField, Button, Select, TextArea } from "@radix-ui/themes";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export function ReportForm() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || !category) return;
    setSubmitted(true);
    setTimeout(() => {
      setTitle("");
      setContent("");
      setCategory("");
      setSubmitted(false);
    }, 2000);
  };

  return (
    <Card
      size="2"
      style={{
        background: isDark ? "var(--gray-11)" : "var(--white)",
        padding: "24px",
      }}
    >
      <Flex direction="column" gap="4">
        <Text size="4" weight="bold">Gửi báo cáo mới</Text>

        <Flex direction="column" gap="1">
          <Text size="2" weight="medium" color="gray">Loại báo cáo</Text>
          <Select.Root value={category} onValueChange={setCategory} size="3">
            <Select.Trigger
              placeholder="Chọn loại báo cáo"
              style={{ width: "100%", background: isDark ? "var(--gray-10)" : "var(--gray-1)" }}
            />
            <Select.Content>
              <Select.Item value="bug">🐛 Báo lỗi</Select.Item>
              <Select.Item value="suggest">💡 Đề xuất</Select.Item>
              <Select.Item value="abuse">🚩 Báo xấu</Select.Item>
              <Select.Item value="other">📋 Khác</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="2" weight="medium" color="gray">Tiêu đề</Text>
          <TextField.Root
            placeholder="Nhập tiêu đề báo cáo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="3"
            style={{ background: isDark ? "var(--gray-10)" : "var(--gray-1)" }}
          />
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="2" weight="medium" color="gray">Nội dung</Text>
          <TextArea
            placeholder="Mô tả chi tiết vấn đề..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            style={{
              background: isDark ? "var(--gray-10)" : "var(--gray-1)",
              resize: "none",
            }}
          />
        </Flex>

        <Button
          size="3"
          color="indigo"
          onClick={handleSubmit}
          disabled={submitted || !title.trim() || !content.trim() || !category}
        >
          {submitted ? "✅ Đã gửi báo cáo" : "📤 Gửi báo cáo"}
        </Button>
      </Flex>
    </Card>
  );
}
