interface AvatarProps {
  letter: string;
  color: string;
  size?: number;
}
export function Avatar({ letter, color, size = 36 }: AvatarProps) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold text-white shrink-0"
      style={{ background: color, width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden
    >
      {letter}
    </div>
  );
}
