export default function SkeletonCard() {
  return (
    <div className="group relative overflow-hidden rounded bg-[#23252b] border border-white/5">
      <div className="skeleton aspect-[2/3] w-full" />
      <div className="p-3.5 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
      <div className="absolute top-2.5 left-2.5">
        <div className="skeleton h-6 w-10 rounded" />
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative w-full overflow-hidden rounded bg-[#23252b] border border-white/10" style={{ height: "420px" }}>
      <div className="skeleton absolute inset-0" />
      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
        <div className="skeleton h-8 w-2/3 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="flex gap-3 mt-4">
          <div className="skeleton h-12 w-40 rounded" />
          <div className="skeleton h-12 w-32 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRankItem() {
  return (
    <div className="flex items-center gap-3 p-3 rounded bg-[#141519]">
      <div className="skeleton h-8 w-8 rounded shrink-0" />
      <div className="skeleton h-14 w-10 rounded shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded overflow-hidden bg-[#23252b] border border-white/5">
          <div className="skeleton aspect-[2/3] w-full" />
          <div className="p-3.5 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
