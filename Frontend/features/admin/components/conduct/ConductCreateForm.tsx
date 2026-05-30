import { Button, Dialog, Flex, Text, TextArea, TextField } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";

export function ConductCreateForm({
  note,
  onCreate,
  onNoteChange,
  onOpenChange,
  onPhraseChange,
  open,
  phrase,
  saving,
}: {
  note: string;
  onCreate: () => void;
  onNoteChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onPhraseChange: (value: string) => void;
  open: boolean;
  phrase: string;
  saving: boolean;
}) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Content
        style={{
          background: authTheme.panel,
          border: `1px solid ${authTheme.line}`,
          borderRadius: 8,
          maxWidth: 560,
        }}
      >
        <Dialog.Title>Thêm luật ứng xử</Dialog.Title>
        <Dialog.Description size="2" style={{ color: authTheme.muted }}>
          Nhập nội dung vi phạm để hệ thống dùng trong phần kiểm duyệt trò chuyện.
        </Dialog.Description>

        <Flex direction="column" gap="4" mt="4">
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium" style={{ color: authTheme.text }}>
              Nội dung vi phạm
            </Text>
            <TextField.Root
              autoFocus
              onChange={(event) => onPhraseChange(event.target.value)}
              placeholder="Ví dụ: spam, quấy rối, lừa đảo..."
              style={{ borderRadius: 8 }}
              value={phrase}
            />
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="2" weight="medium" style={{ color: authTheme.text }}>
              Ghi chú
            </Text>
            <TextArea
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="Ghi chú cho quản trị nếu cần"
              rows={3}
              style={{ borderRadius: 8 }}
              value={note}
            />
          </Flex>

          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button disabled={saving} type="button" variant="soft">
                Hủy
              </Button>
            </Dialog.Close>
            <Button disabled={saving} onClick={onCreate} style={{ borderRadius: 8 }}>
              <PlusIcon />
              {saving ? "Đang thêm..." : "Thêm luật"}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
