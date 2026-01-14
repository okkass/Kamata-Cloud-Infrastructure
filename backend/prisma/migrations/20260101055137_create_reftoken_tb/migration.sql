-- CreateTable
CREATE TABLE `RefleshToken` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `token` BINARY(32) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expired_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,
    `user_id` BIGINT NOT NULL,

    UNIQUE INDEX `RefleshToken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
