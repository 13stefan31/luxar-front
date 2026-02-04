import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Blogs from "@/components/homes/home-1/Blogs"; 
import Cars from "@/components/homes/home-1/Cars";
import Cta from "@/components/common/Cta";
import Facts from "@/components/homes/home-1/Facts";
import Features from "@/components/homes/home-1/Features";
import Features2 from "@/components/homes/home-1/Features2"; 
import Hero from "@/components/homes/home-1/Hero";

export const metadata = {
  title: "LUXAR TRADE – rent a car",
  description: "LUXAR TRADE – rent a car",
};
export default function HomePage1() {
  return (
    <>
      <Header1 />
      <Hero /> 
      <Features2 />
      <Cars />
      <Features />
      <Facts /> 
      <Blogs />
      <Cta />
      <Footer1 />
    </>
  );
}
