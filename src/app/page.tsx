import { WindowView } from "@/components/window-view";

export default function Home() {
  return (
    <div className="min-h-full bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-20 lg:px-12">
        <h1 className="mb-10 text-center text-3xl font-semibold tracking-tight text-white sm:mb-14 sm:text-4xl lg:text-5xl">
          Your view to the world outside
        </h1>

        <WindowView />

        <p className="mx-auto mt-10 max-w-2xl text-center text-base leading-7 text-white sm:text-lg">
          To my fellow colleagues and public officers who do not have access to a window, this site is dedicated to you.
        </p>

        <p className="mt-6 text-center text-sm text-white">
          Alfred Leong (HSA) - #TechForPublicGood
        </p>
      </div>
    </div>
  );
}
