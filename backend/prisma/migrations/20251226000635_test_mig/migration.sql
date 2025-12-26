-- DropForeignKey
ALTER TABLE `virtual_machine_attached_storage` DROP FOREIGN KEY `virtual_machine_attached_storage_virtual_storage_id_fkey`;

-- DropForeignKey
ALTER TABLE `virtual_storages` DROP FOREIGN KEY `virtual_storages_storage_pool_id_fkey`;

-- DropIndex
DROP INDEX `virtual_machine_attached_storage_virtual_storage_id_fkey` ON `virtual_machine_attached_storage`;

-- DropIndex
DROP INDEX `virtual_storages_storage_pool_id_fkey` ON `virtual_storages`;

-- AddForeignKey
ALTER TABLE `virtual_storages` ADD CONSTRAINT `virtual_storages_storage_pool_id_fkey` FOREIGN KEY (`storage_pool_id`) REFERENCES `storage_pools`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_machine_attached_storage` ADD CONSTRAINT `virtual_machine_attached_storage_virtual_storage_id_fkey` FOREIGN KEY (`virtual_storage_id`) REFERENCES `virtual_storages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
