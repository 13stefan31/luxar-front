import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Blogs from "@/components/homes/home-1/Blogs";
import Cars from "@/components/homes/home-1/Cars";
import Cta from "@/components/common/Cta";
import Features from "@/components/homes/home-1/Features";
import Features2 from "@/components/homes/home-1/Features2";
import Hero from "@/components/homes/home-1/Hero";
import { createLocalizedMetadata } from "@/lib/metadataHelper";

export const generateMetadata = createLocalizedMetadata({
  titleKey: "meta.home.title",
  titleFallback: "LUXAR TRADE – rent a car",
  descriptionKey: "meta.home.description",
  descriptionFallback: "Rent a car in Montenegro with LUXAR TRADE.",
  appendBrandSuffix: false,
});

export default function HomePage1() {
  return (
    <>
      <Header1 />
      <Hero />
      <Features2 />
      <Cars />
      <Features />
      <Blogs />
      <Cta />
      <Footer1 />
    </>
  );
}
