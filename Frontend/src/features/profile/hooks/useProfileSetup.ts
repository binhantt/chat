"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredProfile, saveProfile, PROFILE_KEY } from "../types";
import type { BackendProfile, UserProfile } from "../types";

export function useProfileSetup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const localProfile = getStoredProfile();

      if (localProfile && !cancelled) {
        setName(localProfile.name);
        setAge(String(localProfile.age));
        setGender(localProfile.gender);
        setBio(localProfile.bio ?? "");
      }

      try {
        const response = await fetch("/api/profile/me", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          if (!cancelled) {
            setSubmitError("Khong tai duoc thong tin ca nhan hien tai.");
          }
          return;
        }

        const profile = (await response.json()) as BackendProfile;

        if (cancelled) {
          return;
        }

        setName(profile.fullName ?? localProfile?.name ?? "");
        setBio(profile.bio ?? localProfile?.bio ?? "");

        if (profile.dateOfBirth) {
          setAge(String(calculateAge(profile.dateOfBirth)));
        }
      } catch {
        if (!cancelled) {
          setSubmitError("Khong the ket noi toi may chu de tai thong tin ca nhan.");
        }
      } finally {
        if (!cancelled) {
          setIsHydrating(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = useCallback(async () => {
    const validationErrors: Record<string, string> = {};

    if (!name.trim()) {
      validationErrors.name = "Vui long nhap ten cua ban";
    }

    const ageNum = Number.parseInt(age, 10);

    if (!age || Number.isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
      validationErrors.age = "Tuoi phai tu 13 den 100";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSaving(true);

    try {
      const response = await fetch("/api/profile/me", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          fullName: name.trim(),
          bio: bio.trim() || null,
          dateOfBirth: createApproximateDateOfBirth(ageNum),
        }),
        cache: "no-store",
        credentials: "same-origin",
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      const payload = await parseResponse(response);

      if (!response.ok) {
        setSubmitError(getErrorMessage(payload));
        return;
      }

      const backendProfile = payload as BackendProfile;
      const profile: UserProfile = {
        userId: backendProfile.id,
        name: name.trim(),
        age: ageNum,
        gender,
        bio: bio.trim(),
      };

      saveProfile(profile);
      router.replace("/find");
    } catch {
      setSubmitError("Khong the ket noi toi may chu de cap nhat thong tin.");
    } finally {
      setSaving(false);
    }
  }, [age, bio, gender, name, router]);

  return {
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
  };
}

function calculateAge(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const hasNotHadBirthdayThisYear =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate());

  if (hasNotHadBirthdayThisYear) {
    age -= 1;
  }

  return age;
}

function createApproximateDateOfBirth(age: number) {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${birthYear}-${month}-${day}`;
}

async function parseResponse(response: Response): Promise<unknown> {
  const raw = await response.text();

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return { message: raw };
  }
}

function getErrorMessage(payload: unknown) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = payload.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return "Cap nhat thong tin ca nhan chua thanh cong.";
}

export function useStoredProfile() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}
