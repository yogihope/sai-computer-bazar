-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NOT NULL DEFAULT '',
    `passwordHash` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    `avatar` VARCHAR(191) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `mobileVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_status_idx`(`status`),
    INDEX `users_role_status_idx`(`role`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addresses` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL DEFAULT 'Home',
    `fullName` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NOT NULL,
    `addressLine1` VARCHAR(191) NOT NULL,
    `addressLine2` VARCHAR(191) NULL,
    `landmark` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'India',
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `addresses_userId_idx`(`userId`),
    INDEX `addresses_pincode_idx`(`pincode`),
    INDEX `addresses_city_idx`(`city`),
    INDEX `addresses_state_idx`(`state`),
    INDEX `addresses_userId_isDefault_idx`(`userId`, `isDefault`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
