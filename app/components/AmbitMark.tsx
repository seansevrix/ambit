export default function AmbitMark({ size = 44 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="grid place-items-center rounded-2xl bg-slate-900 text-white"
      aria-label="AMBIT"
    >
      <svg
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 3l8.5 18h-2.9l-1.8-4H8.2l-1.8 4H3.5L12 3Zm2.9 11.6L12 8.1l-2.9 6.5h5.8Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
