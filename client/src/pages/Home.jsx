import React from "react";

import HeroSlider from "../components/home/HeroSlider";
import CategoryProducts from "../components/home/Categories";
import NewArrivals from "../components/home/NewArrivals";
import SaleProducts from "../components/home/SaleProducts";
import PromoBanners from "../components/home/PromoBanners";

export default function Home() {
  return (
    <div className="space-y-10 pb-20 overflow-hidden">

      {/* Hero */}
      <HeroSlider />

      {/* Spider-Man */}
      <CategoryProducts
        title="Spider-Man"
        categorySlug="spider-man"
        badge="HOT"
      />

      {/* Chainsaw Man */}
      <CategoryProducts
        title="Chainsaw Man"
        categorySlug="chainsaw-man"
        badge="HOT SALE"
      />

      {/* Stranger Things */}
      <CategoryProducts
        title="Stranger Things"
        categorySlug="stranger-things"
        badge="NEW"
      />

      {/* Ghost Rider */}
      <CategoryProducts
        title="Ghost Rider"
        categorySlug="ghost-rider"
        badge="HOT SALE"
      />

      {/* Essentials */}
      <CategoryProducts
        title="Essentials"
        categorySlug="essentials"
        badge="HOT SALE"
      />

      {/* Anime */}
      <CategoryProducts
        title="Anime"
        categorySlug="anime"
        badge="HOT SALE"
      />

      {/* Venom */}
      <CategoryProducts
        title="Venom"
        categorySlug="venom"
        badge="HOT SALE"
      />

    </div>
  );
}