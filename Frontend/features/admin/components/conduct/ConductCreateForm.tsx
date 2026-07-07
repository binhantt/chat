import { Button, Dialog, Flex, Text, TextArea, TextField } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

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
  const s = useAdminStyles();
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Content className={s.conduct.dialogContent}>
        <Dialog.Title>Thêm luật ứng xử</Dialog.Title>
        <Dialog.Description size="2" className={s.conduct.dialogDesc}>
          Nhập nội dung vi phạm để hệ thống dùng trong phần kiểm duyệt trò chuyện.
        </Dialog.Description>

        <Flex direction="column" gap="4" mt="4">
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium" className={s.conduct.formLabel}>
              Nội dung vi phạm
            </Text>
            <TextField.Root
              autoFocus
              onChange={(event) => onPhraseChange(event.target.value)}
              placeholder="Ví dụ: spam, quấy rối, lừa đảo..."
              className={s.conduct.formInput}
              value={phrase}
            />
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="2" weight="medium" className={s.conduct.formLabel}>
              Ghi chú
            </Text>
            <TextArea
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="Ghi chú cho quản trị nếu cần"
              rows={3}
              className={s.conduct.formInput}
              value={note}
            />
          </Flex>

          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button disabled={saving} type="button" variant="soft">
                Hủy
              </Button>
            </Dialog.Close>
            <Button disabled={saving} onClick={onCreate} className={s.conduct.formSubmitBtn}>
              <PlusIcon />
              {saving ? "Đang thêm..." : "Thêm luật"}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
