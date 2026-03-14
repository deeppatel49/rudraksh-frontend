import { Suspense } from "react";
import { ProfileSetupView } from "../../components/profile-setup-view";

export const metadata = {
  title: "Profile Setup",
  description: "Complete or edit your customer profile details.",
};

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={null}>
      <ProfileSetupView />
    </Suspense>
  );
}
