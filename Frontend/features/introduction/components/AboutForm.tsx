"use client";

import { Flex, Text, TextField, Select, Button, Callout } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function AboutForm() {
  const { user, fetchUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    bio: "",
    gender: "",
    city: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
        phoneNumber: user.phoneNumber || "",
        bio: user.bio || "",
        gender: user.gender || "",
        city: user.city || "",
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData = {
        fullName: formData.fullName || null,
        dateOfBirth: formData.dateOfBirth || null,
        phoneNumber: formData.phoneNumber || null,
        bio: formData.bio || null,
        gender: formData.gender || null,
        city: formData.city || null,
      };

      const res = await fetch("/api/v1/users/setup-profile", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Không thể cập nhật thông tin");
      }

      await fetchUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Flex align="center" justify="center" p="5">
        <Text color="gray">Đang tải thông tin...</Text>
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex align="center" justify="center" p="5" direction="column" gap="2">
        <Text color="gray">Vui lòng đăng nhập để cập nhật thông tin</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="5" style={{ maxWidth: 480, width: "100%" }}>
      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" color="gray">
          Họ và tên
        </Text>
        <TextField.Root
          placeholder="Nhập họ và tên của bạn"
          value={formData.fullName}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
          style={{ background: "var(--gray-1)" }}
        />
      </Flex>

      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" color="gray">
          Ngày sinh
        </Text>
        <TextField.Root
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          style={{ background: "var(--gray-1)" }}
        />
      </Flex>

      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" color="gray">
          Số điện thoại
        </Text>
        <TextField.Root
          placeholder="Nhập số điện thoại"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
          style={{ background: "var(--gray-1)" }}
        />
      </Flex>

      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" color="gray">
          Giới tính
        </Text>
        <Select.Root
          value={formData.gender}
          onValueChange={(value) => handleInputChange("gender", value)}
        >
          <Select.Trigger placeholder="Chọn giới tính" style={{ width: "100%", background: "var(--gray-1)" }} />
          <Select.Content>
            <Select.Item value="male">Nam</Select.Item>
            <Select.Item value="female">Nữ</Select.Item>
            <Select.Item value="other">Khác</Select.Item>
          </Select.Content>
        </Select.Root>
      </Flex>

      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" color="gray">
          Tỉnh/Thành phố
        </Text>
        <Select.Root
          value={formData.city}
          onValueChange={(value) => handleInputChange("city", value)}
        >
          <Select.Trigger placeholder="Chọn tỉnh/thành phố" style={{ width: "100%", background: "var(--gray-1)" }} />
          <Select.Content>
            {[
              "Hà Nội", "TP. Hồ Chí Minh", "Hải Phòng", "Đà Nẵng", "Cần Thơ",
              "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
              "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
              "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
              "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
              "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
              "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
              "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
              "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên",
              "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị",
              "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên",
              "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang",
              "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
            ].map((city) => (
              <Select.Item key={city} value={city}>{city}</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>

      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" color="gray">
          Giới thiệu bản thân
        </Text>
        <TextField.Root
          placeholder="Viết một vài câu giới thiệu về bạn"
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          style={{ background: "var(--gray-1)" }}
        />
      </Flex>

      {error && (
        <Callout.Root color="red" size="1">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      {success && (
        <Callout.Root color="green" size="1">
          <Callout.Text>Cập nhật thông tin thành công!</Callout.Text>
        </Callout.Root>
      )}

      <Button size="3" color="indigo" style={{ marginTop: 4 }} disabled={loading} onClick={handleSubmit}>
        {loading ? "Đang lưu..." : "Lưu thông tin"}
      </Button>
    </Flex>
  );
}
