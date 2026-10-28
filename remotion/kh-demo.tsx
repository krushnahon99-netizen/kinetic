import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import type { KhFillMode } from "./scenes/kh-fill";
import { ShowreelPicture } from "./showreel";

/** The demo is the reel's last 4 s: Depth's last beat (330), the montage, the KH fill and the end card. */
export const KH_DEMO = { from: 330, durationInFrames: 120 } as const;

export type KhDemoProps = { fill: KhFillMode };

export const KhDemo = ({ fill }: KhDemoProps) => (
  <AbsoluteFill>
    <Sequence from={-KH_DEMO.from} name="reel">
      <ShowreelPicture fill={fill} />
    </Sequence>
    <Audio src={staticFile("showreel/reel.wav")} trimBefore={KH_DEMO.from} />
  </AbsoluteFill>
);
