import React from "react";
import HeroSlider from "../components/home/HeroSlider";
import Categories from "../components/home/Categories";
import NewArrivals from "../components/home/NewArrivals";
import SaleProducts from "../components/home/SaleProducts";
import PromoBanners from "../components/home/PromoBanners";
export default function Home() {
  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      <HeroSlider />
      <Categories />
      <NewArrivals />
      <SaleProducts />
      <PromoBanners />
    </div>
  );
}
