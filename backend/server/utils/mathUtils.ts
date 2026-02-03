export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ---------------------------------------------
// Unit conversion
// API: bytes
// DB : MB (Int)
// ---------------------------------------------
const BYTES_PER_MB = 1024 * 1024;

export const bytesToMb = (bytes: number): number => {
  // DBはInt想定なので切り捨て（必要なら round/ceil に変更）
  return Math.floor(bytes / BYTES_PER_MB);
};

export const mbToBytes = (mb: number): number => {
  return mb * BYTES_PER_MB;
};
