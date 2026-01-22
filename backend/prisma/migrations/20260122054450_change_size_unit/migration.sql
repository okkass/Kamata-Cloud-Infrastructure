/*
  Warnings:

  - You are about to drop the column `size` on the `backups` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `images` table. All the data in the column will be lost.
  - You are about to drop the column `memory_size` on the `instance_types` table. All the data in the column will be lost.
  - You are about to drop the column `available_size` on the `storage_pools` table. All the data in the column will be lost.
  - You are about to drop the column `total_size` on the `storage_pools` table. All the data in the column will be lost.
  - You are about to drop the column `memory` on the `virtual_machines` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `virtual_storages` table. All the data in the column will be lost.
  - Added the required column `size_mb` to the `backups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size_mb` to the `images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memory_size_mb` to the `instance_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `available_size_mb` to the `storage_pools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_size_mb` to the `storage_pools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memory_mb` to the `virtual_machines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size_mb` to the `virtual_storages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `backups` DROP COLUMN `size`,
    ADD COLUMN `size_mb` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `images` DROP COLUMN `size`,
    ADD COLUMN `size_mb` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `instance_types` DROP COLUMN `memory_size`,
    ADD COLUMN `memory_size_mb` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `storage_pools` DROP COLUMN `available_size`,
    DROP COLUMN `total_size`,
    ADD COLUMN `available_size_mb` INTEGER NOT NULL,
    ADD COLUMN `total_size_mb` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `virtual_machines` DROP COLUMN `memory`,
    ADD COLUMN `memory_mb` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `virtual_storages` DROP COLUMN `size`,
    ADD COLUMN `size_mb` INTEGER NOT NULL;
