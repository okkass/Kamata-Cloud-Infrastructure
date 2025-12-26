/*
  Warnings:

  - You are about to alter the column `payload` on the `operation_logs` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Json`.
  - You are about to drop the column `permission_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uuid]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `permissions` table without a default value. This is not possible if the table is not empty.
  - The required column `uuid` was added to the `permissions` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE `backups` DROP FOREIGN KEY `backups_virtual_storage_id_fkey`;

-- DropForeignKey
ALTER TABLE `images` DROP FOREIGN KEY `images_own_node_id_fkey`;

-- DropForeignKey
ALTER TABLE `network_interfaces` DROP FOREIGN KEY `network_interfaces_subnet_id_fkey`;

-- DropForeignKey
ALTER TABLE `network_interfaces` DROP FOREIGN KEY `network_interfaces_virtual_machine_id_fkey`;

-- DropForeignKey
ALTER TABLE `operation_logs` DROP FOREIGN KEY `operation_logs_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `portfolio_articles` DROP FOREIGN KEY `portfolio_articles_portfolio_id_fkey`;

-- DropForeignKey
ALTER TABLE `portfolios` DROP FOREIGN KEY `portfolios_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `security_groups` DROP FOREIGN KEY `security_groups_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `security_rules` DROP FOREIGN KEY `security_rules_security_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `snapshots` DROP FOREIGN KEY `snapshots_target_virtual_machine_id_fkey`;

-- DropForeignKey
ALTER TABLE `subnets` DROP FOREIGN KEY `subnets_virtual_network_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_credentials` DROP FOREIGN KEY `user_credentials_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_permission_id_fkey`;

-- DropForeignKey
ALTER TABLE `virtual_machine_attached_storage` DROP FOREIGN KEY `virtual_machine_attached_storage_virtual_machine_id_fkey`;

-- DropForeignKey
ALTER TABLE `virtual_machine_security_groups` DROP FOREIGN KEY `virtual_machine_security_groups_security_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `virtual_machine_security_groups` DROP FOREIGN KEY `virtual_machine_security_groups_virtual_machine_id_fkey`;

-- DropForeignKey
ALTER TABLE `virtual_machines` DROP FOREIGN KEY `virtual_machines_image_id_fkey`;

-- DropForeignKey
ALTER TABLE `virtual_machines` DROP FOREIGN KEY `virtual_machines_node_id_fkey`;

-- DropForeignKey
ALTER TABLE `virtual_machines` DROP FOREIGN KEY `virtual_machines_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `virtual_networks` DROP FOREIGN KEY `virtual_networks_user_id_fkey`;

-- DropIndex
DROP INDEX `backups_virtual_storage_id_fkey` ON `backups`;

-- DropIndex
DROP INDEX `images_own_node_id_fkey` ON `images`;

-- DropIndex
DROP INDEX `network_interfaces_subnet_id_fkey` ON `network_interfaces`;

-- DropIndex
DROP INDEX `network_interfaces_virtual_machine_id_fkey` ON `network_interfaces`;

-- DropIndex
DROP INDEX `operation_logs_user_id_fkey` ON `operation_logs`;

-- DropIndex
DROP INDEX `portfolio_articles_portfolio_id_fkey` ON `portfolio_articles`;

-- DropIndex
DROP INDEX `portfolios_user_id_fkey` ON `portfolios`;

-- DropIndex
DROP INDEX `security_groups_user_id_fkey` ON `security_groups`;

-- DropIndex
DROP INDEX `security_rules_security_group_id_fkey` ON `security_rules`;

-- DropIndex
DROP INDEX `snapshots_target_virtual_machine_id_fkey` ON `snapshots`;

-- DropIndex
DROP INDEX `subnets_virtual_network_id_fkey` ON `subnets`;

-- DropIndex
DROP INDEX `users_permission_id_fkey` ON `users`;

-- DropIndex
DROP INDEX `virtual_machine_security_groups_security_group_id_fkey` ON `virtual_machine_security_groups`;

-- DropIndex
DROP INDEX `virtual_machines_image_id_fkey` ON `virtual_machines`;

-- DropIndex
DROP INDEX `virtual_machines_node_id_fkey` ON `virtual_machines`;

-- DropIndex
DROP INDEX `virtual_machines_user_id_fkey` ON `virtual_machines`;

-- DropIndex
DROP INDEX `virtual_networks_user_id_fkey` ON `virtual_networks`;

-- AlterTable
ALTER TABLE `operation_logs` MODIFY `payload` JSON NULL,
    MODIFY `user_id` BIGINT NULL;

-- AlterTable
ALTER TABLE `permissions` ADD COLUMN `user_id` BIGINT NOT NULL,
    ADD COLUMN `uuid` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `permission_id`;

-- CreateTable
CREATE TABLE `task_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `task_name` VARCHAR(256) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `message` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,
    `operation_log_id` BIGINT NOT NULL,

    UNIQUE INDEX `task_logs_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `permissions_uuid_key` ON `permissions`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `permissions_user_id_key` ON `permissions`(`user_id`);

-- AddForeignKey
ALTER TABLE `user_credentials` ADD CONSTRAINT `user_credentials_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portfolios` ADD CONSTRAINT `portfolios_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portfolio_articles` ADD CONSTRAINT `portfolio_articles_portfolio_id_fkey` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_machines` ADD CONSTRAINT `virtual_machines_node_id_fkey` FOREIGN KEY (`node_id`) REFERENCES `nodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_machines` ADD CONSTRAINT `virtual_machines_image_id_fkey` FOREIGN KEY (`image_id`) REFERENCES `images`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_machines` ADD CONSTRAINT `virtual_machines_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `images` ADD CONSTRAINT `images_own_node_id_fkey` FOREIGN KEY (`own_node_id`) REFERENCES `nodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_machine_attached_storage` ADD CONSTRAINT `virtual_machine_attached_storage_virtual_machine_id_fkey` FOREIGN KEY (`virtual_machine_id`) REFERENCES `virtual_machines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `backups` ADD CONSTRAINT `backups_virtual_storage_id_fkey` FOREIGN KEY (`virtual_storage_id`) REFERENCES `virtual_storages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `snapshots` ADD CONSTRAINT `snapshots_target_virtual_machine_id_fkey` FOREIGN KEY (`target_virtual_machine_id`) REFERENCES `virtual_machines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_networks` ADD CONSTRAINT `virtual_networks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subnets` ADD CONSTRAINT `subnets_virtual_network_id_fkey` FOREIGN KEY (`virtual_network_id`) REFERENCES `virtual_networks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `network_interfaces` ADD CONSTRAINT `network_interfaces_subnet_id_fkey` FOREIGN KEY (`subnet_id`) REFERENCES `subnets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `network_interfaces` ADD CONSTRAINT `network_interfaces_virtual_machine_id_fkey` FOREIGN KEY (`virtual_machine_id`) REFERENCES `virtual_machines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `security_groups` ADD CONSTRAINT `security_groups_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `security_rules` ADD CONSTRAINT `security_rules_security_group_id_fkey` FOREIGN KEY (`security_group_id`) REFERENCES `security_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_machine_security_groups` ADD CONSTRAINT `virtual_machine_security_groups_virtual_machine_id_fkey` FOREIGN KEY (`virtual_machine_id`) REFERENCES `virtual_machines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_machine_security_groups` ADD CONSTRAINT `virtual_machine_security_groups_security_group_id_fkey` FOREIGN KEY (`security_group_id`) REFERENCES `security_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `operation_logs` ADD CONSTRAINT `operation_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_logs` ADD CONSTRAINT `task_logs_operation_log_id_fkey` FOREIGN KEY (`operation_log_id`) REFERENCES `operation_logs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
