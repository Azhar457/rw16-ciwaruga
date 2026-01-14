-- AlterTable
ALTER TABLE `warga` ADD COLUMN `last_verified` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `umkm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_usaha` VARCHAR(191) NOT NULL,
    `pemilik_nik_encrypted` VARCHAR(191) NULL,
    `jenis_usaha` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `no_hp` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NULL,
    `foto_url` VARCHAR(191) NULL,
    `status_verifikasi` VARCHAR(191) NULL,
    `admin_approver` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `linked_warga_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loker` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `posisi` VARCHAR(191) NOT NULL,
    `perusahaan` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NULL,
    `gambar_url` VARCHAR(191) NULL,
    `requirements` TEXT NULL,
    `salary_range` VARCHAR(191) NULL,
    `lokasi` VARCHAR(191) NULL,
    `contact_method` VARCHAR(191) NULL,
    `contact_person` VARCHAR(191) NULL,
    `status_aktif` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `admin_poster` VARCHAR(191) NULL,
    `deadline` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bph` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `jabatan` VARCHAR(191) NOT NULL,
    `periode_start` VARCHAR(191) NULL,
    `periode_end` VARCHAR(191) NULL,
    `foto_url` VARCHAR(191) NULL,
    `kontak` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `status_aktif` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lembaga_desa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_lembaga` VARCHAR(191) NOT NULL,
    `ketua` VARCHAR(191) NULL,
    `sekretaris` VARCHAR(191) NULL,
    `bendahara` VARCHAR(191) NULL,
    `program_kerja` TEXT NULL,
    `kontak` VARCHAR(191) NULL,
    `alamat_sekretariat` VARCHAR(191) NULL,
    `status_aktif` VARCHAR(191) NOT NULL DEFAULT 'Aktif',
    `logo_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `berita` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `konten` LONGTEXT NULL,
    `kategori` VARCHAR(191) NULL,
    `penulis` VARCHAR(191) NULL,
    `foto_url` VARCHAR(191) NULL,
    `status_publish` VARCHAR(191) NULL DEFAULT 'Draft',
    `views` INTEGER NOT NULL DEFAULT 0,
    `admin_approver` VARCHAR(191) NULL,
    `published_at` VARCHAR(191) NULL,
    `lembaga_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rw_code` VARCHAR(191) NOT NULL,
    `nama_rw` VARCHAR(191) NOT NULL,
    `contact_person` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `start_date` VARCHAR(191) NULL,
    `end_date` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `payment_proof` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscriptions_rw_code_key`(`rw_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_aktivitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_email` VARCHAR(191) NULL,
    `user_role` VARCHAR(191) NULL,
    `action_type` VARCHAR(191) NOT NULL,
    `table_affected` VARCHAR(191) NULL,
    `record_id` VARCHAR(191) NULL,
    `old_data` JSON NULL,
    `new_data` JSON NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blokir_attempt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip_address` VARCHAR(191) NOT NULL,
    `nik_attempted` VARCHAR(191) NULL,
    `kk_attempted` VARCHAR(191) NULL,
    `failed_count` INTEGER NOT NULL DEFAULT 0,
    `blocked_until` DATETIME(3) NULL,
    `total_blocks` INTEGER NOT NULL DEFAULT 0,
    `first_attempt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_attempt` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',

    UNIQUE INDEX `blokir_attempt_ip_address_key`(`ip_address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
