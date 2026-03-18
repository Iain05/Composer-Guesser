/**
 * Encodes a slice of an AudioBuffer as a 16-bit PCM WAV Blob.
 * No external dependencies — WAV headers are written manually.
 *
 * @param buffer    decoded audio from the browser
 * @param startTime start of the excerpt in seconds
 * @param endTime   end of the excerpt in seconds
 */
export function exportWav(buffer: AudioBuffer, startTime: number, endTime: number): Blob {
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.floor(endTime * sampleRate);
  const numSamples = endSample - startSample;

  // Interleave channels into 16-bit PCM
  const pcm = new Int16Array(numSamples * numChannels);
  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = buffer.getChannelData(ch);
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[startSample + i]));
      pcm[i * numChannels + ch] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
  }

  const dataBytes = pcm.byteLength;
  const header = new ArrayBuffer(44);
  const v = new DataView(header);
  const str = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(offset + i, s.charCodeAt(i));
  };

  str(0, 'RIFF');
  v.setUint32(4, 36 + dataBytes, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  v.setUint32(16, 16, true);                           // PCM chunk size
  v.setUint16(20, 1, true);                            // PCM format
  v.setUint16(22, numChannels, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * numChannels * 2, true); // byte rate
  v.setUint16(32, numChannels * 2, true);              // block align
  v.setUint16(34, 16, true);                           // bits per sample
  str(36, 'data');
  v.setUint32(40, dataBytes, true);

  return new Blob([header, pcm.buffer], { type: 'audio/wav' });
}
