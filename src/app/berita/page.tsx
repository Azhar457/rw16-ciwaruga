import { getBerita } from "@/lib/googleSheets";
import { Card } from "@/components/ui/Card";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export default async function BeritaPage() {
  const beritaList = await getBerita();

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Berita RW</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {beritaList.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500">
              Belum ada berita aktif.
            </div>
          ) : (
            beritaList.map((berita) => (
              <Card key={berita.id}>
                <h2 className="font-semibold text-lg">{berita.judul}</h2>
                <div className="mt-2">{berita.isi}</div>
                <div className="mt-2 text-xs text-gray-500">
                  {berita.tanggal}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Oleh: {berita.penulis}
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
