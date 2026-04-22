import {
  TRUST_SCORE_DEFAULT,
  TRUST_SCORE_MAX,
  TRUST_SCORE_MIN
} from "../../shared/constants/AppConstants";
import { ValidationError } from "../../shared/errors/AppError";

export type UserAttributes = Record<string, string | number | boolean | null>;

export interface UserProps {
  id: string;
  googleId?: string;
  email?: string;
  displayName: string;
  trustScore: number;
  attributes?: UserAttributes;
}

export class User {
  private readonly props: UserProps;

  constructor(props: Omit<UserProps, "trustScore"> & Partial<Pick<UserProps, "trustScore">>) {
    const trustScore = props.trustScore ?? TRUST_SCORE_DEFAULT;

    if (!props.id) {
      throw new ValidationError("User id is required.");
    }
    if (!props.displayName) {
      throw new ValidationError("Display name is required.");
    }
    if (trustScore < TRUST_SCORE_MIN || trustScore > TRUST_SCORE_MAX) {
      throw new ValidationError("Trust score is out of range.");
    }

    this.props = {
      id: props.id,
      googleId: props.googleId,
      email: props.email,
      displayName: props.displayName,
      trustScore,
      attributes: props.attributes ?? {}
    };
  }

  get id(): string {
    return this.props.id;
  }

  get googleId(): string | undefined {
    return this.props.googleId;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get trustScore(): number {
    return this.props.trustScore;
  }

  get attributes(): UserAttributes {
    return { ...this.props.attributes };
  }

  hasAttribute(key: string, expectedValue?: string | number | boolean | null): boolean {
    const attrs = this.props.attributes ?? {};
    if (!(key in attrs)) {
      return false;
    }
    if (typeof expectedValue === "undefined") {
      return true;
    }
    return attrs[key] === expectedValue;
  }

  adjustTrustScore(delta: number): User {
    const nextTrust = Math.max(
      TRUST_SCORE_MIN,
      Math.min(TRUST_SCORE_MAX, this.props.trustScore + delta)
    );

    return new User({
      ...this.props,
      trustScore: nextTrust
    });
  }

  toPrimitives(): UserProps {
    return {
      ...this.props,
      attributes: this.props.attributes ? { ...this.props.attributes } : {}
    };
  }
}
