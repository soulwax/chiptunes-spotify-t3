export const APP_ERROR_CODES = {
  SPOTIFY_TOKEN_EXPIRED: "SPOTIFY_TOKEN_EXPIRED",
  SPOTIFY_PLAYLIST_NOT_ANALYZABLE: "SPOTIFY_PLAYLIST_NOT_ANALYZABLE",
  SPOTIFY_AUDIO_FEATURES_UNAVAILABLE:
    "SPOTIFY_AUDIO_FEATURES_UNAVAILABLE",
} as const;

export type AppErrorCode =
  (typeof APP_ERROR_CODES)[keyof typeof APP_ERROR_CODES];

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message?: string) {
    super(message ?? code);
    this.name = "AppError";
    this.code = code;
  }
}

export const isAppError = (value: unknown): value is AppError =>
  value instanceof AppError;
