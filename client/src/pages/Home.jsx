
import React from "react";

import HeroSlider from "../components/home/HeroSlider";
import CategoryProducts from "../components/home/Categories";
import NewArrivals from "../components/home/NewArrivals";

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <HeroSlider />

{/* NEW ARRIVALS */}
<NewArrivals />

{/* REGULAR FIT */}
<CategoryProducts
  title="Regular Fit"
  categorySlug="regular-fit"
  badge="HOT"
/>
    </div>
  );
}

