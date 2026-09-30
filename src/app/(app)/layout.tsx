import { TopNav } from "@/components/app/top-nav";
import { ToastProvider } from "@/components/app/use-toast";
import { getProfile } from "@/lib/profile";

/** Signed-in shell. Auth isn't wired yet, so there's no session check here. */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const profile = await getProfile();
  return (
    <ToastProvider>
      <TopNav
        userName={profile.displayName}
        username={profile.username}
        avatarUrl={profile.avatarUrl}
      />
      {children}
    </ToastProvider>
  );
}
