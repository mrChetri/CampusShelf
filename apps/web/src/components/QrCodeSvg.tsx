import React from 'react';

interface QrCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Deterministic client-side SVG QR code pattern generator.
 * Renders authentic corner finder patterns (7x7) and data modules
 * derived from string hash without external network calls or dependencies.
 */
export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({
  value,
  size = 140,
  className = '',
}) => {
  const MATRIX_SIZE = 25;

  // Simple string hash for deterministic data pattern
  const hash = Array.from(value).reduce(
    (acc, char, i) => (acc * 31 + char.charCodeAt(0) * (i + 1)) % 2147483647,
    7
  );

  // Initialize matrix
  const matrix: boolean[][] = Array.from({ length: MATRIX_SIZE }, () =>
    Array(MATRIX_SIZE).fill(false)
  );

  // Draw 7x7 finder patterns at top-left, top-right, bottom-left
  const drawFinder = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startRow + r][startCol + c] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0); // Top-left
  drawFinder(0, MATRIX_SIZE - 7); // Top-right
  drawFinder(MATRIX_SIZE - 7, 0); // Bottom-left

  // Timing lines
  for (let i = 8; i < MATRIX_SIZE - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Populate data modules deterministically
  let seed = hash;
  for (let r = 0; r < MATRIX_SIZE; r++) {
    for (let c = 0; c < MATRIX_SIZE; c++) {
      // Skip finder zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= MATRIX_SIZE - 8;
      const inBottomLeft = r >= MATRIX_SIZE - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      // Skip timing patterns
      if (r === 6 || c === 6) continue;

      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      matrix[r][c] = (seed % 3 === 0) || ((r + c) % 5 === 0);
    }
  }

  const cellSize = size / MATRIX_SIZE;

  return (
    <svg
      data-testid="qr-code-svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`bg-white p-2 rounded-lg ${className}`}
      aria-label={`QR code for ${value}`}
    >
      <rect width={size} height={size} fill="#ffffff" />
      {matrix.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.3}
              height={cellSize + 0.3}
              fill="#064e3b"
            />
          ) : null
        )
      )}
    </svg>
  );
};
