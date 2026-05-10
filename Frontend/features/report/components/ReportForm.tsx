"use client";

import { Flex, Text, Card, TextField, Button, Select, TextArea, Badge } from "@radix-ui/themes";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export function ReportForm() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !category) return;
    
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportedUserId: 'placeholder-user-id', // This should be replaced with actual user ID
          reason: mapCategoryToReason(category),
          description: `${title}\n\n${content}`,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setTitle("");
          setContent("");
          setCategory("");
          setSubmitted(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Không thể gửi báo cáo. Vui lòng thử lại.");
      }
    } catch (err) {
      setError("Không thể kết nối đến server. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const mapCategoryToReason = (category: string) => {
    const categoryMap: Record<string, string> = {
      'bug': 'spam',
      'suggest': 'other',
      'abuse': 'harassment',
      'other': 'other'
    };
    return categoryMap[category] || 'other';
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

        {error && (
          <Text size="2" color="red">
            {error}
          </Text>
        )}
        
        <Button
          size="3"
          color="indigo"
          onClick={handleSubmit}
          disabled={submitted || loading || !title.trim() || !content.trim() || !category}
          loading={loading}
        >
          {submitted ? "✅ Đã gửi báo cáo" : loading ? "Đang gửi..." : "📤 Gửi báo cáo"}
        </Button>
      </Flex>
    </Card>
  );
}
