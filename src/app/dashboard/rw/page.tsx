import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from "@/lib/encrypt";
import { readGoogleSheet } from "@/lib/googleSheets";
import RwDashboardClient from "@/components/dashboard/rwdashboardclient"; 
import { SessionUser, WargaData } from '@/lib/auth';

/**
 * Mengambil sesi pengguna dari cookie di server.
 * @returns {Promise<SessionUser | null>} Data sesi pengguna atau null jika tidak valid.
 */
async function getServerSession(): Promise<SessionUser | null> {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) return null;
    
    try {
        const sessionData = await decrypt(sessionCookie);
        return sessionData as SessionUser;
    } catch (error) {
        console.error("Gagal mendekripsi sesi di server:", error);
        return null;
    }
}

/**
 * Mengambil dan memfilter data warga untuk RW tertentu langsung di server.
 * @param {string} rw - Nomor RW yang akan dicari.
 * @returns {Promise<WargaData[]>} Daftar warga yang sesuai.
 */
async function getWargaForRw(user: SessionUser): Promise<WargaData[]> {
    try {
        const allWarga = await readGoogleSheet<WargaData>("warga");
        
        // --- PERBAIKAN UTAMA DI SINI ---
        // Mengubah kedua nilai menjadi String sebelum membandingkan
        // untuk mengatasi perbedaan tipe data (angka vs teks).
        const filteredWarga = allWarga.filter(warga => String(warga.rw) === String(user.rw_akses));
        
        return filteredWarga;
    } catch (error) {
        console.error("Gagal mengambil data warga di server:", error);
        return [];
    }
}

// Komponen Server utama untuk halaman dasbor RW
export default async function RWDashboardPage() {
    const session = await getServerSession();

    if (!session || !['ketua_rw', 'admin_rw'].includes(session.role)) {
        redirect('/auth/login');
    }

    const wargaData = await getWargaForRw(session);

    return (
        <RwDashboardClient initialWarga={wargaData} session={session} />
    );
}