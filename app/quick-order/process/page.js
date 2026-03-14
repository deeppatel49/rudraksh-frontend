import { QuickOrderProcessingView } from "../../components/quick-order-processing-view";

export const metadata = {
  title: "Prescription Processing",
  description: "Choose how your uploaded prescriptions should be processed.",
};

export default function QuickOrderProcessPage() {
  return <QuickOrderProcessingView />;
}
