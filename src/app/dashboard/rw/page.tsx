import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from "@/lib/encrypt";
import { readGoogleSheet } from "@/lib/googleSheets";
// --- PERBAIKAN DI SINI: Pastikan nama file impornya sama persis ---
import RwDashboardClient from "@/components/dashboard/rwdashboardclient"; 
import { SessionUser, WargaData } from '@/lib/auth';

// Fungsi untuk mendapatkan sesi di Server Component
async function getServerSession(): Promise<SessionUser | null> {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) return null;
    try {
        const sessionData = await decrypt(sessionCookie);
        return sessionData as SessionUser;
    } catch (error) {
        return null;
    }
}

// Fungsi untuk mengambil data warga langsung dari sumbernya di server
async function getWargaForRw(rw: string): Promise<WargaData[]> {
    try {
        const allWarga = await readGoogleSheet<WargaData>("warga");
        // Filter di server untuk efisiensi
        return allWarga.filter(warga => warga.rw === rw);
    } catch (error) {
        console.error("Failed to fetch warga data on server:", error);
        return [];
    }
}

// Ini adalah Server Component utama untuk halaman dashboard RW
export default async function RWDashboardPage() {
    const session = await getServerSession();

    // 1. Cek keamanan di server, jika gagal, langsung redirect
    if (!session || !['ketua_rw', 'admin_rw'].includes(session.role)) {
        redirect('/auth/login');
    }

    // 2. Ambil data warga di server
    const wargaData = await getWargaForRw(session.rw_akses);

    // 3. Render Client Component dan kirim data sebagai props
    return (
        <RwDashboardClient initialWarga={wargaData} session={session} />
    );
}