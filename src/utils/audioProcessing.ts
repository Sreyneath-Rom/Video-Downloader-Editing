export async function decodeAudioFile(file: File): Promise<{
  audioBuffer: AudioBuffer;
  duration: number;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return {
    audioBuffer,
    duration: audioBuffer.duration
  };
}

export function extractPeaks(audioBuffer: AudioBuffer, numPeaks: number = 180): number[] {
  const channelData = audioBuffer.getChannelData(0);
  const step = Math.floor(channelData.length / numPeaks);
  const peaks: number[] = [];

  for (let i = 0; i < numPeaks; i++) {
    const start = i * step;
    let max = 0;
    for (let j = 0; j < step; j++) {
      const datum = Math.abs(channelData[start + j] || 0);
      if (datum > max) {
        max = datum;
      }
    }
    peaks.push(Math.min(1, max));
  }

  return peaks;
}

export function sliceAudioBuffer(
  audioBuffer: AudioBuffer,
  startSec: number,
  endSec: number,
  audioContext: AudioContext
): AudioBuffer {
  const sampleRate = audioBuffer.sampleRate;
  const startOffset = Math.floor(startSec * sampleRate);
  const endOffset = Math.floor(endSec * sampleRate);
  const frameCount = Math.max(1, endOffset - startOffset);
  const numberOfChannels = audioBuffer.numberOfChannels;

  const newBuffer = audioContext.createBuffer(numberOfChannels, frameCount, sampleRate);

  for (let ch = 0; ch < numberOfChannels; ch++) {
    const fromData = audioBuffer.getChannelData(ch);
    const toData = newBuffer.getChannelData(ch);
    for (let i = 0; i < frameCount; i++) {
      toData[i] = fromData[startOffset + i] || 0;
    }
  }

  return newBuffer;
}

export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sample: number = 0;
  let offset: number = 0;
  let pos: number = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit precision

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
