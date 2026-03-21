import BouncingLoader from "@/components/ui/BouncingLoader";

export default function PublicLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <BouncingLoader />
    </div>
  );
}
