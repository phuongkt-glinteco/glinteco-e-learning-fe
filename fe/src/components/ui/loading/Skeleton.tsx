interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: string;
  className?: string;
}

export default function Skeleton({
  width = '100%',
  height = '100%',
  rounded = 'rounded-xl',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-surface-container-highest ${rounded} ${className}`}
      style={{ width, height }}
    />
  );
}
