export function generateRandomUsage(total: number) {
  const used = Math.random() * total;
  return {
    used: parseFloat(used.toFixed(1)),
    total: total,
  };
}

export default defineEventHandler((event) => {
  throw createError({ statusCode: 501, statusMessage: "Not Implemented" });
});
