import BouncingLoader from "@/components/ui/BouncingLoader";

export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF8F4]">
      <BouncingLoader />
    </div>
  );
}
