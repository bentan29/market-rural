import { BannerHomeApp } from "@/features/components/home";
import { FeaturedSection } from "@/features/components/home/publicaciones-destacadas/FeaturedSection";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">

      <BannerHomeApp/>

      <FeaturedSection />
      
    </div>
  );
}
