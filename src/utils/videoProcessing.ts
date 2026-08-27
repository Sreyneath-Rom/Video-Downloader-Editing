export async function captureVideoFrame(
  videoElement: HTMLVideoElement,
  targetTimeInSeconds: number,
  format: 'image/png' | 'image/jpeg' = 'image/png'
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!videoElement) {
      reject(new Error('Video element not available'));
      return;
    }

    const handleSeeked = () => {
      try {
        const width = videoElement.videoWidth || 1280;
        const height = videoElement.videoHeight || 720;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2D canvas context'));
          return;
        }

        ctx.drawImage(videoElement, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(format, 0.95);
        videoElement.removeEventListener('seeked', handleSeeked);
        resolve(dataUrl);
      } catch (err) {
        videoElement.removeEventListener('seeked', handleSeeked);
        reject(err);
      }
    };

    videoElement.addEventListener('seeked', handleSeeked, { once: true });
    videoElement.currentTime = targetTimeInSeconds;
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
