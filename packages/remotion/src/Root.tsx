import { Composition } from "remotion";
import { ArbitrumPromoVideo } from "./Video";
import {
  FPS,
  TOTAL_DURATION_FRAMES,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "./data/manifest";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ArbitrumPromo"
      component={ArbitrumPromoVideo}
      durationInFrames={TOTAL_DURATION_FRAMES}
      fps={FPS}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
    />
  );
};
