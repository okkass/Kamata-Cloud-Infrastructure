-- AlterTable
ALTER TABLE `network_interfaces` MODIFY `ip_address` VARCHAR(16) NOT NULL,
    MODIFY `mac_address` VARCHAR(18) NOT NULL;
