export type Category = 'PROGRAMMING' | 'AIGC';

export const CATEGORY_LABELS: Record<Category, string> = {
  PROGRAMMING: '图形化编程',
  AIGC: 'AIGC 创意',
};

export interface StudentSubmission {
  id: string;
  studentName: string;
  grade: number;
  classNumber: number;
  category: Category;
  workTitle: string;
  fileName: string;
  storedFileName: string;
  fileType: string;
  fileSize: number;
  submittedAt: string;
}

export interface SortConfig {
  key: keyof StudentSubmission;
  direction: 'asc' | 'desc';
}

export const ALLOWED_EXTENSIONS: Record<Category, string[]> = {
  PROGRAMMING: ['.sb3', '.mp'],
  AIGC: ['.png', '.jpg', '.jpeg'],
};
