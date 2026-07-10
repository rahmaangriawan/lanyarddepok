-- Lanyard Depok CMS schema for MySQL 8.0+
-- Import into the database configured in apps/backend/.env.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(255) NOT NULL DEFAULT 'USER',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(255) NOT NULL,
  `user_id` BIGINT UNSIGNED NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `payload` LONGTEXT NOT NULL,
  `last_activity` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `category` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `type` VARCHAR(255) NOT NULL DEFAULT 'BLOG',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_slug_unique` (`slug`),
  KEY `category_type_slug_index` (`type`, `slug`),
  KEY `category_type_name_index` (`type`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inquiry` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `inquiry_createdAt_index` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `post` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `published` TINYINT(1) NOT NULL DEFAULT 0,
  `featuredImage` VARCHAR(255) NULL,
  `categoryId` BIGINT UNSIGNED NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `metaTitle` VARCHAR(255) NULL,
  `metaDescription` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `post_slug_unique` (`slug`),
  KEY `post_published_createdAt_index` (`published`, `createdAt`),
  KEY `post_categoryId_published_createdAt_index` (`categoryId`, `published`, `createdAt`),
  KEY `post_published_slug_index` (`published`, `slug`),
  CONSTRAINT `post_categoryId_foreign` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `page` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `published` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `metaTitle` VARCHAR(255) NULL,
  `metaDescription` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `page_slug_unique` (`slug`),
  KEY `page_published_createdAt_index` (`published`, `createdAt`),
  KEY `page_published_slug_index` (`published`, `slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `media` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `filename` VARCHAR(255) NOT NULL,
  `filepath` VARCHAR(255) NOT NULL,
  `mimetype` VARCHAR(255) NOT NULL,
  `size` INT NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `media_mimetype_createdAt_index` (`mimetype`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `setting` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(255) NOT NULL,
  `value` TEXT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NULL,
  `slug` VARCHAR(255) NULL,
  `specs` TEXT NULL,
  `accessories` TEXT NULL,
  `basePrice` VARCHAR(255) NULL,
  `minOrder` VARCHAR(255) NULL,
  `shortDescription` TEXT NULL,
  `sheetStatus` VARCHAR(255) NULL,
  `sites` VARCHAR(255) NULL,
  `sortOrder` INT NOT NULL DEFAULT 999999,
  `featuredImage` VARCHAR(255) NULL,
  `categoryId` BIGINT UNSIGNED NULL,
  `description` TEXT NULL,
  `published` TINYINT(1) NOT NULL DEFAULT 0,
  `metaTitle` VARCHAR(255) NULL,
  `metaDescription` TEXT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_sku_unique` (`sku`),
  UNIQUE KEY `product_slug_unique` (`slug`),
  KEY `product_published_createdAt_index` (`published`, `createdAt`),
  KEY `product_categoryId_published_createdAt_index` (`categoryId`, `published`, `createdAt`),
  KEY `product_published_sortOrder_createdAt_index` (`published`, `sortOrder`, `createdAt`),
  CONSTRAINT `product_categoryId_foreign` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `portfolio` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `imageUrl` VARCHAR(255) NOT NULL,
  `logoUrl` VARCHAR(255) NULL,
  `logoText` VARCHAR(255) NULL,
  `link` VARCHAR(255) NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `portfolio_createdAt_index` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `comment` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `postId` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `approved` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `comment_postId_approved_createdAt_index` (`postId`, `approved`, `createdAt`),
  CONSTRAINT `comment_postId_foreign` FOREIGN KEY (`postId`) REFERENCES `post` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `citypage` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `published` TINYINT(1) NOT NULL DEFAULT 0,
  `featuredImage` VARCHAR(255) NULL,
  `parentId` BIGINT UNSIGNED NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `metaTitle` VARCHAR(255) NULL,
  `metaDescription` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `citypage_slug_unique` (`slug`),
  KEY `citypage_published_createdAt_index` (`published`, `createdAt`),
  KEY `citypage_parentId_published_createdAt_index` (`parentId`, `published`, `createdAt`),
  KEY `citypage_published_slug_index` (`published`, `slug`),
  CONSTRAINT `citypage_parentId_foreign` FOREIGN KEY (`parentId`) REFERENCES `citypage` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` BIGINT UNSIGNED NULL,
  `lanyardWidth` VARCHAR(255) NOT NULL,
  `printingType` VARCHAR(255) NOT NULL,
  `attachment` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `totalPrice` INT NOT NULL,
  `notes` TEXT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'PENDING',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_userId_createdAt_index` (`userId`, `createdAt`),
  KEY `order_status_createdAt_index` (`status`, `createdAt`),
  CONSTRAINT `order_userId_foreign` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
