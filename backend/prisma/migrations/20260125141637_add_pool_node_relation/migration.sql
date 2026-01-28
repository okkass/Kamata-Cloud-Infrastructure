/*
  Warnings:

  - Added the required column `node_id` to the `storage_pools` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `storage_pools` ADD COLUMN `node_id` BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE `storage_pools` ADD CONSTRAINT `storage_pools_node_id_fkey` FOREIGN KEY (`node_id`) REFERENCES `nodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
