
import React from "react";

import HeroSlider from "../components/home/HeroSlider";
import CategoryProducts from "../components/home/Categories";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <HeroSlider />

      {/* Regular Fit */}
      <CategoryProducts
        title="Regular Fit"
        categorySlug="spider-man"
        badge="HOT"
      />

      {/* Drop Shoulder */}
      <CategoryProducts
        title="Drop Shoulder"
        categorySlug="chainsaw-man"
        badge="HOT SALE"
      />

      {/* Stranger Things */}
      <CategoryProducts
        title="Stranger Things"
        categorySlug="stranger-things"
        badge="NEW"
      />

      {/* Essentials */}
      <CategoryProducts
        title="Essentials"
        categorySlug="essentials"
        badge="HOT SALE"
      />
    </>
  );
}

