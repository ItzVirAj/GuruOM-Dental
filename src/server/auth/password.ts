import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import { dictionary as commonDictionary } from "@zxcvbn-ts/language-common";
import { dictionary as enDictionary, translations } from "@zxcvbn-ts/language-en";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_ZXCVBN_SCORE,
  FORBIDDEN_PASSWORDS,
} from "./policy";

let zxcvbnInstance: ZxcvbnFactory | null = null;

function getZxcvbn(): ZxcvbnFactory {
  if (!zxcvbnInstance) {
    zxcvbnInstance = new ZxcvbnFactory({
      dictionary: {
        ...commonDictionary,
        ...enDictionary,
      },
      translations,
    });
  }
  return zxcvbnInstance;
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number;
  error?: string;
  feedback?: string;
}

export function validatePasswordStrength(
  password: string,
  userInputs: string[] = []
): PasswordValidationResult {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      score: 0,
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
    };
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return {
      isValid: false,
      score: 0,
      error: `Password must be at most ${PASSWORD_MAX_LENGTH} characters long.`,
    };
  }

  const normalized = password.toLowerCase();
  for (const forbidden of FORBIDDEN_PASSWORDS) {
    if (normalized.includes(forbidden.toLowerCase())) {
      return {
        isValid: false,
        score: 0,
        error: "Password contains a forbidden common pattern or sequence.",
      };
    }
  }

  const z = getZxcvbn();
  const result = z.check(password, userInputs);

  if (result.score < PASSWORD_MIN_ZXCVBN_SCORE) {
    const feedback =
      result.feedback.warning ||
      result.feedback.suggestions.join(" ") ||
      "Password is too predictable or easily guessable.";
    return {
      isValid: false,
      score: result.score,
      error: `Password strength is insufficient (Score ${result.score}/4, required ${PASSWORD_MIN_ZXCVBN_SCORE}/4). ${feedback}`,
      feedback,
    };
  }

  return {
    isValid: true,
    score: result.score,
  };
}
