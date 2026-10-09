import { ReactNode } from "react";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
import AnnouncementBar from "../common/AnnouncementBar";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
