"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Dialog, Flex, Text } from "@radix-ui/themes";
import { CopyIcon } from "@radix-ui/react-icons";

type PaymentInfo = {
  paymentId: string;
  transactionCode: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  content: string;
  qrUrl: string;
  status: string;
};

type SeppayPaymentModalProps = {
  open: boolean;
  planId: string;
  planName: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function SeppayPaymentModal({
  open,
  planId,
  planName,
  onClose,
  onSuccess,
}: SeppayPaymentModalProps) {
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Create payment when modal opens
  useEffect(() => {
    if (!open) return;

    const createPayment = async () => {
      setLoading(true);
      setPayment(null);
      try {
        const res = await fetch("/api/v1/payment/seppay/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId }),
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setPayment(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    createPayment();
  }, [open, planId]);

  // Poll payment status — when admin approves, auto-activate
  useEffect(() => {
    if (!open) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/v1/payment/seppay/status", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === "completed") {
            if (pollRef.current) clearInterval(pollRef.current);
            onSuccess();
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, onSuccess]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const InfoRow = ({
    label,
    value,
    copyable,
  }: {
    label: string;
    value: string;
    copyable?: boolean;
  }) => (
    <Flex align="center" justify="between" style={{ padding: "8px 0", borderBottom: "1px solid var(--chat-border)" }}>
      <Text size="2" style={{ color: "var(--chat-muted)", minWidth: 100 }}>
        {label}
      </Text>
      <Flex align="center" gap="2">
        <Text size="2" weight="medium" style={{ color: "var(--chat-text)" }}>
          {value}
        </Text>
        {copyable && (
          <button
            type="button"
            onClick={() => copyToClipboard(value, label)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: copied === label ? "var(--chat-accent)" : "var(--chat-muted)",
              padding: 2,
            }}
          >
            <CopyIcon width={14} height={14} />
          </button>
        )}
      </Flex>
    </Flex>
  );

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Content
        style={{
          maxWidth: 480,
          borderRadius: 16,
          background: "var(--chat-surface)",
        }}
      >
        <Dialog.Title style={{ fontFamily: "var(--font-heading)" }}>
          Thanh toán gói {planName}
        </Dialog.Title>

        {loading ? (
          <Flex align="center" justify="center" style={{ padding: 48 }}>
            <Text size="2" style={{ color: "var(--chat-muted)" }}>
              Đang tạo mã thanh toán...
            </Text>
          </Flex>
        ) : payment ? (
          <Flex direction="column" gap="4">
            {/* QR Code */}
            <Flex align="center" justify="center" style={{ padding: "16px 0" }}>
              <img
                src={payment.qrUrl}
                alt="QR thanh toán"
                style={{
                  width: 240,
                  height: 240,
                  borderRadius: 12,
                  border: "2px solid var(--chat-border)",
                  background: "#FFFFFF",
                }}
              />
            </Flex>

            {/* Transfer info */}
            <Box
              style={{
                background: "var(--bg-secondary)",
                borderRadius: 12,
                padding: "12px 16px",
              }}
            >
              <Text size="2" weight="bold" style={{ color: "var(--chat-text)", marginBottom: 8, display: "block" }}>
                Thông tin chuyển khoản
              </Text>
              <InfoRow label="Ngân hàng" value={payment.bankName} />
              <InfoRow label="Số tài khoản" value={payment.bankAccount} copyable />
              <InfoRow label="Chủ tài khoản" value={payment.bankHolder} copyable />
              <InfoRow label="Số tiền" value={`${payment.amount.toLocaleString()}đ`} />
              <InfoRow label="Nội dung" value={payment.content} copyable />
              <InfoRow label="Mã GD" value={payment.transactionCode} copyable />
            </Box>

            <Text size="1" style={{ color: "var(--chat-muted)", textAlign: "center", lineHeight: 1.6 }}>
              Chuyển khoản theo thông tin bên trên.
              Admin sẽ kích hoạt sau khi xác nhận đã nhận tiền.
            </Text>

            {/* Polling indicator */}
            <Flex align="center" justify="center" gap="2" style={{ padding: "4px 0" }}>
              <Text size="1" style={{ color: "var(--chat-muted)" }}>
                Đang chờ admin xác nhận thanh toán...
              </Text>
            </Flex>
          </Flex>
        ) : (
          <Text size="2" style={{ color: "var(--chat-muted)", textAlign: "center", padding: 24 }}>
            Không thể tạo mã thanh toán. Vui lòng thử lại.
          </Text>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
