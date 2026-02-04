/*
  Warnings:

  - You are about to drop the column `own_node_id` on the `images` table. All the data in the column will be lost.
  - Added the required column `own_pool_id` to the `images` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `images` DROP FOREIGN KEY `images_own_node_id_fkey`;

-- DropIndex
DROP INDEX `images_own_node_id_fkey` ON `images`;

-- AlterTable
ALTER TABLE `images` DROP COLUMN `own_node_id`,
    ADD COLUMN `own_pool_id` BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE `images` ADD CONSTRAINT `images_own_pool_id_fkey` FOREIGN KEY (`own_pool_id`) REFERENCES `storage_pools`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
