import { TopNav } from "@/components/app/top-nav";
import { SAMPLE_USER } from "@/lib/sample-library";

/** Signed-in shell. Auth isn't wired yet, so there's no session check here. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <TopNav userName={SAMPLE_USER.name} />
      {children}
    </>
  );
}
