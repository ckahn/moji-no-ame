import type { BannerInfo } from "../game/types";

export function Banner({ banner }: { banner: BannerInfo }) {
  return (
    <div className="banner">
      <div className="banner-title kr-jp">{banner.text}</div>
      <div className="banner-sub">{banner.sub}</div>
    </div>
  );
}
