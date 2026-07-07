"use client";

import {
  Button,
  Callout,
  Flex,
  Select,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import {
  EnterIcon,
  FaceIcon,
  IdCardIcon,
  PersonIcon,
  SewingPinIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/contexts/AuthContext";

const cities = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hai Phong",
  "Cần Thơ",
  "An Giang",
  "Bình Dương",
  "Đồng Nai",
  "Khánh Hòa",
  "Lâm Đồng",
  "Nghệ An",
  "Quang Ninh",
  "Thanh Hoa",
  "Thừa Thiên Huế",
];

const cityAliases: Record<string, string> = {
  "Ha Noi": "Hà Nội",
  "TP. Ho Chi Minh": "TP. Hồ Chí Minh",
  "Can Tho": "Cần Thơ",
  "Binh Duong": "Bình Dương",
  "Dong Nai": "Đồng Nai",
  "Khanh Hoa": "Khánh Hòa",
  "Lam Dong": "Lâm Đồng",
  "Nghe An": "Nghệ An",
  "Thua Thien Hue": "Thừa Thiên Huế",
};

export function AboutForm() {
  const { user, updateUser, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <Flex align="center" justify="center" p="5">
        <Text style={{ color: "var(--chat-muted)" }}>Đang tải thông tin...</Text>
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex align="center" direction="column" gap="2" justify="center" p="5">
        <Text style={{ color: "var(--chat-muted)" }}>Vui lòng đăng nhập để cập nhật hồ sơ</Text>
      </Flex>
    );
  }

  return <EditableProfileForm key={`${user.id}-${user.updatedAt}`} user={user} onSaved={updateUser} />;
}

function EditableProfileForm({
  onSaved,
  user,
}: {
  onSaved: (userData: Partial<User>) => Promise<void>;
  user: User;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => ({
    bio: user.bio || "",
    city: normalizeCity(user.city),
    dateOfBirth: user.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split("T")[0]
      : "",
    fullName: user.fullName || "",
    gender: user.gender || "",
    phoneNumber: user.phoneNumber || "",
  }));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await onSaved({
        bio: formData.bio || null,
        city: formData.city || null,
        dateOfBirth: formData.dateOfBirth || null,
        fullName: formData.fullName || null,
        gender: (formData.gender || null) as User["gender"],
        phoneNumber: formData.phoneNumber || null,
      });
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="5">
        <ProfileTextInput
          icon={<PersonIcon />}
          label="Họ và tên"
          onChange={(value) => handleInputChange("fullName", value)}
          placeholder="Nhập tên hiển thị"
          value={formData.fullName}
        />

        <Flex gap="4" wrap="wrap">
          <ProfileSelect
            icon={<FaceIcon />}
            label="Giới tính"
            onChange={(value) => handleInputChange("gender", value)}
            options={[
              ["male", "Nam"],
              ["female", "Nữ"],
              ["other", "Khác"],
            ]}
            placeholder="Chọn giới tính"
            value={formData.gender}
          />
          <ProfileSelect
            icon={<SewingPinIcon />}
            label="Tỉnh/Thành phố"
            onChange={(value) => handleInputChange("city", value)}
            options={cities.map((city) => [city, city])}
            placeholder="Chọn vị trí"
            value={formData.city}
          />
        </Flex>

        <Flex direction="column" gap="2">
          <FieldLabel icon={<IdCardIcon />} label="Giới thiệu bản thân" />
          <TextArea
            placeholder="Viết một vài câu về bạn..."
            resize="vertical"
            value={formData.bio}
            onChange={(event) => handleInputChange("bio", event.target.value)}
            style={inputStyle}
          />
        </Flex>

        {error && (
          <Callout.Root color="red" size="1" style={{ borderRadius: 10 }}>
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}

        {success && (
          <Callout.Root color="green" size="1" style={{ borderRadius: 10 }}>
            <Callout.Text>Cập nhật hồ sơ thành công!</Callout.Text>
          </Callout.Root>
        )}

        <Button
          disabled={loading}
          size="3"
          type="submit"
          style={{
            background: "linear-gradient(135deg, var(--chat-accent), var(--secondary))",
            borderRadius: 10,
            color: "#FFFFFF",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            height: 46,
            marginTop: 4,
          }}
        >
          <EnterIcon />
          {loading ? "Đang lưu..." : "Lưu hồ sơ"}
        </Button>
      </Flex>
    </form>
  );
}

function ProfileTextInput({
  icon,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  icon: React.ReactNode;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "date" | "text";
  value: string;
}) {
  return (
    <Flex direction="column" gap="2" style={{ flex: 1, minWidth: 220 }}>
      <FieldLabel icon={icon} label={label} />
      <TextField.Root
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={inputStyle}
      />
    </Flex>
  );
}

function ProfileSelect({
  icon,
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  onChange: (value: string) => void;
  options: string[][];
  placeholder: string;
  value: string;
}) {
  return (
    <Flex direction="column" gap="2" style={{ flex: 1, minWidth: 220 }}>
      <FieldLabel icon={icon} label={label} />
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger placeholder={placeholder} style={{ ...inputStyle, width: "100%" }} />
        <Select.Content>
          {options.map(([optionValue, optionLabel]) => (
            <Select.Item key={optionValue} value={optionValue}>
              {optionLabel}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Flex>
  );
}

function FieldLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Flex align="center" gap="2">
      <Flex
        align="center"
        justify="center"
        style={{ color: "var(--chat-accent)", height: 18, width: 18 }}
      >
        {icon}
      </Flex>
      <Text size="2" weight="medium" style={{ color: "var(--chat-text)" }}>
        {label}
      </Text>
    </Flex>
  );
}

function normalizeCity(city?: string | null) {
  if (!city) return "";
  return cityAliases[city] || city;
}

const inputStyle = {
  background: "var(--chat-accent-soft)",
  border: "1px solid var(--chat-border)",
  borderRadius: 10,
  color: "var(--chat-text)",
  padding: "0 14px",
} as const;
