export const metadata = {
  title: {
    default: "Admin | Rudraksh Pharmacy",
    template: "%s | Rudraksh Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }) {
  return <>{children}</>;
}
