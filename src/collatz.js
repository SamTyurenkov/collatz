/** Forward Collatz trajectory until 1. */
export function collatzTrajectory(start) {
  const n = Math.floor(Number(start));
  if (!Number.isFinite(n) || n < 1) return [];
  const out = [n];
  let x = n;
  const guard = 500_000;
  let steps = 0;
  while (x !== 1 && steps < guard) {
    if (x % 2 === 0) x = x / 2;
    else x = 3 * x + 1;
    out.push(x);
    steps++;
  }
  return out;
}
