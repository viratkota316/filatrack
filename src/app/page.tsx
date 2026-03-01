"use client";
import { useState } from "react";
import { useAuth, useInventory, usePrintHistory, useProjects } from "@/hooks/useStore";
import LoginForm from "@/components/LoginForm";
import Dashboard from "@/components/dashboard/Dashboard";
import InventoryList from "@/components/inventory/InventoryList";
import PrintHistory from "@/components/history/PrintHistory";
import ProjectList from "@/components/projects/ProjectList";

const tabs = ["Dashboard", "Inventory", "History", "Projects"] as const;
const tabIcons = ["🖨️", "📦", "📋", "📁"];

export default function Home() {
  const auth = useAuth();
  const inventory = useInventory();
  const history = usePrintHistory();
  const projectStore = useProjects();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Dashboard");

  if (!auth.isLoggedIn) {
    return <LoginForm auth={auth} />;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">FilaTrack</h1>
        <button
          onClick={auth.logout}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Logout
        </button>
      </header>

      {/* Content */}
      <main className="p-4">
        {activeTab === "Dashboard" && (
          <Dashboard token={auth.token!} />
        )}
        {activeTab === "Inventory" && (
          <InventoryList inventory={inventory} />
        )}
        {activeTab === "History" && (
          <PrintHistory
            token={auth.token!}
            history={history}
            spools={inventory.spools}
            projects={projectStore.projects}
          />
        )}
        {activeTab === "Projects" && (
          <ProjectList
            projects={projectStore}
            tasks={history.tasks}
          />
        )}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-20">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center text-xs px-3 py-1 ${
              activeTab === tab
                ? "text-blue-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            <span className="text-lg">{tabIcons[i]}</span>
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
}
