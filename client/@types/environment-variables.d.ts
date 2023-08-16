declare namespace NodeJS {
  export interface ProcessEnv {
    EMAIL_SMTP_HOST: string;
    EMAIL_SMTP_PORT: number;
    EMAIL_SMTP_SECURE: boolean;
    EMAIL_SMTP_REQUIRE_TLS: boolean;

    EMAIL_NO_REPLY: string;
    EMAIL_PASS: string;
  }
}
