"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import WhiteBoard from '../_components/WhiteBoard'
import HistoryPage from '../history_page/page'

import "@tldraw/tldraw/tldraw.css";

export default function Dashboard() {
  const [selectedPage, setSelectedPage] = useState("dashboard");

  const renderSelectedPage = () => {
    switch (selectedPage) {
      case "history":
        return <HistoryPage />;
      default:
        return <WhiteBoard />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar onPlaygroundItemClick={(item) => setSelectedPage(item.title.toLowerCase())} />
      {renderSelectedPage()}
    </SidebarProvider>
  );
}