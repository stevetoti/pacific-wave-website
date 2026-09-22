import WebsiteFrame from "@/components/WebsiteFrame";
import WebsiteFooter from "@/components/WebsiteFooter";
import ContactWidgets from "@/components/ContactWidgets";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WebsiteFrame>{children}</WebsiteFrame>
      <WebsiteFooter />
      <ContactWidgets />
    </>
  );
}
