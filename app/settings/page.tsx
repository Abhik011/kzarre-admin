"use client";

import React, { useState } from "react";

type TabType = "general" | "maintenance";

export default function SystemConfigurationPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");

  /* =========================
     GENERAL SETTINGS STATE
  ========================= */
  const [general, setGeneral] = useState({
    siteTitle: "My Admin Panel",
    timeZone: "Asia/Kolkata",
    primaryColor: "#22c55e",
    secondaryColor: "#0f172a",
  });

  /* =========================
     MAINTENANCE STATE
  ========================= */
  const [maintenance, setMaintenance] = useState({
    autoBackup: true,
    developerAccess: false,

    // ✅ NEW
    maintenanceMode: false,
    maintenanceMessage: "We are under scheduled maintenance.",
    maintenanceEta: "",

    clearCache: false,
    rebuildIndex: false,
    forceLogoutAll: false,
    readOnlyMode: false,
    adminIpWhitelist: "",
  });

  /* =========================
     SAVE HANDLERS
  ========================= */
  const saveGeneralSettings = () => {
    console.log("General Settings:", general);
    alert("General settings saved successfully");
  };

  const saveMaintenanceSettings = () => {
    console.log("Maintenance Settings:", maintenance);
    alert("Maintenance & Advanced settings saved successfully");
  };

  const triggerManualBackup = () => {
    alert("Manual backup triggered successfully");
  };

  const runAdvancedAction = (action: string) => {
    alert(`${action} executed successfully`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold">System Configuration</h1>
        <p className="text-sm text-gray-500">
          General settings, maintenance mode, backups & advanced controls
        </p>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex gap-6 border-b pb-2">
        <button
          onClick={() => setActiveTab("general")}
          className={`text-sm font-medium ${
            activeTab === "general"
              ? "border-b-2 border-green-500 text-green-600"
              : "text-gray-500"
          }`}
        >
          GENERAL SETTINGS
        </button>

        <button
          onClick={() => setActiveTab("maintenance")}
          className={`text-sm font-medium ${
            activeTab === "maintenance"
              ? "border-b-2 border-green-500 text-green-600"
              : "text-gray-500"
          }`}
        >
          MAINTENANCE & ADVANCED
        </button>
      </div>

      {/* ================= GENERAL SETTINGS ================= */}
      {activeTab === "general" && (
        <div className="border rounded-xl p-6 space-y-6 max-w-3xl">
          <h3 className="font-semibold text-lg">General Settings</h3>

          <div>
            <label className="block text-sm mb-1">Site Title</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={general.siteTitle}
              onChange={(e) =>
                setGeneral({ ...general, siteTitle: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Time Zone</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={general.timeZone}
              onChange={(e) =>
                setGeneral({ ...general, timeZone: e.target.value })
              }
            >
              <option value="Asia/Kolkata">Asia / Kolkata</option>
              <option value="America/New_York">America / New York</option>
              <option value="America/Los_Angeles">
                America / Los Angeles
              </option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Primary Color</label>
              <input
                type="color"
                value={general.primaryColor}
                onChange={(e) =>
                  setGeneral({
                    ...general,
                    primaryColor: e.target.value,
                  })
                }
                className="w-full h-10 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Secondary Color</label>
              <input
                type="color"
                value={general.secondaryColor}
                onChange={(e) =>
                  setGeneral({
                    ...general,
                    secondaryColor: e.target.value,
                  })
                }
                className="w-full h-10 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Site Logo</label>
            <input
              type="file"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={saveGeneralSettings}
            className="bg-green-500 text-white px-6 py-2 rounded-lg"
          >
            Save General Settings
          </button>
        </div>
      )}

      {/* ================= MAINTENANCE & ADVANCED ================= */}
      {activeTab === "maintenance" && (
        <div className="space-y-6 max-w-4xl">
          {/* ===== MAINTENANCE MODE ===== */}
          <div className="border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">
              Website Under Maintenance
            </h3>

            <div className="flex justify-between items-center">
              <span>Enable Maintenance Mode</span>
              <input
                type="checkbox"
                checked={maintenance.maintenanceMode}
                onChange={(e) =>
                  setMaintenance({
                    ...maintenance,
                    maintenanceMode: e.target.checked,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Maintenance Message
              </label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={maintenance.maintenanceMessage}
                onChange={(e) =>
                  setMaintenance({
                    ...maintenance,
                    maintenanceMessage: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Estimated Restore Time
              </label>
              <input
                type="datetime-local"
                className="border rounded px-3 py-2 text-sm"
                value={maintenance.maintenanceEta}
                onChange={(e) =>
                  setMaintenance({
                    ...maintenance,
                    maintenanceEta: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* ===== BACKUPS ===== */}
          <div className="border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">Backups</h3>

            <div className="flex justify-between items-center">
              <span>Automatic Scheduled Backups</span>
              <input
                type="checkbox"
                checked={maintenance.autoBackup}
                onChange={(e) =>
                  setMaintenance({
                    ...maintenance,
                    autoBackup: e.target.checked,
                  })
                }
              />
            </div>

            <button
              onClick={triggerManualBackup}
              className="border px-4 py-2 rounded-lg"
            >
              Run Manual Backup
            </button>
          </div>

          {/* ===== ADVANCED SYSTEM CONTROLS ===== */}
          <div className="border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">Advanced Controls</h3>

            <button
              className="border px-4 py-2 rounded"
              onClick={() => runAdvancedAction("Cache Cleared")}
            >
              Clear System Cache
            </button>

            <button
              className="border px-4 py-2 rounded"
              onClick={() => runAdvancedAction("Search Index Rebuilt")}
            >
              Rebuild Search Index
            </button>

            <button
              className="border px-4 py-2 rounded text-red-600"
              onClick={() => runAdvancedAction("All Users Logged Out")}
            >
              Force Logout All Users
            </button>

            <div className="flex justify-between items-center">
              <span>Read-only Emergency Mode</span>
              <input
                type="checkbox"
                checked={maintenance.readOnlyMode}
                onChange={(e) =>
                  setMaintenance({
                    ...maintenance,
                    readOnlyMode: e.target.checked,
                  })
                }
              />
            </div>
          </div>

          {/* ===== DEVELOPER ACCESS ===== */}
          <div className="border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">
              Developer & Database Access
            </h3>

            <div className="flex justify-between items-center">
              <span>Advanced Database Tools</span>
              <input
                type="checkbox"
                checked={maintenance.developerAccess}
                onChange={(e) =>
                  setMaintenance({
                    ...maintenance,
                    developerAccess: e.target.checked,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Admin IP Whitelist
              </label>
              <input
                placeholder="e.g. 192.168.1.1, 103.21.244.0"
                className="w-full border rounded px-3 py-2 text-sm"
                value={maintenance.adminIpWhitelist}
                onChange={(e) =>
                  setMaintenance({
                    ...maintenance,
                    adminIpWhitelist: e.target.value,
                  })
                }
              />
            </div>

            <button
              onClick={saveMaintenanceSettings}
              className="bg-green-500 text-white px-6 py-2 rounded-lg"
            >
              Save Maintenance & Advanced Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
