const BYTES_PER_MB = 1024 * 1024;
const bytesToMb = (bytes) => {
  return Math.floor(bytes / BYTES_PER_MB);
};
const mbToBytes = (mb) => {
  return mb * BYTES_PER_MB;
};

export { bytesToMb as b, mbToBytes as m };
//# sourceMappingURL=mathUtils.mjs.map
