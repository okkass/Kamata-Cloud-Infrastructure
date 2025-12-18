/*
  Warnings:

  - You are about to drop the `Test` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Test`;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `email` VARCHAR(256) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_login_at` DATETIME(3) NULL,
    `cpu_limit_cores` INTEGER NOT NULL DEFAULT 0,
    `memory_limit_mb` INTEGER NOT NULL DEFAULT 0,
    `storage_limit_gb` INTEGER NOT NULL DEFAULT 0,
    `permission_id` BIGINT NOT NULL,

    UNIQUE INDEX `users_uuid_key`(`uuid`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_credentials` (
    `user_id` BIGINT NOT NULL,
    `hashed_password` VARCHAR(256) NOT NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `is_admin` BOOLEAN NOT NULL DEFAULT false,
    `is_image_admin` BOOLEAN NOT NULL DEFAULT false,
    `is_instance_type_admin` BOOLEAN NOT NULL DEFAULT false,
    `is_virtual_machine_admin` BOOLEAN NOT NULL DEFAULT false,
    `is_network_admin` BOOLEAN NOT NULL DEFAULT false,
    `is_security_group_admin` BOOLEAN NOT NULL DEFAULT false,
    `is_node_admin` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portfolios` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` BIGINT NOT NULL,

    UNIQUE INDEX `portfolios_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portfolio_articles` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `title` VARCHAR(256) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `portfolio_id` BIGINT NOT NULL,

    UNIQUE INDEX `portfolio_articles_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `virtual_machines` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `status` ENUM('running', 'stopped', 'pending') NOT NULL DEFAULT 'pending',
    `cpu` INTEGER NOT NULL,
    `memory` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `node_id` BIGINT NOT NULL,
    `image_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,

    UNIQUE INDEX `virtual_machines_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nodes` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `ip_address` VARCHAR(15) NOT NULL,
    `is_admin` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `nodes_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `images` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `description` TEXT NULL,
    `size` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `own_node_id` BIGINT NOT NULL,

    UNIQUE INDEX `images_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instance_types` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `cpu_core` INTEGER NOT NULL,
    `memory_size` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `instance_types_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `middlewares` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `middlewares_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `storage_pools` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `has_network_access` BOOLEAN NOT NULL DEFAULT false,
    `available_size` BIGINT NOT NULL,
    `total_size` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `storage_pools_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `virtual_storages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `size` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `storage_pool_id` BIGINT NOT NULL,

    UNIQUE INDEX `virtual_storages_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `virtual_machine_attached_storage` (
    `virtual_machine_id` BIGINT NOT NULL,
    `virtual_storage_id` BIGINT NOT NULL,
    `path` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`virtual_machine_id`, `virtual_storage_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `backups` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `description` TEXT NULL,
    `size` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `virtual_storage_id` BIGINT NOT NULL,
    `source_virtual_machine_id` BIGINT NOT NULL,

    UNIQUE INDEX `backups_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `snapshots` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `target_virtual_machine_id` BIGINT NOT NULL,

    UNIQUE INDEX `snapshots_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `virtual_networks` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `cidr` VARCHAR(15) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` BIGINT NOT NULL,

    UNIQUE INDEX `virtual_networks_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subnets` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `cidr` VARCHAR(15) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `virtual_network_id` BIGINT NOT NULL,

    UNIQUE INDEX `subnets_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `network_interfaces` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `ip_address` VARCHAR(15) NOT NULL,
    `mac_address` VARCHAR(15) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `subnet_id` BIGINT NOT NULL,
    `virtual_machine_id` BIGINT NOT NULL,

    UNIQUE INDEX `network_interfaces_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `security_groups` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` BIGINT NOT NULL,

    UNIQUE INDEX `security_groups_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `security_rules` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(256) NOT NULL,
    `role_type` ENUM('inbound', 'outbound') NOT NULL,
    `port` INTEGER NOT NULL,
    `rule_protocol` ENUM('tcp', 'udp', 'icmp', 'any') NOT NULL,
    `target_ip` VARCHAR(15) NOT NULL,
    `action` ENUM('allow', 'deny') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `security_group_id` BIGINT NOT NULL,

    UNIQUE INDEX `security_rules_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `virtual_machine_security_groups` (
    `virtual_machine_id` BIGINT NOT NULL,
    `security_group_id` BIGINT NOT NULL,

    PRIMARY KEY (`virtual_machine_id`, `security_group_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `operation_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `target_type` VARCHAR(191) NOT NULL,
    `target_uuid` VARCHAR(191) NOT NULL,
    `payload` TEXT NULL,
    `result` VARCHAR(191) NOT NULL,
    `ip_address` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` BIGINT NOT NULL,

    UNIQUE INDEX `operation_logs_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_credentials` ADD CONSTRAINT `user_credentials_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portfolios` ADD CONSTRAINT `portfolios_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portfolio_articles` ADD CONSTRAINT `portfolio_articles_portfolio_id_fkey` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_machines` ADD CONSTRAINT `virtual_machines_node_id_fkey` FOREIGN KEY (`node_id`) REFERENCES `nodes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_machines` ADD CONSTRAINT `virtual_machines_image_id_fkey` FOREIGN KEY (`image_id`) REFERENCES `images`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_machines` ADD CONSTRAINT `virtual_machines_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `images` ADD CONSTRAINT `images_own_node_id_fkey` FOREIGN KEY (`own_node_id`) REFERENCES `nodes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_storages` ADD CONSTRAINT `virtual_storages_storage_pool_id_fkey` FOREIGN KEY (`storage_pool_id`) REFERENCES `storage_pools`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_machine_attached_storage` ADD CONSTRAINT `virtual_machine_attached_storage_virtual_machine_id_fkey` FOREIGN KEY (`virtual_machine_id`) REFERENCES `virtual_machines`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_machine_attached_storage` ADD CONSTRAINT `virtual_machine_attached_storage_virtual_storage_id_fkey` FOREIGN KEY (`virtual_storage_id`) REFERENCES `virtual_storages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `backups` ADD CONSTRAINT `backups_virtual_storage_id_fkey` FOREIGN KEY (`virtual_storage_id`) REFERENCES `virtual_storages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `backups` ADD CONSTRAINT `backups_source_virtual_machine_id_fkey` FOREIGN KEY (`source_virtual_machine_id`) REFERENCES `virtual_machines`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `snapshots` ADD CONSTRAINT `snapshots_target_virtual_machine_id_fkey` FOREIGN KEY (`target_virtual_machine_id`) REFERENCES `virtual_machines`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_networks` ADD CONSTRAINT `virtual_networks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subnets` ADD CONSTRAINT `subnets_virtual_network_id_fkey` FOREIGN KEY (`virtual_network_id`) REFERENCES `virtual_networks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `network_interfaces` ADD CONSTRAINT `network_interfaces_subnet_id_fkey` FOREIGN KEY (`subnet_id`) REFERENCES `subnets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `network_interfaces` ADD CONSTRAINT `network_interfaces_virtual_machine_id_fkey` FOREIGN KEY (`virtual_machine_id`) REFERENCES `virtual_machines`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `security_groups` ADD CONSTRAINT `security_groups_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `security_rules` ADD CONSTRAINT `security_rules_security_group_id_fkey` FOREIGN KEY (`security_group_id`) REFERENCES `security_groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_machine_security_groups` ADD CONSTRAINT `virtual_machine_security_groups_virtual_machine_id_fkey` FOREIGN KEY (`virtual_machine_id`) REFERENCES `virtual_machines`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `virtual_machine_security_groups` ADD CONSTRAINT `virtual_machine_security_groups_security_group_id_fkey` FOREIGN KEY (`security_group_id`) REFERENCES `security_groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `operation_logs` ADD CONSTRAINT `operation_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
