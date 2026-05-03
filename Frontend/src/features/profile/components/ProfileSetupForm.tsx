"use client";

import {
  Button,
  Flex,
  RadioGroup,
  Separator,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { useProfileSetup } from "../hooks/useProfileSetup";

export function ProfileSetupForm() {
  const {
    name,
    setName,
    age,
    setAge,
    gender,
    setGender,
    bio,
    setBio,
    errors,
    submitError,
    isHydrating,
    saving,
    handleSubmit,
  } = useProfileSetup();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: "#ffffff",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        <Flex direction="column" gap="1" style={{ marginBottom: 28 }}>
          <Text
            size="6"
            weight="bold"
            style={{ color: "#0f172a", letterSpacing: "-0.02em" }}
          >
            Gioi thieu ban than
          </Text>
          <Text size="2" color="gray">
            Thong tin cua ban se duoc an voi nguoi la cho den khi 2 ben cung thich nhau
          </Text>
        </Flex>

        <Separator size="4" style={{ marginBottom: 24 }} />

        <Flex direction="column" gap="5">
          {submitError && (
            <Text size="2" color="red">
              {submitError}
            </Text>
          )}

          <Flex direction="column" gap="2">
            <Text size="2" weight="medium" style={{ color: "#374151" }}>
              Ten cua ban <Text color="red">*</Text>
            </Text>
            <TextField.Root
              size="3"
              placeholder="Nhap ten that cua ban"
              value={name}
              onChange={(event) => setName(event.target.value)}
              color={errors.name ? "red" : undefined}
            />
            {errors.name && (
              <Text size="1" color="red">
                {errors.name}
              </Text>
            )}
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="2" weight="medium" style={{ color: "#374151" }}>
              Tuoi <Text color="red">*</Text>
            </Text>
            <TextField.Root
              size="3"
              type="number"
              placeholder="Vi du: 20"
              min="13"
              max="100"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              color={errors.age ? "red" : undefined}
              style={{ maxWidth: 140 }}
            />
            {errors.age && (
              <Text size="1" color="red">
                {errors.age}
              </Text>
            )}
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="2" weight="medium" style={{ color: "#374151" }}>
              Gioi tinh
            </Text>
            <RadioGroup.Root
              value={gender}
              onValueChange={(value) =>
                setGender(value as "male" | "female" | "other")
              }
            >
              <Flex gap="5">
                <RadioGroup.Item value="male">Nam</RadioGroup.Item>
                <RadioGroup.Item value="female">Nu</RadioGroup.Item>
                <RadioGroup.Item value="other">Khac</RadioGroup.Item>
              </Flex>
            </RadioGroup.Root>
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="2" weight="medium" style={{ color: "#374151" }}>
              Gioi thieu ngan <Text color="gray">(tuy chon)</Text>
            </Text>
            <TextArea
              size="3"
              placeholder="Vai dieu thu vi ve ban..."
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={3}
              style={{ resize: "none" }}
            />
          </Flex>

          <Separator size="4" />

          <Button
            size="4"
            loading={saving || isHydrating}
            disabled={saving || isHydrating}
            onClick={handleSubmit}
            style={{ cursor: saving || isHydrating ? "not-allowed" : "pointer" }}
          >
            {isHydrating ? "Dang tai thong tin..." : "Bat dau tim nguoi la"}
          </Button>
        </Flex>
      </div>
    </div>
  );
}
