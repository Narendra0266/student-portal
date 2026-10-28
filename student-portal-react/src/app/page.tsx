import { SplineSceneBasic } from "@/components/ui/demo";
import { PhotoGallery } from "@/components/ui/photo-gallery";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-gray-950 p-4 md:p-8 space-y-8">
      <div className="w-full max-w-6xl mt-4">
        <SplineSceneBasic />
      </div>
      <div className="w-full max-w-6xl pb-16">
        <PhotoGallery />
      </div>
    </main>
  );
}
