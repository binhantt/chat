import { ValidationError } from "../../shared/errors/AppError";

export interface PersonalDetailProps {
  gender?: string;
  birthDate?: string;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VN_DATE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/;

const normalizeOptionalText = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeGender = (value: unknown): string | undefined => {
  const normalized = normalizeOptionalText(value)?.toLowerCase();
  if (!normalized) {
    return undefined;
  }

  if (normalized === "male") return "nam";
  if (normalized === "female") return "nu";
  if (normalized === "other") return "khac";

  return normalized;
};

const normalizeBirthDate = (value: unknown): string | undefined => {
  const normalized = normalizeOptionalText(value);
  if (!normalized) {
    return undefined;
  }

  if (ISO_DATE_PATTERN.test(normalized)) {
    return normalized;
  }

  if (VN_DATE_PATTERN.test(normalized)) {
    const [day, month, year] = normalized.split("/");
    return `${year}-${month}-${day}`;
  }

  throw new ValidationError("Birth date must use YYYY-MM-DD or DD/MM/YYYY format.");
};

export class PersonalDetail {
  private readonly props: PersonalDetailProps;

  constructor(props: PersonalDetailProps = {}) {
    this.props = {
      gender: normalizeGender(props.gender),
      birthDate: normalizeBirthDate(props.birthDate)
    };
  }

  get gender(): string | undefined {
    return this.props.gender;
  }

  get birthDate(): string | undefined {
    return this.props.birthDate;
  }

  isEmpty(): boolean {
    return !this.props.gender && !this.props.birthDate;
  }

  toPrimitives(): PersonalDetailProps {
    return {
      ...this.props
    };
  }
}
