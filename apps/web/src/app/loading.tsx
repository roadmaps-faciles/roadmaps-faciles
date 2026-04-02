import { ClipLoader } from "@/components/ReactSpinners";

const DefaultLoading = () => {
  return (
    <div className="flex flex-1 items-center justify-center my-10">
      <ClipLoader color="hsl(var(--muted-foreground))" size="4em" />
    </div>
  );
};

export default DefaultLoading;
