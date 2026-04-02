import { Skeleton } from "@roadmaps-faciles/ui/components/skeleton";

const AdminLoading = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  </div>
);

export default AdminLoading;
