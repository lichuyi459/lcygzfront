interface EnvConfig {
  VITE_API_BASE_URL?: string;
  VITE_CONTEST_NAME?: string;
  VITE_SCHOOL_NAME?: string;
  VITE_CONTEST_DEADLINE?: string;
}

const env = import.meta.env as EnvConfig;

export const API_BASE_URL: string = env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export const CONTEST_NAME: string = env.VITE_CONTEST_NAME ?? '2025图形化编程创意赛';

export const SCHOOL_NAME: string = env.VITE_SCHOOL_NAME ?? '中山市光正实验学校';

export const CONTEST_DEADLINE: string =
  env.VITE_CONTEST_DEADLINE ?? '2025-12-30T23:59:59.000Z';

