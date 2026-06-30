import { Avatar as ShadcnAvatar, AvatarFallback, AvatarImage } from '@/components/ui/default/avatar';

interface AvatarProps {
  name?: string;
  hue?: number;
  size?: number;
  ring?: boolean;
}

export default function Avatar({ name, hue = 162, size = 40, ring = false }: AvatarProps) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <ShadcnAvatar
      className={`rounded-lg ${ring ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      style={{
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
      }}
    >
      <AvatarFallback
        className="font-medium rounded-lg"
        style={{
          fontSize: `${size * 0.35}px`,
          color: `oklch(0.16 0.04 ${hue})`,
          backgroundColor: `oklch(0.74 0.15 ${hue})`,
          border: `2px solid oklch(0.45 0.08 ${hue})`,
        }}
      >
        {initials}
      </AvatarFallback>
    </ShadcnAvatar>
  );
}
