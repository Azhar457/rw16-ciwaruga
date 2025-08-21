"use client";
import { useState } from "react";

export default function BansosChart() {
  const [selectedProgram, setSelectedProgram] = useState("all");

  // Data dummy bantuan sosial
  const bansosData = {
    totalPenerima: 485,
    totalProgram: 6,
    totalNilai: 750000000,
    programs: [
      {
        name: "PKH (Program Keluarga Harapan)",
        penerima: 125,
        nilai: 200000000,
        target: 150,
        status: "aktif",
      },
      {
        name: "Bantuan Sembako",
        penerima: 150,
        nilai: 180000000,
        target: 160,
        status: "aktif",
      },
      {
        name: "BLT Dana Desa",
        penerima: 100,
        nilai: 150000000,
        target: 120,
        status: "aktif",
      },
      {
        name: "Bantuan Lansia",
        penerima: 60,
        nilai: 120000000,
        target: 65,
        status: "aktif",
      },
      {
        name: "Bantuan Disabilitas",
        penerima: 25,
        nilai: 50000000,
        target: 30,
        status: "aktif",
      },
      {
        name: "Beasiswa Anak Tidak Mampu",
        penerima: 25,
        nilai: 50000000,
        target: 30,
        status: "aktif",
      },
    ],
    byRT: [
      { rt: "001", penerima: 95 },
      { rt: "002", penerima: 88 },
      { rt: "003", penerima: 102 },
      { rt: "004", penerima: 78 },
      { rt: "005", penerima: 122 },
    ],
    timeline: [
      { month: "Jan", penerima: 450, nilai: 680000000 },
      { month: "Feb", penerima: 460, nilai: 690000000 },
      { month: "Mar", penerima: 470, nilai: 720000000 },
      { month: "Apr", penerima: 475, nilai: 730000000 },
      { month: "May", penerima: 480, nilai: 740000000 },
      { month: "Jun", penerima: 485, nilai: 750000000 },
    ],
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900">
          Data Bantuan Sosial RW 16
        </h3>
        <select
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">Semua Program</option>
          {bansosData.programs.map((program, index) => (
            <option key={index} value={program.name}>
              {program.name}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👥</div>
            <div>
              <p className="text-purple-100">Total Penerima</p>
              <p className="text-3xl font-bold">{bansosData.totalPenerima}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📋</div>
            <div>
              <p className="text-green-100">Total Program</p>
              <p className="text-3xl font-bold">{bansosData.totalProgram}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <div className="text-3xl mr-4">💰</div>
            <div>
              <p className="text-blue-100">Total Bantuan</p>
              <p className="text-lg font-bold">
                {formatRupiah(bansosData.totalNilai)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Detail */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">
          Detail Program Bantuan Sosial
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {bansosData.programs.map((program, index) => {
            const percentage = (program.penerima / program.target) * 100;

            return (
              <div
                key={index}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <h5 className="font-medium text-sm">{program.name}</h5>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      program.status === "aktif"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {program.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Penerima</span>
                    <span className="font-medium">
                      {program.penerima}/{program.target}
                    </span>
                  </div>

                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        percentage >= 90
                          ? "bg-green-500"
                          : percentage >= 70
                          ? "bg-yellow-500"
                          : "bg-orange-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{percentage.toFixed(1)}% dari target</span>
                    <span>{formatRupiah(program.nilai)}</span>
                  </div>
              </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribution by RT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">
            Distribusi Penerima per RT
          </h4>
          <div className="space-y-3">
            {bansosData.byRT.map((rt, index) => {
              const percentage = (rt.penerima / bansosData.totalPenerima) * 100;

              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">RT {rt.rt}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-sm font-medium">
                      {rt.penerima}
                    </span>
                  </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">
            Perkembangan Bantuan (6 Bulan Terakhir)
          </h4>
          <div className="space-y-3">
            {bansosData.timeline.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 border border-gray-200"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.month}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {item.penerima} penerima
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatRupiah(item.nilai)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}