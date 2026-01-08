/*
  Warnings:

  - You are about to drop the `reflesh_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `reflesh_tokens`;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `token` BINARY(32) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expired_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,
    `user_id` BIGINT NOT NULL,

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
