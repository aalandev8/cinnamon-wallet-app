import Image from "next/image";
import type { MascotState } from "@/components/Mascot";

const ALT: Record<MascotState, string> = {
  idle: "Cinnamon, a cinnamon-roll mascot, waving hello",
  sending: "Cinnamon reaching out to catch coins",
  success: "Cinnamon celebrating",
  blocked: "Cinnamon holding up a stop sign",
  loading: "Cinnamon waiting patiently",
};

type Props = {
  poses: MascotState[];
  /** Pose visible without JavaScript or with reduced motion. Defaults to the first pose. */
  shown?: MascotState;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/**
 * All poses stacked in one box; GSAP crossfades their opacity, so swapping a pose never
 * remounts an image (no flicker). Target a layer with `[data-pose="name"]`.
 */
export function PoseStack({ poses, shown = poses[0], priority, sizes = "(min-width: 768px) 40vw, 80vw", className = "" }: Props) {
  return (
    <div className={`relative aspect-square ${className}`}>
      {poses.map((p) => (
        <Image
          key={p}
          data-pose={p}
          src={`/mascot/${p}.png`}
          alt={p === shown ? ALT[p] : ""}
          aria-hidden={p === shown ? undefined : true}
          width={1024}
          height={1024}
          sizes={sizes}
          priority={priority && p === shown}
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-contain"
          style={{ opacity: p === shown ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
