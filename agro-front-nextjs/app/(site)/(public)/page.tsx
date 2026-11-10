import { BannerHomeApp } from "@/features/components/home";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">

      <BannerHomeApp/>

      {/* <main className="flex flex-1 w-full flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <p>MarketRural.</p>
        <p>Toda la maquinaria rural, en un solo lugar.</p>
      </main> */}
    </div>
  );
}
