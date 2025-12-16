import { useState, useEffect } from "react";
import { convertGoogleDriveUrl, getGoogleDriveImageUrls } from "@/lib/utils";

interface GoogleDriveImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}

export function GoogleDriveImage({ src, alt, className, onError }: GoogleDriveImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(convertGoogleDriveUrl(src));
  const [urlsToTry, setUrlsToTry] = useState<string[]>([]);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    // URL이 변경되면 초기화
    const converted = convertGoogleDriveUrl(src);
    setCurrentSrc(converted);
    setUrlsToTry(getGoogleDriveImageUrls(src));
    setErrorCount(0);
  }, [src]);

  const handleError = () => {
    if (errorCount < urlsToTry.length - 1) {
      // 다음 URL 시도
      const nextIndex = errorCount + 1;
      setCurrentSrc(urlsToTry[nextIndex]);
      setErrorCount(nextIndex);
    } else {
      // 모든 URL 시도 실패
      setCurrentSrc("https://via.placeholder.com/400?text=Image+Load+Error");
      onError?.();
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}

