/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaUsers,
  FaStore,
  FaNewspaper,
  FaBriefcase,
  FaBuilding,
  FaUserTie,
  FaUserShield,
  FaHistory,
} from "react-icons/fa";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { useSession } from "@/hooks/useSession"; // Import useSession hook

// Define types for the data fetched from the API
interface DashboardData {
  [key: string]: any[];
}
interface Endpoint {
  key: string;
  label: string;
  url: string;
  icon: JSX.Element;
}

const endpoints: Endpoint[] = [
  { key: "warga", label: "Warga", url: "/api/warga", icon: <FaUsers /> },
  { key: "umkm", label: "UMKM", url: "/api/umkm", icon: <FaStore /> },
  { key: "berita", label: "Berita", url: "/api/berita", icon: <FaNewspaper /> },
  { key: "loker", label: "Loker", url: "/api/loker", icon: <FaBriefcase /> },
  {
    key: "lembaga",
    label: "Lembaga Desa",
    url: "/api/lembaga-desa",
    icon: <FaBuilding />,
  },
  { key: "bph", label: "BPH", url: "/api/bph", icon: <FaUserTie /> },
  {
    key: "account",
    label: "Account",
    url: "/api/account",
    icon: <FaUserShield />,
  },
  { key: "log", label: "Log Aktivitas", url: "/api/log", icon: <FaHistory /> },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession(); // Gunakan useSession
  const [activeTab, setActiveTab] = useState("warga");
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!sessionLoading) {
      if (
        !session?.user ||
        !session.user.role.toLowerCase().includes("admin")
      ) {
        router.push("/auth/login");
      } else {
        fetchAll();
      }
    }
  }, [session, sessionLoading, router]);

  async function fetchAll() {
    setLoading(true);
    const result: DashboardData = {};
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep.url, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          credentials: "include",
        });
        if (!res.ok) {
          const error = await res.json();
          setErrors((prev) => ({
            ...prev,
            [ep.key]: error.message || `Error fetching ${ep.label}`,
          }));
          continue;
        }

        const json = await res.json();
        result[ep.key] = Array.isArray(json) ? json : json.data || [];

        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[ep.key];
          return newErrors;
        });
      } catch (error) {
        console.error(`Error fetching ${ep.url}:`, error);
        setErrors((prev) => ({
          ...prev,
          [ep.key]: `Failed to load ${ep.label}`,
        }));
        result[ep.key] = [];
      }
    }

    setData(result);
    setLoading(false);
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth/login", { method: "DELETE" });

      if (res.ok) {
        router.push("/auth/login");
      } else {
        alert("Logout gagal, silakan coba lagi.");
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
      alert("Terjadi kesalahan, silakan coba lagi.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  const filteredData =
    data[activeTab]?.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) || [];

  if (sessionLoading || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-lg p-6 mb-8 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Dashboard Admin
              </h1>
              <p className="text-emerald-50">
                Kelola user, log, sistem keamanan & seluruh data
              </p>
            </div>
            <div className="text-right text-white">
              <p className="font-medium">{session.user.nama_lengkap}</p>
              <p className="text-sm text-emerald-100">{session.user.role}</p>
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="destructive"
                size="sm"
                className="mt-2"
              >
                {isLoggingOut ? <LoadingSpinner size="sm" /> : "Logout"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {endpoints.map((ep) => (
            <div
              key={ep.key}
              className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
                activeTab === ep.key ? "border-emerald-500" : "border-gray-200"
              } hover:shadow-lg transition-all cursor-pointer`}
              onClick={() => setActiveTab(ep.key)}
            >
              <div className="flex items-center">
                <div
                  className={`p-3 rounded-full ${
                    activeTab === ep.key
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {ep.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {ep.label}
                  </h3>
                  <p className="text-gray-500">
                    {data[ep.key]?.length || 0} data
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Data {endpoints.find((e) => e.key === activeTab)?.label}
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {errors[activeTab] && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              ⚠️ {errors[activeTab]}
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {filteredData[0] &&
                      Object.keys(filteredData[0]).map((col) => (
                        <th
                          key={col}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {col.replace(/_/g, " ")}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {Object.values(row).map((val, j) => (
                        <td
                          key={j}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan={100}
                        className="text-center py-8 text-gray-500"
                      >
                        Tidak ada data yang ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
