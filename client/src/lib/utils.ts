import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Google Drive URL에서 파일 ID 추출
function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;
  
  // /file/d/FILE_ID 패턴 (가장 일반적, view?usp=sharing, view?usp=share_link 등 포함)
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch) {
    return fileIdMatch[1];
  }
  
  // /d/FILE_ID 패턴 (간단한 형식)
  const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch) {
    return dMatch[1];
  }
  
  // id=FILE_ID 패턴
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) {
    return idMatch[1];
  }
  
  return null;
}

// Google Drive URL을 이미지 URL로 변환하는 함수 (여러 형식 시도)
export function convertGoogleDriveUrl(url: string): string {
  if (!url) return url;
  
  // 이미 직접 이미지 URL인 경우
  if (url.includes('uc?export=view') || url.includes('uc?id=') || url.includes('lh3.googleusercontent.com')) {
    return url;
  }
  
  // Google Drive 공유 링크에서 파일 ID 추출
  const fileId = extractGoogleDriveFileId(url);
  
  if (fileId) {
    // Google Drive 이미지 직접 접근 URL로 변환
    // 참고: 파일이 "링크가 있는 모든 사용자"로 공유되어 있어야 함
    // 여러 형식 중 가장 안정적인 형식 사용
    const convertedUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    // #region agent log
    console.log('[convertGoogleDriveUrl]', { original: url, fileId, converted: convertedUrl });
    // #endregion
    return convertedUrl;
  }
  
  // 이미지 URL인 경우 그대로 반환
  if (url.match(/\.(jpg|jpeg|png|gif|webp)/i) || url.startsWith('http')) {
    // #region agent log
    console.log('[convertGoogleDriveUrl]', { original: url, action: 'returned as-is (image URL)' });
    // #endregion
    return url;
  }
  
  // #region agent log
  console.warn('[convertGoogleDriveUrl]', { original: url, action: 'no conversion applied' });
  // #endregion
  return url;
}

// Google Drive 이미지 URL의 대체 형식들을 생성 (fallback용)
export function getGoogleDriveImageUrls(url: string): string[] {
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) {
    return [url]; // 파일 ID를 추출할 수 없으면 원본 URL만 반환
  }
  
  // 여러 형식의 URL을 시도 (순서 중요)
  return [
    `https://drive.google.com/uc?export=view&id=${fileId}`, // 가장 일반적
    `https://drive.google.com/uc?id=${fileId}`, // 대체 형식
    `https://lh3.googleusercontent.com/d/${fileId}=w1920`, // 썸네일 (고해상도)
    `https://lh3.googleusercontent.com/d/${fileId}`, // 썸네일 (기본)
    url, // 원본 URL도 마지막에 시도
  ];
}
