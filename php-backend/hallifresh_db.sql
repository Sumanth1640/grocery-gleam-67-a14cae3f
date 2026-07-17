-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 17, 2026 at 06:48 AM
-- Server version: 11.8.8-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u846163412_hallifresh_db1`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `full_name` varchar(80) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `line1` varchar(160) NOT NULL,
  `line2` varchar(160) DEFAULT NULL,
  `city` varchar(60) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `type` enum('Home','Work','Other') NOT NULL DEFAULT 'Home',
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `full_name`, `phone`, `line1`, `line2`, `city`, `pincode`, `type`, `is_default`, `created_at`) VALUES
('0fe5dc3e-ff82-4a80-99ce-c922cee21e45', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'SUMANTH HOLKAR', '6362899763', '65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,', 'Bengaluru', 'Bengaluru', '560087', 'Home', 0, '2026-06-11 16:16:02'),
('1c010a6c-bd84-4dd2-9f4b-299d32ab0812', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'SUMANTH HOLKAR', '6362899763', '65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,', 'Bengaluru', 'Bengaluru', '560087', 'Home', 0, '2026-06-10 10:13:06'),
('52e6e85c-1a22-4ee4-ad58-8804a6fa7dde', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'SUMANTH HOLKAR', '6362899763', '65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,', 'Bengaluru', 'Bengaluru', '560087', 'Home', 0, '2026-06-11 15:44:50'),
('53c286d5-a4d6-41fa-9406-b744e48886fb', 'f26048b7-9eb0-47d3-bc5c-f77a6de9fb6d', 'Nagendra bichagatti', '8861393486', 'At.budihal po.suladhal to.gokak dist.belagavi', NULL, 'Belagavi', '591101', 'Home', 1, '2026-06-09 13:22:27'),
('5d1de8de-18cf-4984-87ec-3f042e3c19e2', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'SUMANTH HOLKAR', '6362899763', '65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,', 'Bengaluru', 'Bengaluru', '560091', 'Home', 0, '2026-06-10 09:52:53'),
('630cb7a2-43ca-4b2b-a459-e2c2a865e067', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'SUMANTH HOLKAR', '6362899763', '65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,', 'Bengaluru', 'Bengaluru', '560091', 'Home', 0, '2026-06-04 18:49:42'),
('6c94aec0-ae3c-43c9-bad1-6741cc0593ac', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'SUMANTH HOLKAR', '6362899763', '65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,', 'Bengaluru', 'Bengaluru', '560091', 'Home', 0, '2026-06-11 16:19:37'),
('9e41c844-59f2-4253-b0b9-46afc3a1e616', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'SUMANTH HOLKAR', '6362899763', '65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,', 'Bengaluru', 'Bengaluru', '560087', 'Home', 0, '2026-06-10 10:13:59'),
('c2cf99a8-5479-4762-8556-1ffe46394639', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'SUMANTH HOLKAR', '6362899763', '65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,', 'Bengaluru', 'Bengaluru', '560091', 'Home', 0, '2026-06-03 08:33:18'),
('cb83d215-d02a-43d3-8cc8-05e8ac8b317d', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'SUMANTH HOLKAR', '6362899763', '65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,', 'Bengaluru', 'Bengaluru', '560087', 'Home', 0, '2026-06-11 16:17:25'),
('cc131624-0419-4ea6-9d51-bdf7ce41ba34', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'SUMANTH HOLKAR', '6362899763', '65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,', 'Bengaluru', 'Bengaluru', '560091', 'Home', 0, '2026-06-02 13:21:49'),
('e07e09a3-78e8-40c0-b41b-68097bc9fac4', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'SUMANTH HOLKAR', '6362899763', '65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,', 'Bengaluru', 'Bengaluru', '560091', 'Home', 0, '2026-06-02 13:29:01'),
('e8f16171-d98f-4522-ae0c-ba3457769a52', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'SUMANTH HOLKAR', '6362899763', '65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,', 'Bengaluru', 'Bengaluru', '560091', 'Home', 0, '2026-06-03 08:25:31'),
('f63f93b1-2d9a-410e-9600-cec41227276d', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'SUMANTH HOLKAR', '6362899763', '65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,', 'Bengaluru', 'Bengaluru', '560091', 'Home', 0, '2026-06-04 19:17:08');

-- --------------------------------------------------------

--
-- Table structure for table `app_settings`
--

CREATE TABLE `app_settings` (
  `key` varchar(120) NOT NULL,
  `value` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `app_settings`
--

INSERT INTO `app_settings` (`key`, `value`, `updated_at`) VALUES
('rider_flat_fee', '40', '2026-06-19 06:52:51');

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` char(36) NOT NULL,
  `title` varchar(160) NOT NULL,
  `subtitle` varchar(255) NOT NULL DEFAULT '',
  `cta_label` varchar(60) NOT NULL DEFAULT 'Shop now',
  `link_to` varchar(255) NOT NULL DEFAULT '/',
  `bg` varchar(400) NOT NULL,
  `fg` varchar(80) NOT NULL,
  `image` varchar(400) NOT NULL DEFAULT '',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`id`, `title`, `subtitle`, `cta_label`, `link_to`, `bg`, `fg`, `image`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
('b1111111-1111-1111-1111-111111111111', 'Fresh Fruits — Up to 40% off', 'Hand-picked, farm-fresh daily', 'Shop Fruits', '/c/fruits', 'linear-gradient(135deg,#ff9966,#ff5e62)', '#ffffff', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1600&q=80', 1, 1, '2026-06-06 06:56:15', '2026-06-06 06:56:15'),
('b2222222-2222-2222-2222-222222222222', 'Crisp Vegetables', 'Straight from the farm to you', 'Shop Veggies', '/c/vegetables', 'linear-gradient(135deg,#11998e,#38ef7d)', '#ffffff', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1600&q=80', 1, 2, '2026-06-06 06:56:15', '2026-06-06 06:56:15'),
('b3333333-3333-3333-3333-333333333333', 'Dairy & Eggs', 'Pure, fresh and protein-packed', 'Shop Dairy', '/c/dairy', 'linear-gradient(135deg,#56ccf2,#2f80ed)', '#ffffff', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1600&q=80', 1, 3, '2026-06-06 06:56:15', '2026-06-06 06:56:15'),
('b4444444-4444-4444-4444-444444444444', 'Bakery Treats', 'Freshly baked every morning', 'Shop Bakery', '/c/bakery', 'linear-gradient(135deg,#f6d365,#fda085)', '#1a1a1a', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=80', 1, 4, '2026-06-06 06:56:15', '2026-06-06 06:56:15'),
('b5555555-5555-5555-5555-555555555555', 'Snacks & Munchies', 'Crunch into your favourites', 'Shop Snacks', '/c/snacks', 'linear-gradient(135deg,#fc4a1a,#f7b733)', '#ffffff', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=1600&q=80', 1, 5, '2026-06-06 06:56:15', '2026-06-06 06:56:15'),
('b6666666-6666-6666-6666-666666666666', 'Cool Beverages', 'Chill out with refreshing drinks', 'Shop Drinks', '/c/beverages', 'linear-gradient(135deg,#4facfe,#00f2fe)', '#ffffff', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=1600&q=80', 1, 6, '2026-06-06 06:56:15', '2026-06-06 06:56:15'),
('b7777777-7777-7777-7777-777777777777', 'Household Essentials', 'Everything you need at home', 'Shop Home', '/c/household', 'linear-gradient(135deg,#667eea,#764ba2)', '#ffffff', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=1600&q=80', 1, 7, '2026-06-06 06:56:15', '2026-06-06 06:56:15'),
('b8888888-8888-8888-8888-888888888888', 'Personal Care', 'Look good, feel great', 'Shop Care', '/c/personal-care', 'linear-gradient(135deg,#ee9ca7,#ffdde1)', '#1a1a1a', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1600&q=80', 1, 8, '2026-06-06 06:56:15', '2026-06-06 06:56:15'),
('b9999999-9999-9999-9999-999999999999', 'Hot Food Delivery', 'Restaurant favourites at your door', 'Order Food', '/food', 'linear-gradient(135deg,#ff512f,#dd2476)', '#ffffff', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600&q=80', 1, 9, '2026-06-06 06:56:15', '2026-06-06 06:56:15');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` char(36) NOT NULL,
  `slug` varchar(60) NOT NULL,
  `name` varchar(120) NOT NULL,
  `image` text NOT NULL,
  `tint` varchar(60) NOT NULL DEFAULT '#e8f5e9',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `slug`, `name`, `image`, `tint`, `sort_order`, `created_at`) VALUES
('47da6f84-60f4-11f1-8fe0-48777afc85a1', 'vegetables', 'Vegetables', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', '#e8f5e9', 1, '2026-06-05 15:36:11'),
('47da72b4-60f4-11f1-8fe0-48777afc85a1', 'fruits', 'Fresh Fruits', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400', '#fff3e0', 2, '2026-06-05 15:36:11'),
('47da7343-60f4-11f1-8fe0-48777afc85a1', 'dairy', 'Dairy & Eggs', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', '#fff8e1', 3, '2026-06-05 15:36:11'),
('47da7368-60f4-11f1-8fe0-48777afc85a1', 'bakery', 'Bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', '#f3e5f5', 4, '2026-06-05 15:36:11'),
('47da7388-60f4-11f1-8fe0-48777afc85a1', 'snacks', 'Snacks', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', '#fce4ec', 5, '2026-06-05 15:36:11'),
('47da73a1-60f4-11f1-8fe0-48777afc85a1', 'beverages', 'Beverages', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400', '#e3f2fd', 6, '2026-06-05 15:36:11'),
('47da73ba-60f4-11f1-8fe0-48777afc85a1', 'household', 'Household', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400', '#ede7f6', 7, '2026-06-05 15:36:11'),
('47da73d3-60f4-11f1-8fe0-48777afc85a1', 'personal-care', 'Personal Care', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', '#e0f7fa', 8, '2026-06-05 15:36:11');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` char(36) NOT NULL,
  `code` varchar(40) NOT NULL,
  `title` varchar(120) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `discount_type` enum('flat','percent') NOT NULL DEFAULT 'flat',
  `discount_value` int(11) NOT NULL,
  `min_order` int(11) NOT NULL DEFAULT 0,
  `max_discount` int(11) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `usage_limit` int(11) DEFAULT NULL,
  `per_user_limit` int(11) DEFAULT 1,
  `used_count` int(11) NOT NULL DEFAULT 0,
  `valid_from` datetime NOT NULL DEFAULT current_timestamp(),
  `valid_until` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `title`, `description`, `discount_type`, `discount_value`, `min_order`, `max_discount`, `expires_at`, `is_active`, `created_at`, `usage_limit`, `per_user_limit`, `used_count`, `valid_from`, `valid_until`) VALUES
('a97c684c-5ddd-11f1-8fe0-48777afc85a1', 'WELCOME50', 'Welcome ₹50 off', 'On orders above ₹199', 'flat', 50, 199, NULL, NULL, 1, '2026-06-01 17:16:43', NULL, 1, 0, '2026-06-01 17:18:06', NULL),
('a97c699c-5ddd-11f1-8fe0-48777afc85a1', 'SAVE10', '10% off', 'Up to ₹100 off', 'percent', 10, 299, 100, NULL, 1, '2026-06-01 17:16:43', NULL, 1, 0, '2026-06-01 17:18:06', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `coupon_redemptions`
--

CREATE TABLE `coupon_redemptions` (
  `id` char(36) NOT NULL,
  `coupon_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `order_id` char(36) DEFAULT NULL,
  `discount` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `device_tokens`
--

CREATE TABLE `device_tokens` (
  `token` varchar(512) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `platform` varchar(16) NOT NULL DEFAULT 'android',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `device_tokens`
--

INSERT INTO `device_tokens` (`token`, `user_id`, `platform`, `created_at`, `updated_at`) VALUES
('cayi-zvPR1y6OVR18-yGHv:APA91bGgbIWP93rnLRCyzXdYKZ68MCaposHctjwKptjz2cZ0xzsaxex231XgG19ojTn76DgMXOvVOqwvAl_ZndrwaVfTPwMNpqJ_UFeGKC_YRu4MhG8hcu0', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'android', '2026-06-28 19:33:24', '2026-06-28 19:33:24'),
('cI_0vQk-RoOjGQPhFz0ZkH:APA91bHI2Nr4q4Dz6gXkXgjtMrjO1iSWNvv9-tJgaNT1L1KRnKBEv8JGOgYwvOv-ey1S0LdFN2Z0ELg65f3e2HDa4RyThMlX0tHYqvUE--KiC_cAWx2tmmY', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'android', '2026-06-30 05:58:26', '2026-06-30 05:58:26'),
('dicvjQpXRbSCcxhVA6uW0d:APA91bELNezXEbJWaJf6Rg58cErRk7sypXDIJGP-So88Aw4FuZY6NUK7qIDOuvww4dhg09ewGqU_Dp6LY31ZZB16sL1u84fDRuDZjwQgqjPvko6tX04XZyo', '46b70155-77ae-4438-b691-13fb6e2e6449', 'android', '2026-06-28 15:09:54', '2026-06-28 15:09:54'),
('eD6oMZBHRq-xc7YTFQ1XcV:APA91bFfkR-O76aCVZIXi26Rfu_9EBH9zKL9uB7B0MVkbr1tC-95nWVanuCFMJA-h47-0f7uzGkTKOHRZirkrtOV9h61qlxzc7NIsts6upGGkQQEQMQm3v8', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'android', '2026-06-28 15:08:03', '2026-06-28 15:08:03'),
('eWgB9RxdS7mgiqxaIybQCU:APA91bENMQx_IOQgsxixVY3eOM4HYybpxo1lnzvo6kLmESupFiaZmAq6BcMzjfUV5nOM6_ex60152DV6WUSSDN8ZznehHf3K8yXhoeNo-Y5j3j1ySyclmLs', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'android', '2026-06-29 08:10:49', '2026-06-29 08:10:49'),
('fNGw4ydPQ36_jCWUszdlYO:APA91bFZQCaKMRhPgOr50np3BqPdOlcryBFFrYnsFeGvi_ug5T04fdEsEFJod9dckvdEya9mn6Itv8fUeCxClIWKFC5n-5ZtylgiIFvWl6FHpZEziwOF4zA', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'android', '2026-06-28 19:16:15', '2026-06-28 19:16:15');

-- --------------------------------------------------------

--
-- Table structure for table `dishes`
--

CREATE TABLE `dishes` (
  `id` char(36) NOT NULL,
  `restaurant_id` char(36) NOT NULL,
  `name` varchar(160) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `image` text NOT NULL,
  `price` int(11) NOT NULL,
  `is_veg` tinyint(1) NOT NULL DEFAULT 1,
  `category` varchar(80) NOT NULL DEFAULT 'Main',
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `furniture_items`
--

CREATE TABLE `furniture_items` (
  `id` char(36) NOT NULL,
  `slug` varchar(160) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(64) NOT NULL,
  `wood` varchar(64) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `mrp` decimal(12,2) NOT NULL,
  `image` varchar(1024) NOT NULL,
  `blurb` text DEFAULT NULL,
  `dimensions` varchar(160) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `furniture_items`
--

INSERT INTO `furniture_items` (`id`, `slug`, `name`, `category`, `wood`, `price`, `mrp`, `image`, `blurb`, `dimensions`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
('442be7d0-61d1-11f1-8fe0-48777afc85a1', 'sheesham-coffee-table', 'Sheesham Coffee Table', 'living', 'Sheesham', 8499.00, 12999.00, '/furniture/sheesham-coffee-table.jpg', 'Hand-finished solid sheesham — all wood, no fabric.', 'L 42\" x W 24\" x H 18\"', 1, 10, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442be9b1-61d1-11f1-8fe0-48777afc85a1', 'teak-side-table', 'Teak Side Table', 'living', 'Teak', 6999.00, 9999.00, '/furniture/teak-dining-table.jpg', 'Solid teak side table, hand-rubbed oil finish.', 'L 20\" x W 20\" x H 24\"', 1, 20, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442beab9-61d1-11f1-8fe0-48777afc85a1', 'mango-wood-bed', 'Mango Wood Queen Bed', 'bedroom', 'Mango', 24999.00, 34999.00, '/furniture/mango-wood-bed.jpg', 'Chunky mango wood frame with slatted wooden headboard.', 'L 84\" x W 64\" x H 42\"', 1, 30, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442beb17-61d1-11f1-8fe0-48777afc85a1', 'oak-wardrobe', 'Oak 3-Door Wardrobe', 'storage', 'Oak', 32499.00, 44999.00, '/furniture/oak-wardrobe.jpg', 'Spacious all-wood wardrobe with soft-close oak doors.', 'L 60\" x W 22\" x H 78\"', 1, 40, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442beb6e-61d1-11f1-8fe0-48777afc85a1', 'sheesham-dining-table', 'Sheesham 6-Seater Dining Table', 'dining', 'Sheesham', 38999.00, 54999.00, '/furniture/teak-dining-table.jpg', 'All-wood sheesham table with six matching wooden chairs.', 'L 72\" x W 36\" x H 30\"', 1, 50, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442bebc2-61d1-11f1-8fe0-48777afc85a1', 'walnut-study-desk', 'Walnut Study Desk', 'study', 'Walnut', 14499.00, 19999.00, '/furniture/walnut-study-desk.jpg', 'Minimal solid walnut desk with cable channel and drawer.', 'L 48\" x W 24\" x H 30\"', 1, 60, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442bec11-61d1-11f1-8fe0-48777afc85a1', 'teak-bookshelf', 'Teak Ladder Bookshelf', 'study', 'Teak', 9999.00, 13999.00, '/furniture/teak-bookshelf.jpg', 'Five-tier solid teak leaning shelf in honey finish.', 'L 24\" x W 16\" x H 72\"', 1, 70, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442bec5f-61d1-11f1-8fe0-48777afc85a1', 'mango-tv-unit', 'Mango Wood TV Unit', 'living', 'Mango', 18999.00, 26999.00, '/furniture/mango-tv-unit.jpg', 'Rustic all-wood TV console in solid mango.', 'L 60\" x W 16\" x H 22\"', 1, 80, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442becaf-61d1-11f1-8fe0-48777afc85a1', 'oak-nightstand', 'Oak Bedside Nightstand', 'bedroom', 'Oak', 5499.00, 7999.00, '/furniture/oak-nightstand.jpg', 'Compact two-drawer nightstand in natural solid oak.', 'L 18\" x W 16\" x H 24\"', 1, 90, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442becf8-61d1-11f1-8fe0-48777afc85a1', 'sheesham-shoe-rack', 'Sheesham Shoe Rack', 'storage', 'Sheesham', 6999.00, 9499.00, '/furniture/sheesham-shoe-rack.jpg', 'Three-tier solid sheesham shoe rack — all wood.', 'L 36\" x W 12\" x H 20\"', 1, 100, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442bed40-61d1-11f1-8fe0-48777afc85a1', 'teak-dining-chair', 'Teak Dining Chair', 'dining', 'Teak', 4999.00, 6999.00, '/furniture/teak-dining-chair.jpg', 'Sculpted all-wood teak dining chair.', 'L 18\" x W 20\" x H 34\"', 1, 110, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442bed88-61d1-11f1-8fe0-48777afc85a1', 'sheesham-king-bed', 'Sheesham King Bed', 'bedroom', 'Sheesham', 34999.00, 49999.00, '/furniture/sheesham-king-bed.jpg', 'King-size solid sheesham bed with wooden storage drawers.', 'L 84\" x W 78\" x H 44\"', 1, 120, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442bedd3-61d1-11f1-8fe0-48777afc85a1', 'mango-bench', 'Mango Wood Dining Bench', 'dining', 'Mango', 7499.00, 10999.00, '/furniture/mango-bench.jpg', 'Rustic solid mango wood bench, seats three.', 'L 60\" x W 14\" x H 18\"', 1, 130, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442bee1d-61d1-11f1-8fe0-48777afc85a1', 'walnut-sideboard', 'Walnut Sideboard', 'dining', 'Walnut', 26999.00, 36999.00, '/furniture/walnut-sideboard.jpg', 'Mid-century all-wood walnut sideboard.', 'L 66\" x W 18\" x H 30\"', 1, 140, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442bee6c-61d1-11f1-8fe0-48777afc85a1', 'oak-bookshelf', 'Oak Wall Bookshelf', 'study', 'Oak', 11499.00, 15999.00, '/furniture/oak-bookshelf.jpg', 'Floating-style solid oak shelves, six tiers.', 'L 36\" x W 12\" x H 60\"', 1, 150, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442beeb9-61d1-11f1-8fe0-48777afc85a1', 'sheesham-chest', 'Sheesham Chest of Drawers', 'bedroom', 'Sheesham', 16999.00, 22999.00, '/furniture/sheesham-chest.jpg', 'Six-drawer solid sheesham chest with hand-carved details.', 'L 36\" x W 18\" x H 44\"', 1, 160, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442bef06-61d1-11f1-8fe0-48777afc85a1', 'teak-coffee-table-round', 'Teak Round Coffee Table', 'living', 'Teak', 9499.00, 13499.00, '/furniture/sheesham-coffee-table.jpg', 'Round all-wood teak coffee table.', 'D 36\" x H 16\"', 1, 170, '2026-06-06 17:58:04', '2026-06-06 17:58:04'),
('442bef50-61d1-11f1-8fe0-48777afc85a1', 'mango-bar-cabinet', 'Mango Wood Bar Cabinet', 'storage', 'Mango', 21999.00, 29999.00, '/furniture/mango-bar-cabinet.jpg', 'Stand-up bar cabinet, solid mango wood.', 'L 36\" x W 18\" x H 60\"', 1, 180, '2026-06-06 17:58:04', '2026-06-06 17:58:04');

-- --------------------------------------------------------

--
-- Table structure for table `furniture_promos`
--

CREATE TABLE `furniture_promos` (
  `id` char(36) NOT NULL,
  `eyebrow` varchar(120) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `highlight` varchar(255) DEFAULT NULL,
  `blurb` text DEFAULT NULL,
  `cta_label` varchar(80) NOT NULL DEFAULT 'Explore the collection',
  `cta_link` varchar(512) NOT NULL DEFAULT '/furniture',
  `image` varchar(1024) NOT NULL,
  `bg_gradient` varchar(512) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `furniture_promos`
--

INSERT INTO `furniture_promos` (`id`, `eyebrow`, `title`, `highlight`, `blurb`, `cta_label`, `cta_link`, `image`, `bg_gradient`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
('de30572f-61c5-11f1-8fe0-48777afc85a1', 'Solid wood collection', 'Handcrafted wooden furniture,', 'built for life.', 'Teak, sheesham, mango and oak — shaped by master carpenters, finished by hand.', 'Explore the collection', '/furniture', 'https://m.media-amazon.com/images/I/91CfTPF34uL._AC_UF894,1000_QL80_.jpg', 'linear-gradient(135deg, oklch(0.93 0.04 60) 0%, oklch(0.88 0.06 50) 60%, oklch(0.82 0.08 40) 100%)', 1, 10, '2026-06-06 16:36:28', '2026-06-08 14:56:33');

-- --------------------------------------------------------

--
-- Table structure for table `furniture_quotes`
--

CREATE TABLE `furniture_quotes` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `name` varchar(160) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `city` varchar(120) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('new','contacted','quoted','converted','closed') NOT NULL DEFAULT 'new',
  `admin_note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hero_slides`
--

CREATE TABLE `hero_slides` (
  `id` char(36) NOT NULL,
  `badge_text` varchar(255) DEFAULT NULL,
  `title_line1` varchar(255) DEFAULT NULL,
  `title_highlight` varchar(255) DEFAULT NULL,
  `title_line3` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `primary_cta_label` varchar(255) DEFAULT NULL,
  `primary_cta_link` varchar(500) DEFAULT NULL,
  `secondary_cta_label` varchar(255) DEFAULT NULL,
  `secondary_cta_link` varchar(500) DEFAULT NULL,
  `image` varchar(1000) DEFAULT NULL,
  `deal_label` varchar(255) DEFAULT NULL,
  `deal_text` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hero_slides`
--

INSERT INTO `hero_slides` (`id`, `badge_text`, `title_line1`, `title_highlight`, `title_line3`, `description`, `primary_cta_label`, `primary_cta_link`, `secondary_cta_label`, `secondary_cta_link`, `image`, `deal_label`, `deal_text`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
('0cd50efe-eca7-4d63-9298-cd74132d9953', 'Farm fresh daily', 'Dairy & eggs.', 'Pure, creamy goodness,', 'delivered cold.', 'Milk, paneer, curd, cheese and farm-fresh eggs — handled with care, never frozen.', 'Shop dairy', '/c/dairy', 'Browse categories', '#categories', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=1600&q=80', 'Subscribe & save', '10% off daily milk plans', 1, 3, '2026-06-06 06:33:48', '2026-06-06 06:33:48'),
('3525e753-738c-4ef2-843d-9c8d88feb70a', 'Snack attack', 'Munchies.', 'Crunchy, salty, sweet —', 'sorted in minutes.', 'Chips, nachos, namkeen, chocolates — everything you crave, never out of stock.', 'Shop snacks', '/c/snacks', 'Browse categories', '#categories', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=1600&q=80', 'Combo deal', 'Buy 3 packs, save 25%', 1, 5, '2026-06-06 06:33:48', '2026-06-06 06:33:48'),
('3a59fb72-bd9f-42d6-bbb1-aba2050533e4', 'Hungry?', 'Food delivery.', 'Hot meals from your', 'favourite restaurants.', 'Biryanis, pizzas, burgers, thalis — delivered piping hot from the best kitchens near you.', 'Order food', '/food', 'Browse restaurants', '/food', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1600&q=80', 'Hot deal', 'Flat 50% off your first order', 1, 9, '2026-06-06 06:33:48', '2026-06-06 06:33:48'),
('76f10f6b-6b35-4588-a660-82e3e3fdb306', 'Baked fresh today', 'Breads & bakes.', 'Warm, soft, fragrant,', 'from the oven.', 'Sourdough, brioche, croissants, cookies — baked fresh every morning by local bakers.', 'Shop bakery', '/c/bakery', 'Browse categories', '#categories', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80', 'Hot deal', 'Flat 20% off all breads', 1, 4, '2026-06-06 06:33:48', '2026-06-06 06:33:48'),
('abc2b6fe-0281-40c6-ad83-95cdff7b0302', 'Stay refreshed', 'Beverages.', 'Chilled drinks,', 'at lightning speed.', 'Sodas, juices, energy drinks, mixers, water — ice-cold and ready in 11 minutes.', 'Shop beverages', '/c/beverages', 'Browse categories', '#categories', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=1600&q=80', 'Party pack', 'Flat ₹100 off on 6+ bottles', 1, 6, '2026-06-06 06:33:48', '2026-06-06 06:33:48'),
('abff6fb5-5a68-479a-9aa3-e70927f5997c', 'Look & feel good', 'Personal care.', 'Skincare, haircare,', 'delivered discreetly.', 'Shampoos, soaps, creams, dental care, hygiene — trusted brands, best prices.', 'Shop personal care', '/c/personal-care', 'Browse categories', '#categories', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80', 'New arrivals', 'Flat 15% off top brands', 1, 8, '2026-06-06 06:33:48', '2026-06-06 06:33:48'),
('e3123f78-60b2-4803-b28a-c4a82ce6b04b', 'Everyday essentials', 'Household.', 'Cleaning, laundry,', 'sorted in one tap.', 'Detergents, dishwash, floor cleaners, tissues — all your home essentials, restocked fast.', 'Shop household', '/c/household', 'Browse categories', '#categories', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=1600&q=80', 'Bulk deal', 'Up to 30% off on big packs', 1, 7, '2026-06-06 06:33:48', '2026-06-06 06:33:48'),
('ea8f3f02-6c5d-400e-b46c-ccd8dfbf9356', 'Fresh & juicy', 'Fruits.', 'Sweet, ripe and ready,', 'at your door.', 'Mangoes, apples, berries and more — picked at peak ripeness and delivered in minutes.', 'Shop fruits', '/c/fruits', 'Browse categories', '#categories', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1600&q=80', 'Limited time', 'Buy 2 kg, get 500g free', 1, 2, '2026-06-06 06:33:48', '2026-06-06 06:33:48'),
('f4268037-7de1-4ac3-96df-18ed474de2bd', 'Delivery in 11 minutes', 'Fresh veggies.', 'Straight from the farm,', 'to your kitchen.', 'Crisp, hand-picked vegetables sourced daily from local farms. No middlemen, no compromises.', 'Shop vegetables', '/c/vegetables', 'Browse categories', '#categories', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1600&q=80', 'Today\'s deal', 'Up to 35% off seasonal veggies', 1, 1, '2026-06-06 06:33:48', '2026-06-06 06:33:48');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `kind` varchar(32) NOT NULL DEFAULT 'system',
  `title` varchar(255) NOT NULL,
  `body` text DEFAULT NULL,
  `link` varchar(512) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `kind`, `title`, `body`, `link`, `is_read`, `created_at`) VALUES
('00d390f4-c236-45ea-ac04-9fc990b45467', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹125 has been placed successfully.', '/orders/d8c0d6fd-13d2-4419-95f7-6a32f23801b7', 0, '2026-06-10 09:52:52'),
('04ef9ccc-e284-42de-b590-26d069c36764', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order has been delivered. Enjoy!', '/orders/fc38905f-7c51-46f3-a00d-1f6a97df8f58', 0, '2026-06-27 07:34:18'),
('051cea0a-630c-489e-aa7b-685c2ddf6d54', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'order', 'New order received', 'A customer placed an order of ₹155.', '/outlet/orders', 0, '2026-06-11 14:47:44'),
('0570d9e0-f130-413b-b561-1006e81b30e1', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹260 has been placed successfully.', '/orders/80e10078-2172-45e0-86e6-944430161a0e', 0, '2026-06-11 15:12:16'),
('073e7f44-44a5-425a-8c11-694def80cd5e', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Refund verified', 'Your refund request was verified and forwarded to admin for processing.', '/orders/d5afb823-39b7-4b22-9b0a-e4cc7af130a6', 0, '2026-06-10 09:50:13'),
('0883e18d-037c-4dc9-8bef-2a68fef9189b', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order has been delivered. Enjoy!', '/orders/bea4612c-0cc6-4573-b919-6b1d7e92e737', 0, '2026-06-27 07:32:38'),
('08dc73a4-adf0-4246-90b2-2fc4daa42aca', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your order status was updated to \"out for delivery\".', '/orders/2bf60274-1af7-4ab4-b30b-adfce8885e81', 0, '2026-06-28 15:35:40'),
('0af1d08c-042d-4e21-9838-b3d031b2dea7', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your rider has picked up your order and is on the way.', '/orders/fc38905f-7c51-46f3-a00d-1f6a97df8f58', 0, '2026-06-27 07:33:56'),
('0b012ceb-62dd-4f29-98f6-feb9ebbca271', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹353 has been placed successfully.', '/orders/a6728210-91ee-4546-af25-04a922ba50fb', 0, '2026-06-09 06:42:22'),
('0c0bd497-9607-41f4-af19-1fa253cf7c2a', 'bea66595-ebda-4241-98ee-74088e7fbee1', 'order', 'New product order', 'A customer placed an order of ₹65 at Koramangala Warehouse.', '/admin/orders', 0, '2026-06-13 17:43:45'),
('0d10725e-d297-4a10-b7cb-12be1a8937bc', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹330 has been placed successfully.', '/orders/f540920c-361f-49ee-b0e4-2f5e0c1b2646', 0, '2026-06-11 15:27:04'),
('0e163100-e2f8-484e-b977-c7e4edbb69aa', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New refund request', 'Customer requested a refund of ₹155 — please verify the proof.', '/admin/refunds-verify', 0, '2026-06-06 05:33:56'),
('0f3635b0-9ead-4f81-8a4b-e61ceab31b84', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your rider has picked up your order and is on the way.', '/orders/0a0ededf-b035-47cd-a877-9b60fac98758', 0, '2026-06-27 07:43:53'),
('110bc025-0b15-4fdc-b2ea-6d59051231c3', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'order', 'New food order', 'A customer placed an order of ₹155.', '/partner/orders', 0, '2026-06-05 11:16:14'),
('11fdde61-d862-421b-a846-798cf31f2962', '46b70155-77ae-4438-b691-13fb6e2e6449', 'order', 'New delivery assigned', 'You have a new delivery. Open the rider app for details.', '/rider', 0, '2026-06-28 15:35:14'),
('121ad769-cf4c-408d-8507-b2fbeb1b6a4a', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹155 has been placed successfully.', '/orders/fc773aac-dff8-436c-b6c4-ff10e506e06c', 0, '2026-06-06 05:31:25'),
('1379091b-358c-4422-aa02-6e5f28dd4177', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹330 at Resto One.', '/partner/orders', 0, '2026-06-28 15:33:58'),
('137deb11-17a0-4b7d-8485-88b0c560657c', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your rider has picked up your order and is on the way.', '/orders/fb6c66a9-8686-4438-89bb-34545f315233', 0, '2026-06-27 07:34:25'),
('16404540-5c6e-4694-9155-1b366ba818b6', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order status was updated to \"delivered\".', '/orders/f6df52ca-aae4-4441-86ba-7df5e4e908c9', 0, '2026-06-05 10:25:59'),
('16ba11ee-fdc3-4306-b0ea-bcf3f0259479', '46b70155-77ae-4438-b691-13fb6e2e6449', 'order', 'New delivery assigned', 'You have a new delivery. Open the rider app for details.', '/rider', 0, '2026-06-28 15:20:52'),
('1bdf28d4-1cdd-41e3-8280-aa9a58f6086f', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹115 has been placed successfully.', '/orders/f0d206f1-d7d4-4bdc-a8b6-06e28fac40d3', 0, '2026-06-11 15:44:50'),
('1bef4ff7-66c9-4c79-ad16-c6d44a0fdd21', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your rider has picked up your order and is on the way.', '/orders/3c4b877a-0c2c-482a-802c-5f9d6cc4ec5c', 0, '2026-06-27 07:32:58'),
('1c185524-9de9-4d6d-9fde-d60595d9c622', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your rider has picked up your order and is on the way.', '/orders/bea4612c-0cc6-4573-b919-6b1d7e92e737', 0, '2026-06-27 07:32:25'),
('1c62c373-e624-4cd7-a2e2-5bb72d31687f', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹0 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-04 19:17:08'),
('1f03f495-a638-46be-9b24-026b13f92371', 'bea66595-ebda-4241-98ee-74088e7fbee1', 'order', 'New product order', 'A customer placed an order of ₹190 at Koramangala Warehouse.', '/admin/orders', 0, '2026-06-11 16:17:24'),
('1f5aa055-c61f-4586-b21e-bc6079c1fca3', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order packed', 'Your order status was updated to \"packed\".', '/orders/005de887-073b-48eb-b927-094bc2a819b1', 0, '2026-06-25 12:07:03'),
('21b8b7cf-189a-4009-bc7b-811b5d59ae69', '46b70155-77ae-4438-b691-13fb6e2e6449', 'system', 'Payout received 💰', '₹40.00 has been paid out to you.', '/rider', 0, '2026-06-19 12:44:10'),
('2378410b-ee46-4f80-b7a6-0cb2fc7da325', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹64 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-25 12:02:17'),
('240f71ec-e4ad-45b8-92c6-dd1cd92b5a6c', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹195 has been placed successfully.', '/orders/fefae47e-4d8c-4572-b452-f95a6e976890', 0, '2026-06-11 16:19:37'),
('24b94ffb-5f8c-4ad8-972f-5e46e9044590', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹260 at Resto One.', '/partner/orders', 0, '2026-06-10 09:45:14'),
('263d3b89-3675-4f83-a39f-54bc26ab5b10', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order preparing', 'Your order status was updated to \"preparing\".', '/orders/f6df52ca-aae4-4441-86ba-7df5e4e908c9', 0, '2026-06-04 19:58:47'),
('28321cba-28eb-4da4-a980-f1762df504e2', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'order', 'New food order', 'A customer placed an order of ₹155.', '/partner/orders', 0, '2026-06-10 10:03:09'),
('28b498c4-313b-45d1-9f9b-193ffa42f7fb', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹155 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-10 10:03:09'),
('2a05c784-94fb-4fb6-961c-de63050d0a3a', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'order', 'New refund request', 'Customer requested a refund of ₹260 — please verify the proof.', '/outlet/refunds', 0, '2026-06-10 09:48:30'),
('2b14a5d7-495f-4f12-92e3-3e13fae7235a', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹260 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-10 09:45:14'),
('2be39412-f1f3-4f19-a59a-ec2fdf01b007', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹260 has been placed successfully.', '/orders/2bd6ab24-6847-4628-b485-4c610927e1a1', 0, '2026-06-28 15:28:04'),
('2c187f56-a196-4137-b634-aa57588077c6', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your rider has picked up your order and is on the way.', '/orders/005de887-073b-48eb-b927-094bc2a819b1', 0, '2026-06-25 12:24:01'),
('2e806551-720e-4fee-b5f9-d8cc0a7816e2', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹155 has been placed successfully.', '/orders/001e8ad1-e66a-4cfb-a5d6-937807769467', 0, '2026-06-10 09:54:51'),
('2ef84f12-680a-4dd5-8eb0-bee6c3acf7ab', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹155 at Resto One.', '/partner/orders', 0, '2026-06-11 14:47:44'),
('316e01ec-e84f-4520-ac81-e0183750844d', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹60 has been placed successfully.', '/orders/630cc4c2-6fb2-4ef0-99f3-dea39b281819', 0, '2026-06-14 06:52:49'),
('33065906-dd02-4ee2-827c-e4f2e6f79fab', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹190 has been placed successfully.', '/orders/cf87bc7c-8531-4c15-9472-d13551647dca', 0, '2026-06-11 16:16:02'),
('347b5adc-538e-445e-95ed-649605b7e4d6', '4c00185a-b5a1-4083-9790-b261ed1d1176', 'order', 'Refund request received', 'Refund of ₹260 awaiting manager verification.', '/admin/refunds', 0, '2026-06-29 08:12:36'),
('36c71b79-7b40-4d35-b5a0-e9d341d746ae', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order has been delivered. Enjoy!', '/orders/26b069c8-7281-47fc-b60d-a2c8a13373d7', 0, '2026-06-28 15:15:07'),
('3723abae-80e0-4e11-9f22-541009f6eeec', '4c00185a-b5a1-4083-9790-b261ed1d1176', 'order', 'Refund request received', 'Refund of ₹260 awaiting manager verification.', '/admin/refunds', 0, '2026-06-10 09:48:30'),
('38aa6f45-64db-408f-8bb1-85ed44c0e8da', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'order', 'New food order', 'A customer placed an order of ₹155.', '/partner/orders', 0, '2026-06-06 05:31:25'),
('38c3c34c-65e4-4209-a3ff-7ff22268dabb', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your order status was updated to \"out for delivery\".', '/orders/2fb4ee03-7165-421e-ba37-dd76c928cf35', 0, '2026-06-05 11:17:12'),
('39b6fb5c-4e23-4f2e-80cb-dae9c233216b', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order packed', 'Your order status was updated to \"packed\".', '/orders/0a0ededf-b035-47cd-a877-9b60fac98758', 0, '2026-06-27 07:39:16'),
('3dae600d-7302-459a-8f6b-87e3ac15505e', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹155 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-05 11:16:14'),
('3e23ff8c-24c3-4de8-906d-5bb243433af1', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹155 has been placed successfully.', '/orders/46536bd4-d032-41f4-8523-b3243efdbf54', 0, '2026-06-11 14:47:44'),
('3e887983-e6c8-4bb3-ad6a-97fa3e39a9f6', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹15 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-04 19:09:54'),
('3f487ce4-3a74-4e0a-8c8f-867010c7285e', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹155 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-10 09:54:51'),
('40f91643-dae6-4f4c-bed2-c35b699fb72a', '46b70155-77ae-4438-b691-13fb6e2e6449', 'order', 'New delivery assigned', 'You have a new delivery. Open the rider app for details.', '/rider', 0, '2026-06-28 15:14:17'),
('42b92344-6cb6-414c-b33f-ea522bdfeb09', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹155 at Resto One.', '/partner/orders', 0, '2026-06-11 15:28:09'),
('432d3142-b072-4060-9a59-431c1318e9d5', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'order', 'New food order', 'A customer placed an order of ₹155.', '/partner/orders', 0, '2026-06-10 09:54:51'),
('43619a4c-676d-4ff8-adc0-5f20b43a27b3', '4c00185a-b5a1-4083-9790-b261ed1d1176', 'order', 'Refund request received', 'Refund of ₹155 awaiting manager verification.', '/admin/refunds', 0, '2026-06-06 05:33:56'),
('4637fcd4-21ad-4c64-a9c8-70786be13c2a', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹144 at Jalahalli Warehouse.', '/admin/orders', 1, '2026-06-28 15:12:48'),
('46ed14cf-541c-43d2-80bb-8d5ba70ce3c4', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order ready', 'Your order status was updated to \"ready\".', '/orders/2fb4ee03-7165-421e-ba37-dd76c928cf35', 0, '2026-06-05 11:16:55'),
('477adba2-fd06-4e45-8369-e665d66f8138', '165a0a97-a853-4166-9222-be34756a243a', 'order', 'New order received', 'A customer placed an order of ₹330.', '/outlet/orders', 0, '2026-06-11 15:27:04'),
('4797d4fe-355b-45ec-85bf-0be68935fc79', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'order', 'New order received', 'A customer placed an order of ₹330.', '/outlet/orders', 0, '2026-06-28 15:33:58'),
('4a154d65-13c5-442f-a582-500fcd336e31', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your order status was updated to \"out for delivery\".', '/orders/9e845209-06b1-45fe-bc79-98155842dcd3', 0, '2026-06-04 19:58:24'),
('51f572b1-427a-4f68-8e86-a13935a5cbb2', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New refund request', 'Customer requested a refund of ₹260 — please verify the proof.', '/admin/refunds-verify', 0, '2026-06-10 09:48:30'),
('53288cea-74dc-4881-9527-c8cffc5419e1', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order ready', 'Your order status was updated to \"ready\".', '/orders/2fb4ee03-7165-421e-ba37-dd76c928cf35', 0, '2026-06-05 11:17:17'),
('53522fe4-7cd0-4132-b3fe-52da62866151', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹15 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-04 18:49:42'),
('5425f975-a44c-45f3-a89a-83b9bf1322a3', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order ready', 'Your order status was updated to \"ready\".', '/orders/d5afb823-39b7-4b22-9b0a-e4cc7af130a6', 0, '2026-06-10 09:46:48'),
('5695fe18-fbe1-4b8e-afdb-c0d745e4977b', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹53 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-03 08:33:17'),
('576e92db-a645-4aff-8cc2-2e3c8a480814', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹155 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-06 05:31:25'),
('5871b176-4961-4632-a6c4-752c727c4e72', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹190 has been placed successfully.', '/orders/997531de-f211-4c86-a29c-a23e5ff1062d', 0, '2026-06-11 16:17:24'),
('5910ae2d-bc1e-449d-9269-01b37a5b0339', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹155 has been placed successfully.', '/orders/9e845209-06b1-45fe-bc79-98155842dcd3', 0, '2026-06-04 19:57:11'),
('5bc632d0-0396-4682-9b44-dc64a1f7fee7', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order status was updated to \"delivered\".', '/orders/2fb4ee03-7165-421e-ba37-dd76c928cf35', 0, '2026-06-05 11:17:25'),
('5daa22bb-a4e7-4bc7-bd13-9683f1a3103c', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Refund approved', 'Your refund request has been approved.', '/orders/d5afb823-39b7-4b22-9b0a-e4cc7af130a6', 0, '2026-06-10 09:50:43'),
('5dc1c870-8abc-4ac4-9245-3a69cdc6f562', 'bea66595-ebda-4241-98ee-74088e7fbee1', 'order', 'New product order', 'A customer placed an order of ₹60 at Koramangala Warehouse.', '/admin/orders', 0, '2026-06-14 06:52:49'),
('5e337c75-1806-4dea-9600-704da69b5710', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹208 at Resto One.', '/partner/orders', 0, '2026-06-04 19:53:50'),
('6023f77b-e2e4-4864-9987-aa3edb8c9d2c', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹155 has been placed successfully.', '/orders/32df275f-4fd3-4092-8198-a3188a74a8ad', 0, '2026-06-10 10:13:06'),
('60f619bc-fdba-4e9f-9b67-cefbd6456ba6', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹95 has been placed successfully.', '/orders/0a0ededf-b035-47cd-a877-9b60fac98758', 0, '2026-06-27 07:38:29'),
('64c3ef78-d0ec-4ac2-b4a1-6ae5694941ff', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your rider has picked up your order and is on the way.', '/orders/26b069c8-7281-47fc-b60d-a2c8a13373d7', 0, '2026-06-28 15:14:38'),
('650c760b-c41e-4390-855f-d024846be634', '4c00185a-b5a1-4083-9790-b261ed1d1176', 'order', 'New food order', 'A customer placed an order of ₹504 at Spice Route.', '/partner/orders', 0, '2026-06-28 15:24:49'),
('655bccc9-2394-4a72-b040-092a69b83cb0', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order ready', 'Your order status was updated to \"ready\".', '/orders/f6df52ca-aae4-4441-86ba-7df5e4e908c9', 0, '2026-06-04 19:59:09'),
('6619d989-d256-438a-947a-2775739e62d5', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹15 at Resto One.', '/partner/orders', 0, '2026-06-04 19:18:50'),
('68760b48-304a-4561-b571-fa779ea18d04', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹155 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-04 19:56:10'),
('6a0896d8-abd8-4b19-b0ba-1db9b587d1ad', '4c00185a-b5a1-4083-9790-b261ed1d1176', 'order', 'Refund ready to process', 'A manager verified a refund of ₹260. Approve to issue the refund.', '/admin/refunds', 0, '2026-06-10 09:50:13'),
('6c0ac6d9-f729-492f-8a4a-90b81c3495bf', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹81 has been placed successfully.', '/orders/fc38905f-7c51-46f3-a00d-1f6a97df8f58', 0, '2026-06-02 11:58:43'),
('6cfccf44-2b4a-491b-8a35-d888ec108bc6', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order status was updated to \"delivered\".', '/orders/d5afb823-39b7-4b22-9b0a-e4cc7af130a6', 0, '2026-06-10 09:47:04'),
('6d0efca2-0c4e-409c-b73d-9c74e7961b87', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹155 at Resto One.', '/partner/orders', 0, '2026-06-04 19:57:11'),
('6d641659-a1ad-44ba-a3ef-006a8e299026', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'order', 'New order received', 'A customer placed an order of ₹260.', '/outlet/orders', 0, '2026-06-28 15:28:04'),
('6da87e36-f5ab-4db7-9181-c89470c40ed3', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order ready', 'Your order status was updated to \"ready\".', '/orders/2bd6ab24-6847-4628-b485-4c610927e1a1', 0, '2026-06-28 15:29:18'),
('6dc153a9-8c60-4942-83b1-b519c890747c', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order has been delivered. Enjoy!', '/orders/3c4b877a-0c2c-482a-802c-5f9d6cc4ec5c', 0, '2026-06-27 07:33:11'),
('6e58b266-4ab2-4c06-b7a4-e3bcd546a610', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹504 has been placed successfully.', '/orders/b72865cf-3c91-40e1-8cf2-a5a2d7997024', 0, '2026-06-28 15:24:49'),
('6ffd8046-d433-465d-b286-582adb6fa2c3', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order has been delivered. Enjoy!', '/orders/fb6c66a9-8686-4438-89bb-34545f315233', 0, '2026-06-27 07:36:07'),
('7191e603-6c89-45ec-98b2-dc1ab12a7bc9', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'order', 'New food order', 'A customer placed an order of ₹260.', '/partner/orders', 0, '2026-06-10 09:45:14'),
('7205b44f-a147-4a77-b71d-81f4397b2cc3', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your rider has picked up your order and is on the way.', '/orders/2bd6ab24-6847-4628-b485-4c610927e1a1', 0, '2026-06-28 15:30:02'),
('77454827-3c97-4e7c-b07c-5f1efa9b1a2b', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'order', 'New food order', 'A customer placed an order of ₹155.', '/partner/orders', 0, '2026-06-10 10:13:59'),
('78133dd5-3a56-4ebe-a284-f48cc7f8f089', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹330 at Resto One.', '/partner/orders', 0, '2026-06-11 15:27:04'),
('78533d47-ffdf-40bf-9793-d0949a930e8f', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order preparing', 'Your order status was updated to \"preparing\".', '/orders/2bd6ab24-6847-4628-b485-4c610927e1a1', 0, '2026-06-28 15:29:08'),
('7afd266f-b5e7-477f-b4f3-6a6d02f5cfe4', 'bea66595-ebda-4241-98ee-74088e7fbee1', 'order', 'New product order', 'A customer placed an order of ₹103 at Koramangala Warehouse.', '/admin/orders', 0, '2026-06-14 06:25:46'),
('7b549d92-6ca1-49ed-bfbc-10cca9c7e8c6', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Refund verified', 'Your refund request was verified and forwarded to admin for processing.', '/orders/2fb4ee03-7165-421e-ba37-dd76c928cf35', 0, '2026-06-05 11:20:32'),
('7c7c2f0f-a4b7-45d3-8574-4a4cea0f01f8', '46b70155-77ae-4438-b691-13fb6e2e6449', 'order', 'New delivery assigned', 'You have a new delivery. Open the rider app for details.', '/rider', 0, '2026-06-25 12:16:28'),
('7c9bdda9-15ec-4c0c-9595-a61582ed73a9', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹15 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-04 19:18:50'),
('7de7206e-1a78-4602-8856-4500cedb7fb1', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your order status was updated to \"out for delivery\".', '/orders/2fb4ee03-7165-421e-ba37-dd76c928cf35', 0, '2026-06-05 11:17:20'),
('7f9bdbdd-83e9-4b14-9f77-c0c7327e1662', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order preparing', 'Your order status was updated to \"preparing\".', '/orders/2fb4ee03-7165-421e-ba37-dd76c928cf35', 0, '2026-06-05 11:16:50'),
('803c3f61-580f-4d3c-9d5e-d655bbe032b7', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹155 has been placed successfully.', '/orders/52bd459f-8768-4eb3-8c58-9cc8bdf32472', 0, '2026-06-11 15:28:09'),
('80657988-eb4d-44aa-b5d7-095a7b51ff3a', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order packed', 'Your order status was updated to \"packed\".', '/orders/748adbc6-0b74-4cfa-950f-cb2d6e5c16c3', 0, '2026-06-28 15:20:24'),
('8168a939-ce28-4ebb-b87a-5083120fa8d2', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order cancelled', 'Your order has been cancelled.', '/orders/b72865cf-3c91-40e1-8cf2-a5a2d7997024', 0, '2026-06-28 15:26:17'),
('81b7ad8e-10da-4a61-99e4-b539a722c852', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your order status was updated to \"out for delivery\".', '/orders/d5afb823-39b7-4b22-9b0a-e4cc7af130a6', 0, '2026-06-10 09:46:55'),
('8258ae8f-1783-4151-8d5b-c62fe1e0693d', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹53 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-03 08:25:31'),
('837225e5-4621-4ac6-8e39-3c942fa09085', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹155 has been placed successfully.', '/orders/dcc168ed-6660-40e1-a79d-670e2793d5f7', 0, '2026-06-10 10:03:09'),
('83e3ad29-7076-48c6-88f6-9390ca911ac0', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹155 has been placed successfully.', '/orders/33897dab-1551-4c00-bd1f-3f530a60c5f2', 0, '2026-06-11 15:31:13'),
('83fcb056-59e6-441c-ae25-8d65cdbadca6', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order preparing', 'Your order status was updated to \"preparing\".', '/orders/9e845209-06b1-45fe-bc79-98155842dcd3', 0, '2026-06-04 19:57:42'),
('845adea3-fef0-4c05-bae9-8f8dfc27e43b', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹64 has been placed successfully.', '/orders/005de887-073b-48eb-b927-094bc2a819b1', 0, '2026-06-25 12:02:17'),
('856f6b7d-def6-4b20-a990-3f8de64b1020', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹260 at Resto One.', '/partner/orders', 0, '2026-06-11 15:12:16'),
('86b5c74c-2929-46c2-95e0-fafd4fabfaef', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order ready', 'Your order status was updated to \"ready\".', '/orders/2bf60274-1af7-4ab4-b30b-adfce8885e81', 0, '2026-06-28 15:34:50'),
('86fb738b-2276-4b61-923d-19b591af1002', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹155 at Resto One.', '/partner/orders', 0, '2026-06-10 09:54:51'),
('8a679863-7f60-4e53-bcdb-ac35718f2700', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Refund approved', 'Your refund request has been approved.', '/orders/fc773aac-dff8-436c-b6c4-ff10e506e06c', 0, '2026-06-06 05:35:25'),
('8c80cc6c-650c-4ac8-94bc-b00f0a33bc6c', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹65 has been placed successfully.', '/orders/e0848c14-575d-4039-9c47-e4b6cdd69a63', 0, '2026-06-13 17:43:45'),
('933964b8-1d47-4ba0-b3f6-37d27df32c70', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹155 at Resto One.', '/partner/orders', 0, '2026-06-10 10:13:06'),
('93c56d2e-ff62-4526-bb74-410aee194f5a', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'order', 'New refund request', 'Customer requested a refund of ₹260 — please verify the proof.', '/outlet/refunds', 0, '2026-06-29 08:12:35'),
('97fd16e3-370a-4106-b80f-bdaf0463f100', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹103 has been placed successfully.', '/orders/bea4612c-0cc6-4573-b919-6b1d7e92e737', 0, '2026-06-14 06:25:46'),
('9a42cddb-d9ae-41ab-b14e-cb622203f101', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹155 has been placed successfully.', '/orders/470cad36-3450-47b1-a83a-93fc00c1ccb8', 0, '2026-06-10 10:13:59'),
('9c7cee94-e98b-4264-92f4-ba8e186a12bb', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹95 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-27 07:38:30'),
('9d7c620f-5e91-48ad-8ae0-46c1b73b1bd2', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order has been delivered. Enjoy!', '/orders/2bf60274-1af7-4ab4-b30b-adfce8885e81', 0, '2026-06-28 15:36:19'),
('9e98ebb6-1d77-4d6c-9bad-d139821f81df', '46b70155-77ae-4438-b691-13fb6e2e6449', 'order', 'New delivery assigned', 'You have a new delivery. Open the rider app for details.', '/rider', 0, '2026-06-21 23:10:15'),
('a1ef3056-f3c7-4bb2-9aed-0046bfd8ee05', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order ready', 'Your order status was updated to \"ready\".', '/orders/9e845209-06b1-45fe-bc79-98155842dcd3', 0, '2026-06-04 19:57:58'),
('a33640a8-1d53-4f9b-b969-07033b5eb98b', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹155 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-04 19:57:11'),
('a425eb2e-3010-4db5-84ad-59003b11ce81', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹208 has been placed successfully.', '/orders/d0ca13c4-64a6-4f61-b0f9-80d3a1ccab1a', 0, '2026-06-04 19:53:50'),
('a5440805-bb1a-4bc0-999d-5c0462f5175d', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹155 at Resto One.', '/partner/orders', 0, '2026-06-06 05:31:25'),
('a556fe02-e24a-40c9-8789-2023a1dc4a24', '46b70155-77ae-4438-b691-13fb6e2e6449', 'system', 'Payout received 💰', '₹1,080.00 has been paid out to you.', '/rider', 0, '2026-06-28 15:38:57'),
('a73e11f8-9ba8-458f-9fa0-be790709fd74', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order has been delivered. Enjoy!', '/orders/005de887-073b-48eb-b927-094bc2a819b1', 0, '2026-06-25 12:24:28'),
('a75132f0-621d-449c-8471-70451c59d88d', '4c00185a-b5a1-4083-9790-b261ed1d1176', 'order', 'Refund ready to process', 'A manager verified a refund of ₹155. Approve to issue the refund.', '/admin/refunds', 1, '2026-06-06 05:34:26'),
('a832b4a4-882f-471b-a226-02f9ff6ce906', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'order', 'New refund request', 'Customer requested a refund of ₹155 — please verify the proof.', '/outlet/refunds', 0, '2026-06-06 05:33:56'),
('a9e4dcb6-9f90-4bc0-8157-e4943c76c59c', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order status was updated to \"delivered\".', '/orders/fc773aac-dff8-436c-b6c4-ff10e506e06c', 0, '2026-06-06 05:32:38'),
('ab0b1aef-edaf-4e70-80f8-35b0663c2081', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your rider has picked up your order and is on the way.', '/orders/748adbc6-0b74-4cfa-950f-cb2d6e5c16c3', 0, '2026-06-28 15:21:50'),
('ab82cbbf-2ada-463e-a696-ced816c4e416', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your order status was updated to \"out for delivery\".', '/orders/005de887-073b-48eb-b927-094bc2a819b1', 0, '2026-06-25 12:12:29'),
('ac67c86e-5366-4f13-8ea2-5b82d2e4c6fb', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹155 has been placed successfully.', '/orders/d77d3cb4-f484-4fef-acee-a7414917d3a0', 0, '2026-06-09 06:44:30'),
('b08ce2c5-8ce2-4809-b138-19ecc5e96414', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹155 at Resto One.', '/partner/orders', 0, '2026-06-10 10:13:59'),
('b328d454-366b-4d66-a75b-d0e1f942135d', '46b70155-77ae-4438-b691-13fb6e2e6449', 'system', 'You\'re approved 🎉', 'You can now start accepting deliveries.', '/rider', 1, '2026-06-19 11:42:54'),
('b5e4f917-97ce-497e-a3e1-3dfdeef2aa3b', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order preparing', 'Your order status was updated to \"preparing\".', '/orders/fc773aac-dff8-436c-b6c4-ff10e506e06c', 0, '2026-06-06 05:32:19'),
('b6639db4-8a82-497e-8e48-3ff0138c86e5', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your rider has picked up your order and is on the way.', '/orders/e0848c14-575d-4039-9c47-e4b6cdd69a63', 0, '2026-06-27 07:15:14'),
('b665b7a2-c6e8-4414-a057-dee93243fd90', 'bea66595-ebda-4241-98ee-74088e7fbee1', 'order', 'New product order', 'A customer placed an order of ₹209 at Koramangala Warehouse.', '/admin/orders', 1, '2026-06-28 15:19:12'),
('b861d52d-f259-4295-b9a3-c1b345c6c169', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹103 has been placed successfully.', '/orders/bd886399-8d50-49c8-aa11-c91fccba320c', 1, '2026-06-13 17:30:04'),
('b8cdc7f5-bd4d-45d9-8369-2a609a201c88', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹155 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-09 06:44:30'),
('b9fd13ff-ed9e-44fc-a1c7-d923e9d2ceb7', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹144 has been placed successfully.', '/orders/26b069c8-7281-47fc-b60d-a2c8a13373d7', 0, '2026-06-28 15:12:48'),
('baa9b839-c0bd-4bfb-97a3-60211ce5231f', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'order', 'New food order', 'A customer placed an order of ₹155.', '/partner/orders', 0, '2026-06-10 10:13:06'),
('bb26019c-083f-4eb2-89d8-d1f588c264c2', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹155 at Resto One.', '/partner/orders', 0, '2026-06-04 19:56:10'),
('bd1886b8-4b07-49c4-a5ed-252791a60c3d', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹15 at Resto One.', '/partner/orders', 0, '2026-06-04 19:09:54'),
('bd77fd9a-cf28-4a77-8414-9900bacab7e6', '165a0a97-a853-4166-9222-be34756a243a', 'order', 'New order received', 'A customer placed an order of ₹155.', '/outlet/orders', 0, '2026-06-11 15:31:13'),
('bf2a0794-3679-4103-91ee-bb9a0367bac2', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹125 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-10 09:52:52'),
('bf71078c-7634-459e-8fc2-5ecd11951162', 'bea66595-ebda-4241-98ee-74088e7fbee1', 'order', 'New product order', 'A customer placed an order of ₹190 at Koramangala Warehouse.', '/admin/orders', 1, '2026-06-11 16:16:02'),
('bf8d992e-d4fe-44c6-9776-5822f49f0b47', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'order', 'New food order', 'A customer placed an order of ₹155.', '/partner/orders', 0, '2026-06-09 06:44:30'),
('c0a92b18-0279-4b6b-bc30-f1c896fabcb6', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹155 at Resto One.', '/partner/orders', 0, '2026-06-11 15:31:13'),
('c2f91059-1f05-49e5-9f2a-f5c831470726', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'system', 'Submitted for review', 'We\'ll verify your documents within 24 hours and notify you.', '/partner', 1, '2026-06-03 11:34:05'),
('c5c40252-9f74-4960-a108-799200eb0025', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your order status was updated to \"out for delivery\".', '/orders/f6df52ca-aae4-4441-86ba-7df5e4e908c9', 0, '2026-06-04 19:59:22'),
('c6c4f0d8-9d61-4819-8bfc-e8572a18cd4b', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order ready', 'Your order status was updated to \"ready\".', '/orders/fc773aac-dff8-436c-b6c4-ff10e506e06c', 0, '2026-06-06 05:32:24'),
('c74d623c-2cfc-4146-b215-c7947182b8d0', '46b70155-77ae-4438-b691-13fb6e2e6449', 'order', 'New delivery assigned', 'You have a new delivery. Open the rider app for details.', '/rider', 0, '2026-06-27 07:42:57'),
('c84fba9c-dc9b-4713-805f-5cff203c8b3e', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹155 has been placed successfully.', '/orders/2fb4ee03-7165-421e-ba37-dd76c928cf35', 0, '2026-06-05 11:16:14'),
('c8540db6-e9d4-44e6-9cbf-6181c7b96453', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹15 has been placed successfully.', '/orders/275c6ee2-9c32-444d-8832-7bdab27af543', 1, '2026-06-04 18:49:42'),
('c9de4e42-803c-49a0-9dda-a4c3c9f28b17', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order has been delivered. Enjoy!', '/orders/0a0ededf-b035-47cd-a877-9b60fac98758', 0, '2026-06-27 07:44:38'),
('c9efb862-0319-4b6a-9ff3-bf5a9e155456', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order has been delivered. Enjoy!', '/orders/12013e51-6310-4a8b-810f-84a1f3628399', 0, '2026-06-27 07:36:18'),
('caf3cc96-934f-4771-a456-8260180b53d2', '165a0a97-a853-4166-9222-be34756a243a', 'order', 'New food order', 'A customer placed an order of ₹155.', '/partner/orders', 0, '2026-06-10 10:13:06'),
('cb74be7c-d280-433b-b7f5-2beede5339d3', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹155 has been placed successfully.', '/orders/f6df52ca-aae4-4441-86ba-7df5e4e908c9', 0, '2026-06-04 19:56:10'),
('cba11f10-d0dd-44f9-91df-065e31151eb6', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order preparing', 'Your order status was updated to \"preparing\".', '/orders/470cad36-3450-47b1-a83a-93fc00c1ccb8', 0, '2026-06-11 14:44:35'),
('ce4bc415-859e-47e7-b112-d166d3819136', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹53 has been placed successfully.', '/orders/f81d3e5e-aab7-4e94-8d51-70b349467ad2', 0, '2026-06-03 08:25:31'),
('cea2b05c-f01b-4aaa-b460-8802f731f988', '46b70155-77ae-4438-b691-13fb6e2e6449', 'system', 'Payout received 💰', '₹40.00 has been paid out to you.', '/rider', 0, '2026-06-19 12:45:31'),
('cff1c14b-d930-40d6-925f-28b9dcf3ac17', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your rider has picked up your order and is on the way.', '/orders/12013e51-6310-4a8b-810f-84a1f3628399', 0, '2026-06-27 07:36:09'),
('d00ef0ce-32e8-4324-a006-b008e33a981e', 'bea66595-ebda-4241-98ee-74088e7fbee1', 'order', 'New product order', 'A customer placed an order of ₹115 at Koramangala Warehouse.', '/admin/orders', 0, '2026-06-11 15:44:50'),
('d1e77158-3934-4e4f-b145-4784bd0c9218', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'order', 'New order received', 'A customer placed an order of ₹155.', '/outlet/orders', 0, '2026-06-11 15:28:09'),
('d28a0296-79dd-4225-9999-32b337d1406d', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹353 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-09 06:42:22'),
('d56d128e-795c-4384-88e8-0a294a8e5f38', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹195 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-11 16:19:37'),
('d6936e6a-c136-4ef0-b3ba-25a9886362a5', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your rider has picked up your order and is on the way.', '/orders/630cc4c2-6fb2-4ef0-99f3-dea39b281819', 0, '2026-06-27 07:32:46'),
('d78da279-7944-4e29-bdb5-7bc48e012c4d', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹155 at Resto One.', '/partner/orders', 0, '2026-06-05 11:16:14'),
('d7a9c7c8-9a64-4c1b-b46a-da74ecd4d86d', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your order status was updated to \"out for delivery\".', '/orders/fc773aac-dff8-436c-b6c4-ff10e506e06c', 0, '2026-06-06 05:32:30'),
('dab2c91f-1563-426f-8d4d-ad3b23b32362', 'bea66595-ebda-4241-98ee-74088e7fbee1', 'order', 'New product order', 'A customer placed an order of ₹103 at Koramangala Warehouse.', '/admin/orders', 0, '2026-06-13 17:30:04'),
('dd243c1f-7f57-41f5-84a7-5985ba7add4d', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹15 has been placed successfully.', '/orders/a6aa9811-d973-4ae4-9df5-f0a40f47ca37', 0, '2026-06-04 19:09:54'),
('de4372bf-d29a-4e0b-9eb4-a777081c9bc5', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹53 has been placed successfully.', '/orders/8fb0b939-6494-436b-850a-351de1a624f1', 0, '2026-06-03 08:33:17'),
('e09efeb2-d194-417e-8ebd-ac0c07c884cc', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹260 has been placed successfully.', '/orders/d5afb823-39b7-4b22-9b0a-e4cc7af130a6', 0, '2026-06-10 09:45:14'),
('e3d3e66c-1156-4ca6-9869-c51ddb00b312', '165a0a97-a853-4166-9222-be34756a243a', 'order', 'New order received', 'A customer placed an order of ₹260.', '/outlet/orders', 0, '2026-06-11 15:12:16'),
('e447feae-413f-437c-aca4-03f130a1ad0e', '46b70155-77ae-4438-b691-13fb6e2e6449', 'order', 'New delivery assigned', 'You have a new delivery. Open the rider app for details.', '/rider', 0, '2026-06-28 15:29:30'),
('e5a30189-eabb-479e-9be6-bc3c1d423e57', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order has been delivered. Enjoy!', '/orders/630cc4c2-6fb2-4ef0-99f3-dea39b281819', 0, '2026-06-27 07:32:55'),
('e5fa63c8-23f7-475c-9e29-eb9b23b03200', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Refund verified', 'Your refund request was verified and forwarded to admin for processing.', '/orders/fc773aac-dff8-436c-b6c4-ff10e506e06c', 0, '2026-06-06 05:34:26'),
('e74e7127-7290-4c5b-a241-110daf5bd789', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order preparing', 'Your order status was updated to \"preparing\".', '/orders/2bf60274-1af7-4ab4-b30b-adfce8885e81', 0, '2026-06-28 15:34:37'),
('e7ecf150-07cf-4c87-a3aa-8007971287fd', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹0 has been placed successfully.', '/orders/3c4b877a-0c2c-482a-802c-5f9d6cc4ec5c', 0, '2026-06-04 19:17:08'),
('e8abfee7-f428-413b-9460-bcca2c659dc2', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹81 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-02 11:58:43'),
('eaabf264-3645-4a5e-b343-d37c6ffb57c0', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Refund approved', 'Your refund request has been approved.', '/orders/2fb4ee03-7165-421e-ba37-dd76c928cf35', 0, '2026-06-05 11:21:30'),
('ebde0d1b-2619-4626-bd2f-3bda41970f11', '4c00185a-b5a1-4083-9790-b261ed1d1176', 'order', 'New food order', 'A customer placed an order of ₹353 at Spice Route.', '/partner/orders', 0, '2026-06-09 06:42:22'),
('eca5815b-9611-40fb-b208-b26ef8c5b671', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order preparing', 'Your order status was updated to \"preparing\".', '/orders/d5afb823-39b7-4b22-9b0a-e4cc7af130a6', 0, '2026-06-10 09:46:37'),
('ee2d9894-80db-493d-9f16-fdc0fa789bba', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹260 at Resto One.', '/partner/orders', 0, '2026-06-28 15:28:04'),
('ee9dfb13-1178-415e-8db9-12f8c0dc197d', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹155 at Resto One.', '/partner/orders', 0, '2026-06-10 10:03:09'),
('f13d8063-8fd5-4098-a328-ebb3e5adb00a', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'order', 'New order received', 'A customer placed an order of ₹260.', '/outlet/orders', 0, '2026-06-11 15:12:16'),
('f164f9d6-9657-495a-b9f3-a88c1d77e35a', '165a0a97-a853-4166-9222-be34756a243a', 'order', 'New order received', 'A customer placed an order of ₹155.', '/outlet/orders', 0, '2026-06-11 14:47:44'),
('f1abeac7-2f38-4964-b414-79be946bf382', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order status was updated to \"delivered\".', '/orders/9e845209-06b1-45fe-bc79-98155842dcd3', 0, '2026-06-04 19:58:33'),
('f204ee15-515d-49f6-a525-86c6d6cf9e74', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order has been delivered. Enjoy!', '/orders/2bd6ab24-6847-4628-b485-4c610927e1a1', 0, '2026-06-28 15:30:20'),
('f3ae1107-83fb-482a-b67e-b108491eeac2', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order has been delivered. Enjoy!', '/orders/e0848c14-575d-4039-9c47-e4b6cdd69a63', 0, '2026-06-27 07:15:32'),
('f4ba1889-7c99-4dc6-b60d-21a26f019f08', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order packed', 'Your order status was updated to \"packed\".', '/orders/26b069c8-7281-47fc-b60d-a2c8a13373d7', 0, '2026-06-28 15:13:57'),
('f536b0cf-9965-4949-89b6-c11fca9be5b4', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order out for delivery', 'Your rider has picked up your order and is on the way.', '/orders/2bf60274-1af7-4ab4-b30b-adfce8885e81', 0, '2026-06-28 15:35:33'),
('f761bcd4-b1d9-47a2-af8b-0391fc749a54', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹15 has been placed successfully.', '/orders/fb6c66a9-8686-4438-89bb-34545f315233', 0, '2026-06-04 19:18:50'),
('f894e406-48fa-4352-9350-ad9495d85cc0', '46b70155-77ae-4438-b691-13fb6e2e6449', 'order', 'New delivery assigned', 'You have a new delivery. Open the rider app for details.', '/rider', 0, '2026-06-21 23:10:37'),
('f96ad81e-6ecb-44ee-ae69-cc18f7010039', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹208 at Jalahalli Warehouse.', '/admin/orders', 0, '2026-06-04 19:53:50'),
('fa373e85-28c7-464a-9695-2d5ebb1d6eae', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order delivered', 'Your order has been delivered. Enjoy!', '/orders/748adbc6-0b74-4cfa-950f-cb2d6e5c16c3', 0, '2026-06-28 15:22:36'),
('fb654281-d95b-48c5-b294-047b1dac6928', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Rider assigned', 'A delivery rider has been assigned to your order.', '/orders/0a0ededf-b035-47cd-a877-9b60fac98758', 0, '2026-06-27 07:42:58'),
('fbf6bd03-f380-40df-a910-aa90a1750a7f', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹209 has been placed successfully.', '/orders/748adbc6-0b74-4cfa-950f-cb2d6e5c16c3', 0, '2026-06-28 15:19:12'),
('fc11dd5b-6deb-47c6-bd74-cf7797578ba1', '165a0a97-a853-4166-9222-be34756a243a', 'order', 'New food order', 'A customer placed an order of ₹155.', '/partner/orders', 0, '2026-06-10 10:13:59'),
('fd800f5e-256c-480e-b216-353aa794aa44', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'order', 'New food order', 'A customer placed an order of ₹155 at Resto One.', '/partner/orders', 0, '2026-06-09 06:44:30'),
('fdbda343-9bfc-4fc1-9034-77bbf4526c65', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'order', 'Order placed', 'Your order of ₹330 has been placed successfully.', '/orders/2bf60274-1af7-4ab4-b30b-adfce8885e81', 0, '2026-06-28 15:33:57'),
('fe74759a-df85-4c1f-a1fc-2879f173e042', 'd494ced3-5a24-4492-b299-3126796c2da9', 'order', 'New product order', 'A customer placed an order of ₹155 at Jalahalli Warehouse.', '/admin/orders', 1, '2026-06-11 15:28:09');

-- --------------------------------------------------------

--
-- Table structure for table `offer_tiles`
--

CREATE TABLE `offer_tiles` (
  `id` char(36) NOT NULL,
  `title` varchar(120) NOT NULL,
  `subtitle` varchar(200) DEFAULT '',
  `cta_label` varchar(40) DEFAULT 'Shop',
  `link_to` varchar(255) DEFAULT '/',
  `tint` varchar(60) DEFAULT 'oklch(0.93 0.1 95)',
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `offer_tiles`
--

INSERT INTO `offer_tiles` (`id`, `title`, `subtitle`, `cta_label`, `link_to`, `tint`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
('tile-dairy', 'Dairy & Eggs', 'Fresh farm products', 'Shop Now', '/c/dairy', 'oklch(0.93 0.10 95)', 1, 1, '2026-06-06 07:59:16', '2026-06-06 07:59:16'),
('tile-paan', 'Paan Corner', 'Delivered in minutes', 'Shop Now', '/c/paan', 'oklch(0.92 0.12 30)', 1, 0, '2026-06-06 07:59:16', '2026-06-06 07:59:16'),
('tile-veggies', 'Fresh Veggies', 'Straight from farm', 'Shop Now', '/c/vegetables', 'oklch(0.93 0.10 145)', 1, 2, '2026-06-06 07:59:16', '2026-06-06 07:59:16');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `restaurant_id` char(36) DEFAULT NULL,
  `warehouse_id` char(36) DEFAULT NULL,
  `outlet_id` char(36) DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`address`)),
  `payment` enum('upi','card','cod') NOT NULL,
  `subtotal` int(11) NOT NULL,
  `delivery` int(11) NOT NULL DEFAULT 0,
  `total` int(11) NOT NULL,
  `status` enum('placed','accepted','preparing','packed','ready','out_for_delivery','delivered','cancelled') NOT NULL DEFAULT 'placed',
  `payment_status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `razorpay_order_id` varchar(80) DEFAULT NULL,
  `razorpay_payment_id` varchar(80) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `restaurant_id`, `warehouse_id`, `outlet_id`, `items`, `address`, `payment`, `subtotal`, `delivery`, `total`, `status`, `payment_status`, `created_at`, `razorpay_order_id`, `razorpay_payment_id`) VALUES
('001e8ad1-e66a-4cfb-a5d6-937807769467', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', '457d3b3b-d1a9-4cbe-8507-2ca103da9781', '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'card', 100, 55, 155, 'delivered', 'paid', '2026-06-10 09:54:51', NULL, NULL),
('005de887-073b-48eb-b927-094bc2a819b1', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"47dc18c8-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Onion\",\"weight\":\"1 kg\",\"price\":39,\"mrp\":50,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1518977956812-cd3dbadaaf31?w=400\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'cod', 39, 25, 64, 'delivered', 'pending', '2026-06-25 12:02:17', NULL, NULL),
('0a0ededf-b035-47cd-a877-9b60fac98758', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"a2a55fe3-5ddd-11f1-8fe0-48777afc85a1\",\"name\":\"Amul Gold Milk\",\"weight\":\"500 ml\",\"price\":35,\"mrp\":38,\"image\":\"https:\\/\\/placehold.co\\/300\"},\"qty\":2}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'upi', 70, 25, 95, 'delivered', 'paid', '2026-06-27 07:38:29', NULL, NULL),
('12013e51-6310-4a8b-810f-84a1f3628399', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"a2a55fe3-5ddd-11f1-8fe0-48777afc85a1\",\"name\":\"Amul Gold Milk\",\"weight\":\"500 ml\",\"price\":35,\"mrp\":38,\"image\":\"https:\\/\\/placehold.co\\/300\"},\"qty\":2}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'cod', 70, 25, 95, 'delivered', 'pending', '2026-06-02 11:14:19', NULL, NULL),
('26b069c8-7281-47fc-b60d-a2c8a13373d7', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"47dc1ad4-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Farm Eggs (6)\",\"weight\":\"6 pcs\",\"price\":55,\"mrp\":60,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1582722872445-44dc5f7e3c8f?w=400\"},\"qty\":1},{\"product\":{\"id\":\"47dc1941-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Potato\",\"weight\":\"1 kg\",\"price\":32,\"mrp\":40,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1518977676601-b53f82aba655?w=400\"},\"qty\":2}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'upi', 119, 25, 144, 'delivered', 'paid', '2026-06-28 15:12:48', NULL, NULL),
('275c6ee2-9c32-444d-8832-7bdab27af543', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":0,\"mrp\":0,\"image\":\"\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'upi', 0, 15, 15, 'delivered', 'paid', '2026-06-04 18:49:42', NULL, NULL),
('2bd6ab24-6847-4628-b485-4c610927e1a1', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', NULL, '457d3b3b-d1a9-4cbe-8507-2ca103da9781', '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1555396273-367ea4eb4db5?w=800\"},\"qty\":2}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'upi', 200, 60, 260, 'delivered', 'paid', '2026-06-28 15:28:04', NULL, NULL),
('2bf60274-1af7-4ab4-b30b-adfce8885e81', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', NULL, '457d3b3b-d1a9-4cbe-8507-2ca103da9781', '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":3}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'cod', 300, 30, 330, 'delivered', 'pending', '2026-06-28 15:33:57', NULL, NULL),
('2fb4ee03-7165-421e-ba37-dd76c928cf35', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', '457d3b3b-d1a9-4cbe-8507-2ca103da9781', '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'cod', 100, 55, 155, 'delivered', 'pending', '2026-06-05 11:16:14', NULL, NULL),
('32df275f-4fd3-4092-8198-a3188a74a8ad', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', NULL, '457d3b3b-d1a9-4cbe-8507-2ca103da9781', '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560087\",\"type\":\"Home\",\"is_default\":false}', 'cod', 100, 55, 155, 'placed', 'pending', '2026-06-10 10:13:06', NULL, NULL),
('33897dab-1551-4c00-bd1f-3f530a60c5f2', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', NULL, '832c5fda-0e86-4e53-ae0e-5e89e6ad107a', '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560087\",\"type\":\"Home\",\"is_default\":false}', 'cod', 100, 55, 155, 'placed', 'pending', '2026-06-11 15:31:13', NULL, NULL),
('3c4b877a-0c2c-482a-802c-5f9d6cc4ec5c', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":0,\"mrp\":0,\"image\":\"\"},\"qty\":2}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'cod', 0, 0, 0, 'delivered', 'pending', '2026-06-04 19:17:08', NULL, NULL),
('46536bd4-d032-41f4-8523-b3243efdbf54', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', NULL, '457d3b3b-d1a9-4cbe-8507-2ca103da9781', '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560087\",\"type\":\"Home\",\"is_default\":false}', 'card', 100, 55, 155, 'delivered', 'paid', '2026-06-11 14:47:44', NULL, NULL),
('470cad36-3450-47b1-a83a-93fc00c1ccb8', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', NULL, '457d3b3b-d1a9-4cbe-8507-2ca103da9781', '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560087\",\"type\":\"Home\",\"is_default\":false}', 'cod', 100, 55, 155, 'delivered', 'pending', '2026-06-10 10:13:59', NULL, NULL),
('52bd459f-8768-4eb3-8c58-9cc8bdf32472', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', '457d3b3b-d1a9-4cbe-8507-2ca103da9781', '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'cod', 100, 55, 155, 'delivered', 'pending', '2026-06-11 15:28:09', NULL, NULL),
('630cc4c2-6fb2-4ef0-99f3-dea39b281819', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, '062f16ad-3644-48b2-a65c-857b1146ed7d', NULL, '[{\"product\":{\"id\":\"a2a55fe3-5ddd-11f1-8fe0-48777afc85a1\",\"name\":\"Amul Gold Milk\",\"weight\":\"500 ml\",\"price\":35,\"mrp\":38,\"image\":\"https:\\/\\/placehold.co\\/300\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560087\",\"type\":\"Home\",\"is_default\":false}', 'upi', 35, 25, 60, 'delivered', 'paid', '2026-06-14 06:52:49', NULL, NULL),
('748adbc6-0b74-4cfa-950f-cb2d6e5c16c3', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, '062f16ad-3644-48b2-a65c-857b1146ed7d', NULL, '[{\"product\":{\"id\":\"47dc1972-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Carrot\",\"weight\":\"500 g\",\"price\":29,\"mrp\":40,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1598170845058-32b9d6a5da37?w=400\"},\"qty\":1},{\"product\":{\"id\":\"47dc18c8-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Onion\",\"weight\":\"1 kg\",\"price\":39,\"mrp\":50,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1518977956812-cd3dbadaaf31?w=400\"},\"qty\":1},{\"product\":{\"id\":\"47dc19a1-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Robusta Banana\",\"weight\":\"1 kg\",\"price\":49,\"mrp\":60,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1571771894821-ce9b6c11b08e?w=400\"},\"qty\":1},{\"product\":{\"id\":\"47dc1941-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Potato\",\"weight\":\"1 kg\",\"price\":32,\"mrp\":40,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1518977676601-b53f82aba655?w=400\"},\"qty\":1},{\"product\":{\"id\":\"47dc16c9-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Tomato Local\",\"weight\":\"1 kg\",\"price\":35,\"mrp\":45,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1546470427-e3e1f1c9c1d6?w=400\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560087\",\"type\":\"Home\",\"is_default\":false}', 'card', 184, 25, 209, 'delivered', 'paid', '2026-06-28 15:19:12', NULL, NULL),
('80e10078-2172-45e0-86e6-944430161a0e', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', NULL, '832c5fda-0e86-4e53-ae0e-5e89e6ad107a', '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":2}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560087\",\"type\":\"Home\",\"is_default\":false}', 'card', 200, 60, 260, 'placed', 'paid', '2026-06-11 15:12:16', NULL, NULL),
('8ba9593c-0e59-4b4d-88bc-41f568e9b5e2', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"a2a55fe3-5ddd-11f1-8fe0-48777afc85a1\",\"name\":\"Amul Gold Milk\",\"weight\":\"500 ml\",\"price\":35,\"mrp\":38,\"image\":\"https:\\/\\/placehold.co\\/300\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'card', 35, 25, 60, 'delivered', 'paid', '2026-06-02 06:48:02', NULL, NULL),
('8fb0b939-6494-436b-850a-351de1a624f1', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"a2a56125-5ddd-11f1-8fe0-48777afc85a1\",\"name\":\"Tata Salt\",\"weight\":\"1 kg\",\"price\":28,\"mrp\":30,\"image\":\"https:\\/\\/placehold.co\\/300\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'cod', 28, 25, 53, 'delivered', 'pending', '2026-06-03 08:33:17', NULL, NULL),
('997531de-f211-4c86-a29c-a23e5ff1062d', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, '062f16ad-3644-48b2-a65c-857b1146ed7d', NULL, '[{\"product\":{\"id\":\"47dc1c4c-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Coca-Cola\",\"weight\":\"750 ml\",\"price\":40,\"mrp\":45,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1625772299848-391b6a87d7b3?w=400\"},\"qty\":1},{\"product\":{\"id\":\"47dc1cf3-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Red Bull Energy\",\"weight\":\"250 ml\",\"price\":125,\"mrp\":130,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1613218985075-86440fa1ce1c?w=400\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560087\",\"type\":\"Home\",\"is_default\":false}', 'cod', 165, 25, 190, 'placed', 'pending', '2026-06-11 16:17:24', NULL, NULL),
('9a960c43-c74e-4550-9eb3-a819252ab9fd', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"a2a55fe3-5ddd-11f1-8fe0-48777afc85a1\",\"name\":\"Amul Gold Milk\",\"weight\":\"500 ml\",\"price\":35,\"mrp\":38,\"image\":\"https:\\/\\/placehold.co\\/300\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'card', 35, 25, 60, 'delivered', 'paid', '2026-06-02 11:20:30', NULL, NULL),
('9e845209-06b1-45fe-bc79-98155842dcd3', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'cod', 100, 55, 155, 'delivered', 'pending', '2026-06-04 19:57:11', NULL, NULL),
('a6728210-91ee-4546-af25-04a922ba50fb', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '47dee8ed-60f4-11f1-8fe0-48777afc85a1', 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"47e1fa1f-60f4-11f1-8fe0-48777afc85a1|_\",\"name\":\"Chicken Biryani\",\"weight\":\"Spice Route\",\"price\":289,\"mrp\":289,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1563379091339-03b21ab4a4f8?w=600\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'cod', 289, 64, 353, 'delivered', 'pending', '2026-06-09 06:42:22', NULL, NULL),
('a6aa9811-d973-4ae4-9df5-f0a40f47ca37', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":0,\"mrp\":0,\"image\":\"\"},\"qty\":2}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'upi', 0, 15, 15, 'delivered', 'paid', '2026-06-04 19:09:54', NULL, NULL),
('b72865cf-3c91-40e1-8cf2-a5a2d7997024', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '47dee8ed-60f4-11f1-8fe0-48777afc85a1', NULL, NULL, '[{\"product\":{\"id\":\"47e1fa1f-60f4-11f1-8fe0-48777afc85a1|_\",\"name\":\"Chicken Biryani\",\"weight\":\"Spice Route\",\"price\":289,\"mrp\":289,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1563379091339-03b21ab4a4f8?w=600\"},\"qty\":1},{\"product\":{\"id\":\"47e1fa0b-60f4-11f1-8fe0-48777afc85a1|_\",\"name\":\"Garlic Naan\",\"weight\":\"Spice Route\",\"price\":49,\"mrp\":49,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1626700051175-6818013e1d4f?w=600\"},\"qty\":2},{\"product\":{\"id\":\"47e1f9ff-60f4-11f1-8fe0-48777afc85a1|_\",\"name\":\"Gulab Jamun\",\"weight\":\"Spice Route\",\"price\":79,\"mrp\":79,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1601303516534-bf18d6d22e74?w=600\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'cod', 466, 38, 504, 'cancelled', 'pending', '2026-06-28 15:24:49', NULL, NULL),
('baa6fc40-8b29-4732-8689-483c44fbc8af', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"a2a55fe3-5ddd-11f1-8fe0-48777afc85a1\",\"name\":\"Amul Gold Milk\",\"weight\":\"500 ml\",\"price\":35,\"mrp\":38,\"image\":\"https:\\/\\/placehold.co\\/300\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'card', 35, 25, 60, 'delivered', 'paid', '2026-06-02 13:29:01', NULL, NULL),
('bd886399-8d50-49c8-aa11-c91fccba320c', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, '062f16ad-3644-48b2-a65c-857b1146ed7d', NULL, '[{\"product\":{\"id\":\"47dc18c8-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Onion\",\"weight\":\"1 kg\",\"price\":39,\"mrp\":50,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1518977956812-cd3dbadaaf31?w=400\"},\"qty\":2}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560087\",\"type\":\"Home\",\"is_default\":false}', 'cod', 78, 25, 103, 'delivered', 'pending', '2026-06-13 17:30:03', NULL, NULL),
('bea4612c-0cc6-4573-b919-6b1d7e92e737', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, '062f16ad-3644-48b2-a65c-857b1146ed7d', NULL, '[{\"product\":{\"id\":\"47dc18c8-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Onion\",\"weight\":\"1 kg\",\"price\":39,\"mrp\":50,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1518977956812-cd3dbadaaf31?w=400\"},\"qty\":2}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560087\",\"type\":\"Home\",\"is_default\":false}', 'cod', 78, 25, 103, 'delivered', 'pending', '2026-06-14 06:25:46', NULL, NULL),
('cf87bc7c-8531-4c15-9472-d13551647dca', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, '062f16ad-3644-48b2-a65c-857b1146ed7d', NULL, '[{\"product\":{\"id\":\"47dc1c4c-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Coca-Cola\",\"weight\":\"750 ml\",\"price\":40,\"mrp\":45,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1625772299848-391b6a87d7b3?w=400\"},\"qty\":1},{\"product\":{\"id\":\"47dc1cf3-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Red Bull Energy\",\"weight\":\"250 ml\",\"price\":125,\"mrp\":130,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1613218985075-86440fa1ce1c?w=400\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560087\",\"type\":\"Home\",\"is_default\":false}', 'cod', 165, 25, 190, 'delivered', 'pending', '2026-06-11 16:16:02', NULL, NULL),
('d0ca13c4-64a6-4f61-b0f9-80d3a1ccab1a', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":2}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'cod', 200, 8, 208, 'delivered', 'pending', '2026-06-04 19:53:50', NULL, NULL),
('d5afb823-39b7-4b22-9b0a-e4cc7af130a6', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', '457d3b3b-d1a9-4cbe-8507-2ca103da9781', '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":2}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'cod', 200, 60, 260, 'delivered', 'pending', '2026-06-10 09:45:14', NULL, NULL),
('d77d3cb4-f484-4fef-acee-a7414917d3a0', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', '457d3b3b-d1a9-4cbe-8507-2ca103da9781', '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'cod', 100, 55, 155, 'delivered', 'pending', '2026-06-09 06:44:30', NULL, NULL),
('d8c0d6fd-13d2-4419-95f7-6a32f23801b7', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'card', 100, 25, 125, 'delivered', 'paid', '2026-06-10 09:52:52', NULL, NULL),
('dcc168ed-6660-40e1-a79d-670e2793d5f7', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', '457d3b3b-d1a9-4cbe-8507-2ca103da9781', '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'card', 100, 55, 155, 'delivered', 'paid', '2026-06-10 10:03:09', NULL, NULL),
('e0848c14-575d-4039-9c47-e4b6cdd69a63', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, '062f16ad-3644-48b2-a65c-857b1146ed7d', NULL, '[{\"product\":{\"id\":\"47dc1c4c-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Coca-Cola\",\"weight\":\"750 ml\",\"price\":40,\"mrp\":45,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1625772299848-391b6a87d7b3?w=400\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560087\",\"type\":\"Home\",\"is_default\":false}', 'cod', 40, 25, 65, 'delivered', 'pending', '2026-06-13 17:43:45', NULL, NULL),
('ee489002-7696-47a3-a83a-6cbc4ce2259d', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"a2a56125-5ddd-11f1-8fe0-48777afc85a1\",\"name\":\"Tata Salt\",\"weight\":\"1 kg\",\"price\":28,\"mrp\":30,\"image\":\"https:\\/\\/placehold.co\\/300\"},\"qty\":2}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'card', 56, 25, 81, 'delivered', 'paid', '2026-06-02 13:21:49', NULL, NULL),
('f0d206f1-d7d4-4bdc-a8b6-06e28fac40d3', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, '062f16ad-3644-48b2-a65c-857b1146ed7d', NULL, '[{\"product\":{\"id\":\"47dc1ad4-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Farm Eggs (6)\",\"weight\":\"6 pcs\",\"price\":55,\"mrp\":60,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1582722872445-44dc5f7e3c8f?w=400\"},\"qty\":1},{\"product\":{\"id\":\"47dc1a85-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Amul Gold Milk\",\"weight\":\"500 ml\",\"price\":35,\"mrp\":38,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1550583724-b2692b85b150?w=400\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560087\",\"type\":\"Home\",\"is_default\":false}', 'cod', 90, 25, 115, 'delivered', 'pending', '2026-06-11 15:44:50', NULL, NULL),
('f540920c-361f-49ee-b0e4-2f5e0c1b2646', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', NULL, '832c5fda-0e86-4e53-ae0e-5e89e6ad107a', '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":3}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560087\",\"type\":\"Home\",\"is_default\":false}', 'upi', 300, 30, 330, 'placed', 'paid', '2026-06-11 15:27:04', NULL, NULL),
('f6df52ca-aae4-4441-86ba-7df5e4e908c9', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'upi', 100, 55, 155, 'delivered', 'paid', '2026-06-04 19:56:10', NULL, NULL),
('f81d3e5e-aab7-4e94-8d51-70b349467ad2', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"a2a56125-5ddd-11f1-8fe0-48777afc85a1\",\"name\":\"Tata Salt\",\"weight\":\"1 kg\",\"price\":28,\"mrp\":30,\"image\":\"https:\\/\\/placehold.co\\/300\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'cod', 28, 25, 53, 'delivered', 'pending', '2026-06-03 08:25:31', NULL, NULL),
('fb6c66a9-8686-4438-89bb-34545f315233', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":0,\"mrp\":0,\"image\":\"\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Work\",\"is_default\":false}', 'upi', 0, 15, 15, 'delivered', 'paid', '2026-06-04 19:18:50', NULL, NULL),
('fc38905f-7c51-46f3-a00d-1f6a97df8f58', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"a2a56125-5ddd-11f1-8fe0-48777afc85a1\",\"name\":\"Tata Salt\",\"weight\":\"1 kg\",\"price\":28,\"mrp\":30,\"image\":\"https:\\/\\/placehold.co\\/300\"},\"qty\":2}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'cod', 56, 25, 81, 'delivered', 'pending', '2026-06-02 11:58:43', NULL, NULL),
('fc773aac-dff8-436c-b6c4-ff10e506e06c', '560a5b68-6fe5-4773-b508-e968e8d58f3a', '07751984-c1ec-4399-95aa-0cc879178aa4', 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', '457d3b3b-d1a9-4cbe-8507-2ca103da9781', '[{\"product\":{\"id\":\"ee0a8db8-449f-44c7-8f26-c8972690934a|_\",\"name\":\"Chicken 65\",\"weight\":\"Resto One\",\"price\":100,\"mrp\":100,\"image\":\"\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'card', 100, 55, 155, 'delivered', 'paid', '2026-06-06 05:31:25', NULL, NULL),
('fefae47e-4d8c-4572-b452-f95a6e976890', '560a5b68-6fe5-4773-b508-e968e8d58f3a', NULL, 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', NULL, '[{\"product\":{\"id\":\"47dc1d8e-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Colgate MaxFresh\",\"weight\":\"150 g\",\"price\":95,\"mrp\":110,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1556228720-195a672e8a03?w=400\"},\"qty\":1},{\"product\":{\"id\":\"47dc1dfe-60f4-11f1-8fe0-48777afc85a1\",\"name\":\"Dettol Handwash\",\"weight\":\"200 ml\",\"price\":75,\"mrp\":85,\"image\":\"https:\\/\\/images.unsplash.com\\/photo-1584305574647-0cc949a2bb9f?w=400\"},\"qty\":1}]', '{\"full_name\":\"SUMANTH HOLKAR\",\"phone\":\"6362899763\",\"line1\":\"65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,\",\"line2\":\"Bengaluru\",\"city\":\"Bengaluru\",\"pincode\":\"560091\",\"type\":\"Home\",\"is_default\":false}', 'cod', 170, 25, 195, 'packed', 'pending', '2026-06-11 16:19:37', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `order_assignments`
--

CREATE TABLE `order_assignments` (
  `id` char(36) NOT NULL,
  `order_id` char(36) NOT NULL,
  `rider_id` char(36) NOT NULL,
  `status` enum('assigned','picked_up','delivered','cancelled') NOT NULL DEFAULT 'assigned',
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `picked_up_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `proof_photo` varchar(500) DEFAULT NULL,
  `notes` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `order_assignments`
--

INSERT INTO `order_assignments` (`id`, `order_id`, `rider_id`, `status`, `assigned_at`, `picked_up_at`, `delivered_at`, `proof_photo`, `notes`, `created_at`, `updated_at`) VALUES
('1c3b14eb-a78e-4943-850c-c0d619f9576d', '001e8ad1-e66a-4cfb-a5d6-937807769467', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-19 12:39:13', '2026-06-21 08:51:36', '2026-06-21 08:51:52', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/63c07bf7-7bf8-4ada-9778-9060fc46966f.jpg', '', '2026-06-19 12:39:13', '2026-06-21 08:51:52'),
('1e21ab19-2ea5-49a1-9f6a-1dd429714f96', 'e0848c14-575d-4039-9c47-e4b6cdd69a63', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 23:08:35', '2026-06-27 07:15:14', '2026-06-27 07:15:32', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/7040dd02-5f5d-4b37-8227-824955f96cb9.jpg', '', '2026-06-21 23:08:35', '2026-06-27 07:15:32'),
('1e2dded0-d0f9-443e-9c5a-0582325c75b8', 'dcc168ed-6660-40e1-a79d-670e2793d5f7', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-19 11:43:23', '2026-06-19 12:37:07', '2026-06-19 12:42:01', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/aea5264a-b813-4a12-a970-02ec9e3adfca.jpg', '', '2026-06-19 11:43:23', '2026-06-19 12:42:01'),
('1f0a197c-f138-4021-8dee-67060db9db52', 'a6aa9811-d973-4ae4-9df5-f0a40f47ca37', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 19:19:37', '2026-06-21 21:14:38', '2026-06-21 21:14:47', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/9dd28c76-a05c-4c28-b9dd-b9cdc0d4bb1b.jpg', '', '2026-06-21 19:19:37', '2026-06-21 21:14:47'),
('2056f535-6ccd-4472-b4f7-04dc637e2785', '8ba9593c-0e59-4b4d-88bc-41f568e9b5e2', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 21:15:16', '2026-06-21 21:50:06', '2026-06-21 21:50:39', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/5b8b0cd1-65dd-4d5f-a00c-40ff7d3d49b1.jpg', '', '2026-06-21 21:15:16', '2026-06-21 21:50:39'),
('303b4f7b-4605-4a1d-b2f2-95ae414a3dd2', '630cc4c2-6fb2-4ef0-99f3-dea39b281819', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 22:47:16', '2026-06-27 07:32:46', '2026-06-27 07:32:55', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/3bd0d3b5-9bc0-4d1d-a400-7f8bd05f7f05.jpg', '', '2026-06-21 22:47:16', '2026-06-27 07:32:55'),
('30a8e06e-a581-4ada-9c6a-77b5f98d26dc', '005de887-073b-48eb-b927-094bc2a819b1', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-25 12:16:28', '2026-06-25 12:24:01', '2026-06-25 12:24:28', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/b5ce26f7-5eab-4d6c-8412-76cd54bd11db.jpg', '', '2026-06-25 12:16:28', '2026-06-25 12:24:28'),
('3cea8af1-e453-44fc-b4b9-af3414d29817', '275c6ee2-9c32-444d-8832-7bdab27af543', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 08:53:27', '2026-06-21 18:44:46', '2026-06-21 18:44:57', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/768a1a7f-43f1-45c8-a247-5bf586bc93d2.jpg', '', '2026-06-21 08:53:27', '2026-06-21 18:44:57'),
('41abb52c-f10d-40fa-bf95-6a95b8b6c3e1', '748adbc6-0b74-4cfa-950f-cb2d6e5c16c3', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-28 15:20:52', '2026-06-28 15:21:50', '2026-06-28 15:22:36', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/c688ba3a-787b-499c-9204-3745eca8ea3c.jpg', '', '2026-06-28 15:20:52', '2026-06-28 15:22:36'),
('5fb19946-79d8-4f56-b1b7-be3863ed606c', '12013e51-6310-4a8b-810f-84a1f3628399', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 21:51:32', '2026-06-27 07:36:09', '2026-06-27 07:36:18', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/f5e328b9-15d1-4234-9ab4-7ec25d1744f6.jpg', '', '2026-06-21 21:51:32', '2026-06-27 07:36:18'),
('6d0c9bc3-647f-4bd5-98be-6f76d22163af', '3c4b877a-0c2c-482a-802c-5f9d6cc4ec5c', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 22:44:29', '2026-06-27 07:32:58', '2026-06-27 07:33:11', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/eefecc59-e6db-4b92-a120-1c00c5d957ab.jpg', '', '2026-06-21 22:44:29', '2026-06-27 07:33:11'),
('6e4788aa-ac6b-4a7b-8ec4-a91f1b511f51', '52bd459f-8768-4eb3-8c58-9cc8bdf32472', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-19 12:38:13', '2026-06-19 12:44:45', '2026-06-19 12:45:01', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/464a5247-bf9d-4e58-a3d7-6cb84464cb88.jpg', '', '2026-06-19 12:38:13', '2026-06-19 12:45:01'),
('6f40110d-6c43-4fec-b9ea-dd945b2bbd03', '26b069c8-7281-47fc-b60d-a2c8a13373d7', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-28 15:14:17', '2026-06-28 15:14:38', '2026-06-28 15:15:07', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/daf0a96b-7896-4c9e-ab49-2ffb65a9ce2c.jpg', '', '2026-06-28 15:14:17', '2026-06-28 15:15:07'),
('7dfd7caf-0bbd-4b5f-9e4d-be5f6d7132f1', 'ee489002-7696-47a3-a83a-6cbc4ce2259d', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 18:45:20', '2026-06-21 19:17:39', '2026-06-21 19:17:52', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/13b5b71f-df11-4dbc-9b39-bba44ec1c6f7.jpg', '', '2026-06-21 18:45:20', '2026-06-21 19:17:52'),
('82324b18-ccfc-424c-9268-038c63c654f3', '0a0ededf-b035-47cd-a877-9b60fac98758', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-27 07:42:57', '2026-06-27 07:43:53', '2026-06-27 07:44:38', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/54457b8e-6053-4d68-aec2-a37f28d3a909.jpg', '', '2026-06-27 07:42:57', '2026-06-27 07:44:38'),
('8be9df03-3ba9-4a4b-b7fe-6a31db97e044', '46536bd4-d032-41f4-8523-b3243efdbf54', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 23:10:15', '2026-06-21 23:26:05', '2026-06-21 23:26:37', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/a79052e0-6004-4b41-9a51-51632f342c83.jpg', '', '2026-06-21 23:10:15', '2026-06-21 23:26:37'),
('964a9f4e-471b-492e-b742-420d76aea69e', '2bd6ab24-6847-4628-b485-4c610927e1a1', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-28 15:29:30', '2026-06-28 15:30:02', '2026-06-28 15:30:20', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/1992f17b-e42b-4d5f-a32f-50c42bc8ef01.jpg', '', '2026-06-28 15:29:30', '2026-06-28 15:30:20'),
('a01a5e60-c07a-457a-af39-8f91ca61d50c', 'fc38905f-7c51-46f3-a00d-1f6a97df8f58', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 22:44:05', '2026-06-27 07:33:56', '2026-06-27 07:34:18', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/0d55fc44-28f5-4ec6-a270-1b0b3527dbe8.jpg', '', '2026-06-21 22:44:05', '2026-06-27 07:34:18'),
('a915429e-c3c5-41bc-ae88-4468f0661ea5', 'bea4612c-0cc6-4573-b919-6b1d7e92e737', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 23:06:36', '2026-06-27 07:32:25', '2026-06-27 07:32:38', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/70a3e7f0-c2ed-4ff0-bc4b-827cdeb6c7a1.jpg', '', '2026-06-21 23:06:36', '2026-06-27 07:32:38'),
('acc0ead9-e96d-49e6-be78-00280eb61d3b', 'd0ca13c4-64a6-4f61-b0f9-80d3a1ccab1a', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 08:28:39', '2026-06-21 08:52:54', '2026-06-21 08:53:01', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/a7791b9f-df6c-4176-9f2e-60c53e732680.jpg', '', '2026-06-21 08:28:39', '2026-06-21 08:53:01'),
('adba63f3-040b-481b-bb43-a4478df14d98', '9a960c43-c74e-4550-9eb3-a819252ab9fd', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 20:10:48', '2026-06-21 21:14:19', '2026-06-21 21:14:31', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/0c4fbc33-a498-4932-9ea6-c0a8db2d2ab5.jpg', '', '2026-06-21 20:10:48', '2026-06-21 21:14:31'),
('b4a08f24-4f9c-4e65-ad58-70e8a4a39e38', 'd8c0d6fd-13d2-4419-95f7-6a32f23801b7', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-19 12:40:00', '2026-06-19 21:09:28', '2026-06-21 08:52:02', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/a7225957-4502-4ef1-a780-51f3f7219084.jpg', '', '2026-06-19 12:40:00', '2026-06-21 08:52:02'),
('bc84c75b-41b1-4fd7-ad2b-487916d3e27c', 'a6728210-91ee-4546-af25-04a922ba50fb', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 08:07:12', '2026-06-21 08:52:42', '2026-06-21 08:52:51', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/0a705bd7-3a4c-4225-bba0-e5861dac9f47.jpg', '', '2026-06-21 08:07:12', '2026-06-21 08:52:51'),
('bf104f2c-e521-477f-8325-7f8cba5cf836', '2bf60274-1af7-4ab4-b30b-adfce8885e81', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-28 15:35:14', '2026-06-28 15:35:33', '2026-06-28 15:36:19', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/1cca9c1b-b8c9-4db7-825b-441321489755.jpg', '', '2026-06-28 15:35:14', '2026-06-28 15:36:19'),
('c2e1613e-e54c-4145-9623-7e9209f8c97f', '8fb0b939-6494-436b-850a-351de1a624f1', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 19:18:12', '2026-06-21 19:19:20', '2026-06-21 19:19:28', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/4fd2d643-cbe5-42d3-9127-3a4b4256fbeb.jpg', '', '2026-06-21 19:18:12', '2026-06-21 19:19:28'),
('c5af6e27-1780-4dda-9fc3-49b4a5083d52', '470cad36-3450-47b1-a83a-93fc00c1ccb8', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 23:10:37', '2026-06-21 23:25:44', '2026-06-21 23:25:55', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/877b524f-5d45-485d-8ae4-45995be2ac99.jpg', '', '2026-06-21 23:10:37', '2026-06-21 23:25:55'),
('dea3b4f0-afc2-4424-b57b-63bac21552c2', 'baa6fc40-8b29-4732-8689-483c44fbc8af', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 07:52:09', '2026-06-21 08:52:04', '2026-06-21 08:52:14', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/5a91773e-414b-45a1-a350-bfff048c2b64.jpg', '', '2026-06-21 07:52:09', '2026-06-21 08:52:14'),
('e8c303f7-06b5-40a4-9ff4-0b59899524b9', 'd77d3cb4-f484-4fef-acee-a7414917d3a0', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 08:04:41', '2026-06-21 08:52:21', '2026-06-21 08:52:39', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/e80bba1d-994c-4a47-a69f-efb7489c68fa.jpg', '', '2026-06-21 08:04:41', '2026-06-21 08:52:39'),
('f4432698-d3dd-43d6-9d56-16b2419e2e25', 'fb6c66a9-8686-4438-89bb-34545f315233', '30179576-7a3b-4ebd-946b-671eaef22243', 'delivered', '2026-06-21 22:24:26', '2026-06-27 07:34:25', '2026-06-27 07:36:07', 'https://hallifresh.in/php-backend/uploads/delivery-proofs/46b70155-77ae-4438-b691-13fb6e2e6449/506ac50f-1418-4fdc-befe-231e0fafcda6.jpg', '', '2026-06-21 22:24:26', '2026-06-27 07:36:07');

-- --------------------------------------------------------

--
-- Table structure for table `outlets`
--

CREATE TABLE `outlets` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(120) NOT NULL,
  `pincode` varchar(12) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `partner_dishes`
--

CREATE TABLE `partner_dishes` (
  `id` char(36) NOT NULL,
  `restaurant_id` char(36) NOT NULL,
  `outlet_id` char(36) DEFAULT NULL,
  `name` varchar(160) NOT NULL,
  `description` varchar(500) NOT NULL DEFAULT '',
  `image` text NOT NULL,
  `section` varchar(80) NOT NULL DEFAULT 'Mains',
  `price` int(11) NOT NULL,
  `mrp` int(11) DEFAULT NULL,
  `rating` decimal(2,1) NOT NULL DEFAULT 4.5,
  `veg` tinyint(1) NOT NULL DEFAULT 1,
  `spicy` tinyint(1) NOT NULL DEFAULT 0,
  `bestseller` tinyint(1) NOT NULL DEFAULT 0,
  `in_stock` tinyint(1) NOT NULL DEFAULT 1,
  `available_days` varchar(40) NOT NULL DEFAULT '0,1,2,3,4,5,6',
  `available_from` varchar(8) NOT NULL DEFAULT '00:00',
  `available_to` varchar(8) NOT NULL DEFAULT '23:59',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `partner_dishes`
--

INSERT INTO `partner_dishes` (`id`, `restaurant_id`, `outlet_id`, `name`, `description`, `image`, `section`, `price`, `mrp`, `rating`, `veg`, `spicy`, `bestseller`, `in_stock`, `available_days`, `available_from`, `available_to`, `sort_order`, `created_at`, `updated_at`) VALUES
('ee0a8db8-449f-44c7-8f26-c8972690934a', '07751984-c1ec-4399-95aa-0cc879178aa4', NULL, 'Chicken 65', 'qwert dfgh ghj', '', 'Mains', 100, 349, 4.5, 1, 1, 1, 1, '0,1,2,3,4,5,6', '00:00', '23:59', 0, '2026-06-03 11:33:02', '2026-06-04 19:19:59');

-- --------------------------------------------------------

--
-- Table structure for table `partner_dish_addons`
--

CREATE TABLE `partner_dish_addons` (
  `id` char(36) NOT NULL,
  `dish_id` char(36) NOT NULL,
  `name` varchar(80) NOT NULL,
  `price` int(11) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `partner_dish_variants`
--

CREATE TABLE `partner_dish_variants` (
  `id` char(36) NOT NULL,
  `dish_id` char(36) NOT NULL,
  `name` varchar(80) NOT NULL,
  `price` int(11) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `partner_outlets`
--

CREATE TABLE `partner_outlets` (
  `id` char(36) NOT NULL,
  `restaurant_id` char(36) NOT NULL,
  `name` varchar(160) NOT NULL,
  `address` varchar(255) NOT NULL DEFAULT '',
  `area` varchar(120) NOT NULL DEFAULT '',
  `pincode` varchar(12) NOT NULL DEFAULT '',
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  `eta_mins` int(11) NOT NULL DEFAULT 30,
  `is_open` tinyint(1) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `partner_outlets`
--

INSERT INTO `partner_outlets` (`id`, `restaurant_id`, `name`, `address`, `area`, `pincode`, `lat`, `lng`, `eta_mins`, `is_open`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
('457d3b3b-d1a9-4cbe-8507-2ca103da9781', '07751984-c1ec-4399-95aa-0cc879178aa4', 'Andhrahalli', 'Andhrahalli Road', 'Jalahalli', '560091', 1.2345670, 2.2345670, 30, 1, 1, 0, '2026-06-05 10:48:40', '2026-06-05 10:48:40'),
('832c5fda-0e86-4e53-ae0e-5e89e6ad107a', '07751984-c1ec-4399-95aa-0cc879178aa4', 'Koramangala', 'ugywduaus adiuh', 'sdguas', '560087', 1.2345000, 2.3456000, 30, 1, 1, 0, '2026-06-10 10:11:17', '2026-06-10 10:11:17');

-- --------------------------------------------------------

--
-- Table structure for table `partner_outlet_managers`
--

CREATE TABLE `partner_outlet_managers` (
  `id` char(36) NOT NULL,
  `restaurant_id` char(36) NOT NULL,
  `outlet_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `role` varchar(40) NOT NULL DEFAULT 'manager',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `partner_outlet_managers`
--

INSERT INTO `partner_outlet_managers` (`id`, `restaurant_id`, `outlet_id`, `user_id`, `role`, `created_at`) VALUES
('6997c230-6e0c-404d-ac44-c551f8155424', '07751984-c1ec-4399-95aa-0cc879178aa4', '457d3b3b-d1a9-4cbe-8507-2ca103da9781', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'manager', '2026-06-05 10:54:28');

-- --------------------------------------------------------

--
-- Table structure for table `partner_restaurants`
--

CREATE TABLE `partner_restaurants` (
  `id` char(36) NOT NULL,
  `owner_id` char(36) NOT NULL,
  `slug` varchar(80) NOT NULL,
  `name` varchar(160) NOT NULL,
  `cuisines` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`cuisines`)),
  `image` text NOT NULL,
  `cover` text NOT NULL,
  `rating` decimal(2,1) NOT NULL DEFAULT 4.5,
  `reviews_count` int(11) NOT NULL DEFAULT 0,
  `eta_mins` int(11) NOT NULL DEFAULT 30,
  `cost_for_two` int(11) NOT NULL DEFAULT 400,
  `area` varchar(120) NOT NULL DEFAULT '',
  `price_tier` tinyint(4) NOT NULL DEFAULT 2,
  `distance_km` decimal(5,2) NOT NULL DEFAULT 1.00,
  `veg` tinyint(1) NOT NULL DEFAULT 0,
  `offer` varchar(120) DEFAULT NULL,
  `is_open` tinyint(1) NOT NULL DEFAULT 1,
  `opens_at` varchar(10) DEFAULT NULL,
  `closes_at` varchar(10) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `is_blocked` tinyint(1) NOT NULL DEFAULT 0,
  `rejection_reason` text DEFAULT NULL,
  `onboarding_step` tinyint(4) NOT NULL DEFAULT 1,
  `commission_rate` decimal(5,2) NOT NULL DEFAULT 22.00,
  `owner_name` varchar(120) NOT NULL DEFAULT '',
  `owner_email` varchar(160) NOT NULL DEFAULT '',
  `owner_phone` varchar(20) NOT NULL DEFAULT '',
  `fssai_number` varchar(40) NOT NULL DEFAULT '',
  `fssai_doc_url` text NOT NULL,
  `fssai_expiry` date DEFAULT NULL,
  `pan_number` varchar(20) NOT NULL DEFAULT '',
  `pan_doc_url` text NOT NULL,
  `gst_number` varchar(20) DEFAULT NULL,
  `gst_doc_url` text DEFAULT NULL,
  `shop_license_doc_url` text NOT NULL,
  `bank_account_name` varchar(120) NOT NULL DEFAULT '',
  `bank_account_number` varchar(40) NOT NULL DEFAULT '',
  `bank_ifsc` varchar(20) NOT NULL DEFAULT '',
  `bank_proof_url` text NOT NULL,
  `agreement_accepted_at` timestamp NULL DEFAULT NULL,
  `agreement_signature` varchar(160) DEFAULT NULL,
  `agreement_version` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `partner_restaurants`
--

INSERT INTO `partner_restaurants` (`id`, `owner_id`, `slug`, `name`, `cuisines`, `image`, `cover`, `rating`, `reviews_count`, `eta_mins`, `cost_for_two`, `area`, `price_tier`, `distance_km`, `veg`, `offer`, `is_open`, `opens_at`, `closes_at`, `status`, `is_blocked`, `rejection_reason`, `onboarding_step`, `commission_rate`, `owner_name`, `owner_email`, `owner_phone`, `fssai_number`, `fssai_doc_url`, `fssai_expiry`, `pan_number`, `pan_doc_url`, `gst_number`, `gst_doc_url`, `shop_license_doc_url`, `bank_account_name`, `bank_account_number`, `bank_ifsc`, `bank_proof_url`, `agreement_accepted_at`, `agreement_signature`, `agreement_version`, `created_at`, `updated_at`) VALUES
('07751984-c1ec-4399-95aa-0cc879178aa4', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'ro', 'Resto One', '[\"Indian\"]', '', '', 4.5, 0, 30, 400, 'RajajiNagar', 2, 1.50, 0, NULL, 1, '10:00', '23:00', 'approved', 0, '', 5, 22.00, 'Sumanth', 'resto@gmail.com', '6362899763', '12926001000123', 'partner-docs/cbd3e804-f4e4-48b9-9b14-052498bde6b6/fssai-1780486124-69b9c512.pdf', '2026-06-30', 'ABCDE1234F', 'partner-docs/cbd3e804-f4e4-48b9-9b14-052498bde6b6/pan-1780486146-b29770e7.pdf', '27ABCDE1234F2Z5', 'partner-docs/cbd3e804-f4e4-48b9-9b14-052498bde6b6/gst-1780486181-0f230252.pdf', 'partner-docs/cbd3e804-f4e4-48b9-9b14-052498bde6b6/shop-license-1780486242-b60174c7.pdf', 'Restoman', '123456789', 'SBIN00000123', 'partner-docs/cbd3e804-f4e4-48b9-9b14-052498bde6b6/bank-1780486230-e1819629.pdf', '2026-06-03 11:34:01', 'Restoman', 'v1.0', '2026-06-03 08:37:40', '2026-06-11 17:45:25');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` char(36) NOT NULL,
  `slug` varchar(80) NOT NULL,
  `name` varchar(120) NOT NULL,
  `category_slug` varchar(60) NOT NULL,
  `image` text NOT NULL,
  `weight` varchar(40) NOT NULL,
  `price` int(11) NOT NULL,
  `mrp` int(11) NOT NULL,
  `eta` varchar(40) NOT NULL DEFAULT '11 mins',
  `rating` decimal(2,1) NOT NULL DEFAULT 4.5,
  `in_stock` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `slug`, `name`, `category_slug`, `image`, `weight`, `price`, `mrp`, `eta`, `rating`, `in_stock`, `created_at`) VALUES
('47dc16c9-60f4-11f1-8fe0-48777afc85a1', 'veg-tomato', 'Tomato Local', 'vegetables', 'https://images.unsplash.com/photo-1546470427-e3e1f1c9c1d6?w=400', '1 kg', 35, 45, '10 mins', 4.2, 1, '2026-06-05 15:36:11'),
('47dc18c8-60f4-11f1-8fe0-48777afc85a1', 'veg-onion', 'Onion', 'vegetables', 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400', '1 kg', 39, 50, '10 mins', 4.3, 1, '2026-06-05 15:36:11'),
('47dc1941-60f4-11f1-8fe0-48777afc85a1', 'veg-potato', 'Potato', 'vegetables', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', '1 kg', 32, 40, '10 mins', 4.1, 1, '2026-06-05 15:36:11'),
('47dc1972-60f4-11f1-8fe0-48777afc85a1', 'veg-carrot', 'Carrot', 'vegetables', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', '500 g', 29, 40, '10 mins', 4.3, 1, '2026-06-05 15:36:11'),
('47dc19a1-60f4-11f1-8fe0-48777afc85a1', 'fr-banana', 'Robusta Banana', 'fruits', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', '1 kg', 49, 60, '10 mins', 4.4, 1, '2026-06-05 15:36:11'),
('47dc19c5-60f4-11f1-8fe0-48777afc85a1', 'fr-apple', 'Shimla Apple', 'fruits', 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400', '1 kg', 189, 220, '10 mins', 4.6, 1, '2026-06-05 15:36:11'),
('47dc19ed-60f4-11f1-8fe0-48777afc85a1', 'fr-orange', 'Nagpur Orange', 'fruits', 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400', '1 kg', 99, 130, '10 mins', 4.4, 1, '2026-06-05 15:36:11'),
('47dc1a12-60f4-11f1-8fe0-48777afc85a1', 'fr-mango', 'Alphonso Mango', 'fruits', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', '1 kg', 299, 360, '10 mins', 4.7, 1, '2026-06-05 15:36:11'),
('47dc1a85-60f4-11f1-8fe0-48777afc85a1', 'da-milk', 'Amul Gold Milk', 'dairy', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', '500 ml', 35, 38, '10 mins', 4.7, 1, '2026-06-05 15:36:11'),
('47dc1ab0-60f4-11f1-8fe0-48777afc85a1', 'da-butter', 'Amul Butter', 'dairy', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400', '100 g', 58, 62, '10 mins', 4.8, 1, '2026-06-05 15:36:11'),
('47dc1ad4-60f4-11f1-8fe0-48777afc85a1', 'da-eggs', 'Farm Eggs (6)', 'dairy', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', '6 pcs', 55, 60, '10 mins', 4.5, 1, '2026-06-05 15:36:11'),
('47dc1af9-60f4-11f1-8fe0-48777afc85a1', 'da-curd', 'Fresh Curd', 'dairy', 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400', '400 g', 45, 55, '10 mins', 4.4, 1, '2026-06-05 15:36:11'),
('47dc1b1f-60f4-11f1-8fe0-48777afc85a1', 'bk-bread', 'Britannia Bread', 'bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', '400 g', 45, 50, '10 mins', 4.4, 1, '2026-06-05 15:36:11'),
('47dc1b44-60f4-11f1-8fe0-48777afc85a1', 'bk-parleg', 'Parle-G Biscuits', 'bakery', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', '800 g', 95, 100, '10 mins', 4.7, 1, '2026-06-05 15:36:11'),
('47dc1b68-60f4-11f1-8fe0-48777afc85a1', 'bk-cookies', 'Choco Chip Cookies', 'bakery', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', '200 g', 120, 150, '10 mins', 4.5, 1, '2026-06-05 15:36:11'),
('47dc1b8d-60f4-11f1-8fe0-48777afc85a1', 'bk-bun', 'Fresh Buns (4 pcs)', 'bakery', 'https://images.unsplash.com/photo-1568471173242-461f0a730452?w=400', '4 pcs', 35, 40, '10 mins', 4.2, 1, '2026-06-05 15:36:11'),
('47dc1bb5-60f4-11f1-8fe0-48777afc85a1', 'sn-lays', 'Lays Classic Salted', 'snacks', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', '52 g', 20, 20, '10 mins', 4.4, 1, '2026-06-05 15:36:11'),
('47dc1bd9-60f4-11f1-8fe0-48777afc85a1', 'sn-kurkure', 'Kurkure Masala Munch', 'snacks', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400', '90 g', 20, 20, '10 mins', 4.3, 1, '2026-06-05 15:36:11'),
('47dc1bff-60f4-11f1-8fe0-48777afc85a1', 'sn-haldiram', 'Haldiram Bhujia', 'snacks', 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400', '200 g', 65, 75, '10 mins', 4.6, 1, '2026-06-05 15:36:11'),
('47dc1c25-60f4-11f1-8fe0-48777afc85a1', 'sn-popcorn', 'Act II Popcorn', 'snacks', 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400', '70 g', 30, 35, '10 mins', 4.3, 1, '2026-06-05 15:36:11'),
('47dc1c4c-60f4-11f1-8fe0-48777afc85a1', 'bv-coke', 'Coca-Cola', 'beverages', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400', '750 ml', 40, 45, '10 mins', 4.6, 1, '2026-06-05 15:36:11'),
('47dc1c6f-60f4-11f1-8fe0-48777afc85a1', 'bv-tropicana', 'Tropicana Orange Juice', 'beverages', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', '1 L', 115, 130, '10 mins', 4.5, 1, '2026-06-05 15:36:11'),
('47dc1cce-60f4-11f1-8fe0-48777afc85a1', 'bv-sprite', 'Sprite', 'beverages', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400', '750 ml', 40, 45, '10 mins', 4.5, 1, '2026-06-05 15:36:11'),
('47dc1cf3-60f4-11f1-8fe0-48777afc85a1', 'bv-redbull', 'Red Bull Energy', 'beverages', 'https://images.unsplash.com/photo-1613218985075-86440fa1ce1c?w=400', '250 ml', 125, 130, '10 mins', 4.7, 1, '2026-06-05 15:36:11'),
('47dc1d1c-60f4-11f1-8fe0-48777afc85a1', 'hh-surf', 'Surf Excel Easy Wash', 'household', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400', '1 kg', 180, 215, '11 mins', 4.5, 1, '2026-06-05 15:36:11'),
('47dc1d3f-60f4-11f1-8fe0-48777afc85a1', 'hh-vim', 'Vim Dishwash Bar', 'household', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400', '300 g', 30, 35, '11 mins', 4.4, 1, '2026-06-05 15:36:11'),
('47dc1d68-60f4-11f1-8fe0-48777afc85a1', 'hh-harpic', 'Harpic Toilet Cleaner', 'household', 'https://images.unsplash.com/photo-1585670210693-1aaf3a3c80df?w=400', '1 L', 125, 145, '11 mins', 4.6, 1, '2026-06-05 15:36:11'),
('47dc1d8e-60f4-11f1-8fe0-48777afc85a1', 'pc-colgate', 'Colgate MaxFresh', 'personal-care', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', '150 g', 95, 110, '11 mins', 4.5, 1, '2026-06-05 15:36:11'),
('47dc1db8-60f4-11f1-8fe0-48777afc85a1', 'pc-dove', 'Dove Beauty Bar', 'personal-care', 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=400', '100 g', 55, 65, '11 mins', 4.6, 1, '2026-06-05 15:36:11'),
('47dc1ddc-60f4-11f1-8fe0-48777afc85a1', 'pc-shampoo', 'Head & Shoulders Shampoo', 'personal-care', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400', '340 ml', 299, 360, '11 mins', 4.5, 1, '2026-06-05 15:36:11'),
('47dc1dfe-60f4-11f1-8fe0-48777afc85a1', 'pc-handwash', 'Dettol Handwash', 'personal-care', 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400', '200 ml', 75, 85, '11 mins', 4.4, 1, '2026-06-05 15:36:11'),
('a2a55fe3-5ddd-11f1-8fe0-48777afc85a1', 'amul-milk-500ml', 'Amul Gold Milk', 'dairy', 'https://placehold.co/300', '500 ml', 35, 38, '11 mins', 4.5, 1, '2026-06-01 17:16:32'),
('a2a56125-5ddd-11f1-8fe0-48777afc85a1', 'tata-salt-1kg', 'Tata Salt', 'staples', 'https://placehold.co/300', '1 kg', 28, 30, '11 mins', 4.5, 1, '2026-06-01 17:16:32');

-- --------------------------------------------------------

--
-- Table structure for table `product_stock`
--

CREATE TABLE `product_stock` (
  `id` char(36) NOT NULL,
  `warehouse_id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 0,
  `low_stock_threshold` int(11) NOT NULL DEFAULT 5,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `promo_notification_log`
--

CREATE TABLE `promo_notification_log` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` char(36) NOT NULL,
  `kind` varchar(32) NOT NULL,
  `ref_key` varchar(160) NOT NULL,
  `sent_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `refund_requests`
--

CREATE TABLE `refund_requests` (
  `id` char(36) NOT NULL,
  `order_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `reason` varchar(120) NOT NULL,
  `details` text NOT NULL,
  `proof_urls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`proof_urls`)),
  `amount` int(11) NOT NULL DEFAULT 0,
  `status` enum('pending','approved','rejected','refunded') NOT NULL DEFAULT 'pending',
  `admin_note` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `verification_status` varchar(20) NOT NULL DEFAULT 'pending',
  `verified_by` char(36) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `verifier_note` text NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `refund_requests`
--

INSERT INTO `refund_requests` (`id`, `order_id`, `user_id`, `reason`, `details`, `proof_urls`, `amount`, `status`, `admin_note`, `created_at`, `updated_at`, `verification_status`, `verified_by`, `verified_at`, `verifier_note`) VALUES
('0173f7eb-8248-4789-b119-a5aa4b415400', 'd5afb823-39b7-4b22-9b0a-e4cc7af130a6', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'Damaged / spoiled', 'All', '[\"https://hallifresh.in/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/7ce0d040-5be8-475f-af44-d87b21b7838c.jpg\",\"https://hallifresh.in/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/ee8aea62-d137-4be0-9abf-de0ab583f17c.jpg\",\"https://hallifresh.in/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/19ae0b22-652e-4a41-bf85-ba5c2d444f0d.jpg\",\"https://hallifresh.in/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/a96e4892-a864-4d71-9bff-7db864f46394.jpg\",\"https://hallifresh.in/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/ef0cdc58-13dc-4adf-80b6-19b8999c2333.jpg\"]', 260, 'approved', '', '2026-06-10 09:48:30', '2026-06-10 09:50:43', 'verified', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', '2026-06-10 09:50:13', ''),
('2e260073-e8e5-48b6-88e3-db4ad0c608c8', '2bd6ab24-6847-4628-b485-4c610927e1a1', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'Damaged on arrival', '', '[]', 260, 'pending', '', '2026-06-29 08:12:35', '2026-06-29 08:12:35', 'pending', NULL, NULL, ''),
('7f1b15c7-3945-40e3-800f-e1501d8be335', 'fc773aac-dff8-436c-b6c4-ff10e506e06c', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'Damaged / spoiled', 'Asdfghj', '[\"https://hallifresh.in/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/d35463bb-2cdb-4d0f-9ce2-aceeea4672e1.jpg\",\"https://hallifresh.in/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/b1233169-5f48-4895-99b7-15e3668a75c5.jpg\",\"https://hallifresh.in/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/8a677306-d88f-4cbe-a9c9-027f304f7155.jpg\",\"https://hallifresh.in/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/fe188db0-236f-4304-abe9-8cddb04f0c6b.jpg\",\"https://hallifresh.in/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/21ef3393-e313-4ad7-8b6f-d6094f5dbe0e.jpg\"]', 155, 'approved', '', '2026-06-06 05:33:56', '2026-06-06 05:35:25', 'verified', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', '2026-06-06 05:34:26', ''),
('92da33d6-6ed1-43c1-b788-ebfafef528b7', '2fb4ee03-7165-421e-ba37-dd76c928cf35', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'Damaged / spoiled', 'Damaged', '[\"http://hallifresh.com/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/efd4d188-e14a-4461-b53e-6db85080970d.jpg\",\"http://hallifresh.com/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/c28f9126-0744-4983-ab93-d06ed965f34b.jpg\",\"http://hallifresh.com/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/6f731336-a69b-4daf-98de-fe1b4f6ce90e.jpg\",\"http://hallifresh.com/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/07fe6f76-0f53-4ba9-9d22-1bedeca936b9.jpg\",\"http://hallifresh.com/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/82c3ae6d-f848-49a4-83d6-c2eb719557d5.jpg\"]', 155, 'approved', '', '2026-06-05 11:19:26', '2026-06-05 11:21:30', 'verified', 'eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', '2026-06-05 11:20:32', ''),
('a422c2a7-7d6f-4e2c-a2e3-386e5588fe7a', '9e845209-06b1-45fe-bc79-98155842dcd3', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'Damaged / spoiled', '', NULL, 155, 'pending', '', '2026-06-04 20:00:29', '2026-06-04 20:00:29', 'pending', NULL, NULL, ''),
('e618d85f-9340-4072-9d13-3a2b9388bdd8', 'f6df52ca-aae4-4441-86ba-7df5e4e908c9', '560a5b68-6fe5-4773-b508-e968e8d58f3a', 'Damaged / spoiled', 'asdfghjkl', '[\"http://hallifresh.com/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/68403baa-8156-4ba5-88e7-d53dd4b896dd.png\",\"http://hallifresh.com/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/b6e69e49-9b5d-46bc-b665-d1f1b48759d9.png\",\"http://hallifresh.com/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/170c2eb9-d16c-45dc-a74e-0cc4afa9b2c1.png\",\"http://hallifresh.com/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/0d8db019-a309-49c4-bee4-e8b44744c4ad.png\",\"http://hallifresh.com/php-backend/uploads/refund-proofs/560a5b68-6fe5-4773-b508-e968e8d58f3a/2c6d1ca7-822a-4726-9b93-c3c760cd3766.png\"]', 155, 'pending', '', '2026-06-05 10:28:24', '2026-06-05 10:28:24', 'pending', NULL, NULL, '');

-- --------------------------------------------------------

--
-- Table structure for table `restaurants`
--

CREATE TABLE `restaurants` (
  `id` char(36) NOT NULL,
  `owner_id` char(36) DEFAULT NULL,
  `slug` varchar(80) NOT NULL,
  `name` varchar(160) NOT NULL,
  `cuisine` varchar(120) NOT NULL DEFAULT '',
  `image` text NOT NULL,
  `rating` decimal(2,1) NOT NULL DEFAULT 4.2,
  `eta` varchar(40) NOT NULL DEFAULT '25 mins',
  `price_for_two` int(11) NOT NULL DEFAULT 300,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `restaurants`
--

INSERT INTO `restaurants` (`id`, `owner_id`, `slug`, `name`, `cuisine`, `image`, `rating`, `eta`, `price_for_two`, `is_active`, `created_at`) VALUES
('a97ce9da-5ddd-11f1-8fe0-48777afc85a1', NULL, 'spice-route', 'Spice Route', 'North Indian, Biryani', 'https://placehold.co/600x400', 4.4, '28 mins', 350, 1, '2026-06-01 17:16:43'),
('a97ceb4d-5ddd-11f1-8fe0-48777afc85a1', NULL, 'pizza-port', 'Pizza Port', 'Italian, Pizza', 'https://placehold.co/600x400', 4.2, '32 mins', 500, 1, '2026-06-01 17:16:43');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `target_type` varchar(32) NOT NULL,
  `target_id` varchar(64) NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `riders`
--

CREATE TABLE `riders` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `vehicle` varchar(40) NOT NULL DEFAULT 'bike',
  `vehicle_no` varchar(40) NOT NULL DEFAULT '',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `notes` text NOT NULL,
  `status` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'approved',
  `rejection_reason` varchar(300) DEFAULT NULL,
  `preferred_outlets` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`preferred_outlets`)),
  `preferred_pincodes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`preferred_pincodes`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `riders`
--

INSERT INTO `riders` (`id`, `user_id`, `name`, `phone`, `vehicle`, `vehicle_no`, `is_active`, `notes`, `status`, `rejection_reason`, `preferred_outlets`, `preferred_pincodes`, `created_at`, `updated_at`) VALUES
('30179576-7a3b-4ebd-946b-671eaef22243', '46b70155-77ae-4438-b691-13fb6e2e6449', 'Mark Sabistian', '1234567890', 'bike', 'KA01AB1234', 1, '', 'approved', NULL, '[\"457d3b3b-d1a9-4cbe-8507-2ca103da9781\",\"832c5fda-0e86-4e53-ae0e-5e89e6ad107a\"]', '[\"560091\"]', '2026-06-19 11:41:44', '2026-06-19 11:42:54');

-- --------------------------------------------------------

--
-- Table structure for table `rider_earnings`
--

CREATE TABLE `rider_earnings` (
  `id` char(36) NOT NULL,
  `rider_id` char(36) NOT NULL,
  `order_id` char(36) NOT NULL,
  `base_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','paid') NOT NULL DEFAULT 'pending',
  `earned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `paid_at` timestamp NULL DEFAULT NULL,
  `payout_id` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `rider_earnings`
--

INSERT INTO `rider_earnings` (`id`, `rider_id`, `order_id`, `base_fee`, `total`, `status`, `earned_at`, `paid_at`, `payout_id`) VALUES
('14218f98-2370-46aa-bfdb-55b015a54d15', '30179576-7a3b-4ebd-946b-671eaef22243', 'bea4612c-0cc6-4573-b919-6b1d7e92e737', 40.00, 40.00, 'paid', '2026-06-27 07:32:38', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('1871bf12-5397-4778-ade1-369bb4612053', '30179576-7a3b-4ebd-946b-671eaef22243', 'dcc168ed-6660-40e1-a79d-670e2793d5f7', 40.00, 40.00, 'paid', '2026-06-19 12:42:01', '2026-06-19 12:44:10', '4ae57722-23f4-4459-9a84-e4664fe5ae46'),
('22ee7394-884d-4b1f-bde5-61953387c7d0', '30179576-7a3b-4ebd-946b-671eaef22243', '46536bd4-d032-41f4-8523-b3243efdbf54', 40.00, 40.00, 'paid', '2026-06-21 23:26:37', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('259f8dc3-6fd4-496b-b137-f9f01c9fa6a4', '30179576-7a3b-4ebd-946b-671eaef22243', '275c6ee2-9c32-444d-8832-7bdab27af543', 40.00, 40.00, 'paid', '2026-06-21 18:44:57', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('2c1b8c14-0989-4807-8b29-80e6151f459e', '30179576-7a3b-4ebd-946b-671eaef22243', '9a960c43-c74e-4550-9eb3-a819252ab9fd', 40.00, 40.00, 'paid', '2026-06-21 21:14:31', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('2f23ba02-b3cc-4327-b73c-1b5738131d68', '30179576-7a3b-4ebd-946b-671eaef22243', '005de887-073b-48eb-b927-094bc2a819b1', 40.00, 40.00, 'paid', '2026-06-25 12:24:28', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('3c76ee09-3043-435f-88a9-67b94486b8cb', '30179576-7a3b-4ebd-946b-671eaef22243', 'fb6c66a9-8686-4438-89bb-34545f315233', 40.00, 40.00, 'paid', '2026-06-27 07:36:07', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('4e7b66da-5ad7-4d5b-9a88-40e91db99d40', '30179576-7a3b-4ebd-946b-671eaef22243', '8fb0b939-6494-436b-850a-351de1a624f1', 40.00, 40.00, 'paid', '2026-06-21 19:19:28', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('561815f3-cce5-4d48-b623-e3b3aafe52bd', '30179576-7a3b-4ebd-946b-671eaef22243', 'fc38905f-7c51-46f3-a00d-1f6a97df8f58', 40.00, 40.00, 'paid', '2026-06-27 07:34:18', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('6209f79e-b4fd-4f65-bccd-9541d215811b', '30179576-7a3b-4ebd-946b-671eaef22243', '001e8ad1-e66a-4cfb-a5d6-937807769467', 40.00, 40.00, 'paid', '2026-06-21 08:51:52', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('752f54a8-f25e-4d53-86d0-d1677a2ccafb', '30179576-7a3b-4ebd-946b-671eaef22243', '3c4b877a-0c2c-482a-802c-5f9d6cc4ec5c', 40.00, 40.00, 'paid', '2026-06-27 07:33:11', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('76b263d4-4329-4b39-a622-49010dfe2467', '30179576-7a3b-4ebd-946b-671eaef22243', 'e0848c14-575d-4039-9c47-e4b6cdd69a63', 40.00, 40.00, 'paid', '2026-06-27 07:15:32', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('7c9f9180-ba41-49b1-9b52-71a5204f9a49', '30179576-7a3b-4ebd-946b-671eaef22243', '12013e51-6310-4a8b-810f-84a1f3628399', 40.00, 40.00, 'paid', '2026-06-27 07:36:18', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('86b929f8-2889-478d-9716-3d91a4fff342', '30179576-7a3b-4ebd-946b-671eaef22243', '0a0ededf-b035-47cd-a877-9b60fac98758', 40.00, 40.00, 'paid', '2026-06-27 07:44:38', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('8c615071-dce7-44b5-8011-43f7f54b7952', '30179576-7a3b-4ebd-946b-671eaef22243', '26b069c8-7281-47fc-b60d-a2c8a13373d7', 40.00, 40.00, 'paid', '2026-06-28 15:15:07', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('938e5e7c-0838-43ad-beb5-8b8a5e4c3c5c', '30179576-7a3b-4ebd-946b-671eaef22243', '470cad36-3450-47b1-a83a-93fc00c1ccb8', 40.00, 40.00, 'paid', '2026-06-21 23:25:55', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('9584bf7f-626f-4673-b889-b8305e1667f3', '30179576-7a3b-4ebd-946b-671eaef22243', 'd8c0d6fd-13d2-4419-95f7-6a32f23801b7', 40.00, 40.00, 'paid', '2026-06-21 08:52:02', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('96fb480d-5c25-469d-9504-35481bb32d63', '30179576-7a3b-4ebd-946b-671eaef22243', 'ee489002-7696-47a3-a83a-6cbc4ce2259d', 40.00, 40.00, 'paid', '2026-06-21 19:17:52', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('ab04dc96-d00c-4679-a3b2-8711c4ef53ed', '30179576-7a3b-4ebd-946b-671eaef22243', 'a6aa9811-d973-4ae4-9df5-f0a40f47ca37', 40.00, 40.00, 'paid', '2026-06-21 21:14:47', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('aeddd336-8951-41b4-bb0d-d9a211490608', '30179576-7a3b-4ebd-946b-671eaef22243', '748adbc6-0b74-4cfa-950f-cb2d6e5c16c3', 40.00, 40.00, 'paid', '2026-06-28 15:22:36', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('b058a680-6399-452d-bc0c-4d75583f9302', '30179576-7a3b-4ebd-946b-671eaef22243', 'a6728210-91ee-4546-af25-04a922ba50fb', 40.00, 40.00, 'paid', '2026-06-21 08:52:51', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('b19610d1-7784-42a5-977c-53d247d3c096', '30179576-7a3b-4ebd-946b-671eaef22243', 'd77d3cb4-f484-4fef-acee-a7414917d3a0', 40.00, 40.00, 'paid', '2026-06-21 08:52:39', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('ba1de37a-f943-4473-9a38-5005425f0ce2', '30179576-7a3b-4ebd-946b-671eaef22243', '2bd6ab24-6847-4628-b485-4c610927e1a1', 40.00, 40.00, 'paid', '2026-06-28 15:30:20', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('bf16aa3a-ebbc-47e0-b3e7-734e6c633678', '30179576-7a3b-4ebd-946b-671eaef22243', '52bd459f-8768-4eb3-8c58-9cc8bdf32472', 40.00, 40.00, 'paid', '2026-06-19 12:45:01', '2026-06-19 12:45:31', '19243066-2d02-4abc-a524-5bd178b1b7e9'),
('c5c53110-f650-470a-88a0-c4b24fb861bf', '30179576-7a3b-4ebd-946b-671eaef22243', '630cc4c2-6fb2-4ef0-99f3-dea39b281819', 40.00, 40.00, 'paid', '2026-06-27 07:32:55', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('daf20410-0133-4a07-8f34-632c0467ac3c', '30179576-7a3b-4ebd-946b-671eaef22243', 'd0ca13c4-64a6-4f61-b0f9-80d3a1ccab1a', 40.00, 40.00, 'paid', '2026-06-21 08:53:01', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('e7f1b857-9f03-4e56-ba4b-7fbd1e9d14d0', '30179576-7a3b-4ebd-946b-671eaef22243', 'baa6fc40-8b29-4732-8689-483c44fbc8af', 40.00, 40.00, 'paid', '2026-06-21 08:52:14', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('f3541f00-4e6b-4b03-b51d-a1d60eb83f53', '30179576-7a3b-4ebd-946b-671eaef22243', '8ba9593c-0e59-4b4d-88bc-41f568e9b5e2', 40.00, 40.00, 'paid', '2026-06-21 21:50:39', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4'),
('feb33a2c-3c93-453f-b2c3-ec5330f9cd6d', '30179576-7a3b-4ebd-946b-671eaef22243', '2bf60274-1af7-4ab4-b30b-adfce8885e81', 40.00, 40.00, 'paid', '2026-06-28 15:36:19', '2026-06-28 15:38:57', '1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4');

-- --------------------------------------------------------

--
-- Table structure for table `rider_outlets`
--

CREATE TABLE `rider_outlets` (
  `rider_id` char(36) NOT NULL,
  `outlet_id` char(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `rider_outlets`
--

INSERT INTO `rider_outlets` (`rider_id`, `outlet_id`, `created_at`) VALUES
('30179576-7a3b-4ebd-946b-671eaef22243', '457d3b3b-d1a9-4cbe-8507-2ca103da9781', '2026-06-19 11:42:54'),
('30179576-7a3b-4ebd-946b-671eaef22243', '832c5fda-0e86-4e53-ae0e-5e89e6ad107a', '2026-06-19 11:42:54');

-- --------------------------------------------------------

--
-- Table structure for table `rider_payouts`
--

CREATE TABLE `rider_payouts` (
  `id` char(36) NOT NULL,
  `rider_id` char(36) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `period_start` timestamp NULL DEFAULT NULL,
  `period_end` timestamp NULL DEFAULT NULL,
  `status` enum('pending','paid','cancelled') NOT NULL DEFAULT 'paid',
  `paid_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `rider_payouts`
--

INSERT INTO `rider_payouts` (`id`, `rider_id`, `amount`, `period_start`, `period_end`, `status`, `paid_at`, `notes`, `created_at`) VALUES
('19243066-2d02-4abc-a524-5bd178b1b7e9', '30179576-7a3b-4ebd-946b-671eaef22243', 40.00, '2026-06-19 12:45:01', '2026-06-19 12:45:01', 'paid', '2026-06-19 12:45:31', 'Paid', '2026-06-19 12:45:31'),
('1e8ad8ae-08ca-4086-8fe7-f36f0b7694f4', '30179576-7a3b-4ebd-946b-671eaef22243', 1080.00, '2026-06-21 08:51:52', '2026-06-28 15:36:19', 'paid', '2026-06-28 15:38:57', 'Paid', '2026-06-28 15:38:57'),
('4ae57722-23f4-4459-9a84-e4664fe5ae46', '30179576-7a3b-4ebd-946b-671eaef22243', 40.00, '2026-06-19 12:42:01', '2026-06-19 12:42:01', 'paid', '2026-06-19 12:44:10', 'Paid', '2026-06-19 12:44:10');

-- --------------------------------------------------------

--
-- Table structure for table `rider_pincodes`
--

CREATE TABLE `rider_pincodes` (
  `rider_id` char(36) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `rider_pincodes`
--

INSERT INTO `rider_pincodes` (`rider_id`, `pincode`, `created_at`) VALUES
('30179576-7a3b-4ebd-946b-671eaef22243', '560091', '2026-06-19 11:42:54');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(120) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avatar_url` text DEFAULT NULL,
  `is_blocked` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `phone`, `avatar_url`, `is_blocked`, `created_at`, `updated_at`) VALUES
('46b70155-77ae-4438-b691-13fb6e2e6449', 'mark@gmail.com', '$2y$10$t3v6sZlkCN9eq5kOBrYfj.Mrvb.kFQ0wXdup1vhsAcksHADwVCFkO', NULL, NULL, NULL, 0, '2026-06-19 09:53:26', '2026-06-19 09:53:26'),
('537cb58e-6eb8-4e7f-af3a-dca50ca04021', 'alpha@gmail.com', '$2y$10$AapmcLopSfqhlTK8iGtB/uE/AzI1VBKBOPLsWhNTZsntjGs1PtnOW', NULL, NULL, NULL, 0, '2026-06-13 16:34:34', '2026-06-13 16:34:34'),
('560a5b68-6fe5-4773-b508-e968e8d58f3a', 'sachin@gmail.com', '$2y$10$etN6zZLxP3BNJeNqMoe21Ouh13x0x/yhAvEtU1c7a9inbLRqX2Xwi', 'Vin', '1234567890', NULL, 0, '2026-06-01 14:36:07', '2026-06-01 14:38:09'),
('608683de-4df0-4452-8821-da1e9b7ba2f3', 'sachinjk.213@gmail.com', '$2y$10$yqBzd0vLeX66ToY6xYehC.UL5dxkzmaaxqBT8PUvS2pLrqKiD2PwC', NULL, NULL, NULL, 0, '2026-07-11 17:14:22', '2026-07-11 17:14:22'),
('72152573-775b-4725-b08a-e85e3fac3ebe', 'support@hallifresh.com', '$2y$10$YcbGqPU/e61KXQaAyGJq..Cy5be1wh9WoGljlQFU.aHU7ulOZzfyC', 'Halli Fresh Support', '9019850084', NULL, 0, '2026-06-05 16:43:57', '2026-06-05 16:44:56'),
('aa747a32-2a89-4395-b94a-1a30a6f15c2f', 'ussonnad@gmail.com', '$2y$10$CXGAnrYLuhhLX7dE2ymjAupd929ALaYkHUpZMpPZrZ8P3cY.gwQ5e', 'Umeshs', '', NULL, 0, '2026-06-21 08:12:43', '2026-06-21 08:25:47'),
('bea66595-ebda-4241-98ee-74088e7fbee1', 'korwarehouse@gmail.com', '$2y$10$sMxOLu0qU5stV4mSsLr93uNiekcyq2wLLcKOKVtfM/nNRq.FSnz9e', 'Shiva koramangala', '1234567890', NULL, 0, '2026-06-11 15:39:33', '2026-06-11 15:40:45'),
('cbd3e804-f4e4-48b9-9b14-052498bde6b6', 'resto@gmail.com', '$2y$10$qRW3tBl/l02poau9Q89Rs.qrGtIUq.k8yljfJQUI.8q98s5T67kHK', NULL, NULL, NULL, 0, '2026-06-03 08:35:04', '2026-06-03 08:35:04'),
('eb444558-83b8-4cfb-80d9-3a7d93aaa1fc', 'restomanager@gmail.com', '$2y$10$JW6mD9.3iqEmLnDFmgXJU.CpdUtTp8RcEtt84EJNKM0W5QV/VEzE.', NULL, NULL, NULL, 0, '2026-06-05 10:53:23', '2026-06-05 10:53:23'),
('f26048b7-9eb0-47d3-bc5c-f77a6de9fb6d', 'nagrajp70@gmail.com', '$2y$10$s4gZmuhYK9aJodChpLP60O9/jFn6nVMbDzN0M17Nxg3elOdKr3m1.', 'Nagendra bichagatti', '8861393486', NULL, 0, '2026-06-09 13:19:46', '2026-06-09 13:21:29'),
('f6d2c15f-14de-4268-b85d-eda05b81f3b0', 'lala@lala.com', '$2y$10$Ste.p1RzOa6AyFAfVm6w5uvR0P5pF8lJzQmnjVJNNh4dPLU6LSeKG', NULL, NULL, NULL, 0, '2026-06-08 16:43:59', '2026-06-08 16:43:59');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `role` enum('admin','moderator','user') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role`, `created_at`) VALUES
('0880ae15-c6df-4212-ab20-397fd8636cb7', 'cbd3e804-f4e4-48b9-9b14-052498bde6b6', '', '2026-06-03 08:37:40'),
('90ae0dd2-1e8a-484c-a69f-9db5f4ea48bc', '608683de-4df0-4452-8821-da1e9b7ba2f3', 'admin', '2026-07-17 06:46:12'),
('9857f120-221c-4659-b1bc-f11de3d71b52', '46b70155-77ae-4438-b691-13fb6e2e6449', '', '2026-06-19 11:42:54');

-- --------------------------------------------------------

--
-- Table structure for table `warehouses`
--

CREATE TABLE `warehouses` (
  `id` char(36) NOT NULL,
  `name` varchar(160) NOT NULL,
  `code` varchar(40) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(80) NOT NULL DEFAULT '',
  `pincode` varchar(12) NOT NULL DEFAULT '',
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `warehouses`
--

INSERT INTO `warehouses` (`id`, `name`, `code`, `address`, `city`, `pincode`, `lat`, `lng`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
('062f16ad-3644-48b2-a65c-857b1146ed7d', 'Koramangala Warehouse', 'WH-MUM-2', 'Koramangala street', 'Bengaluru', '560087', 1.2345000, 3.4567000, 1, 0, '2026-06-11 15:33:08', '2026-06-11 15:33:08'),
('b676de76-aafa-40a6-abe1-ca1fdb30e4f9', 'Jalahalli Warehouse', 'WH-JH-1', '65,1st Main Rd, Shushruti Nagar, Byraveshwara Industrial Estate,', 'Bengaluru', '560091', 1.2345600, 2.4567800, 1, 0, '2026-06-02 11:10:49', '2026-06-02 11:10:49');

-- --------------------------------------------------------

--
-- Table structure for table `warehouse_managers`
--

CREATE TABLE `warehouse_managers` (
  `id` char(36) NOT NULL,
  `warehouse_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `warehouse_managers`
--

INSERT INTO `warehouse_managers` (`id`, `warehouse_id`, `user_id`, `created_at`) VALUES
('986ab795-d431-46a2-a8d4-8b7d6ed34224', '062f16ad-3644-48b2-a65c-857b1146ed7d', 'bea66595-ebda-4241-98ee-74088e7fbee1', '2026-06-11 15:41:40');

-- --------------------------------------------------------

--
-- Table structure for table `warehouse_pincodes`
--

CREATE TABLE `warehouse_pincodes` (
  `id` char(36) NOT NULL,
  `warehouse_id` char(36) NOT NULL,
  `pincode` varchar(12) NOT NULL,
  `priority` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `warehouse_pincodes`
--

INSERT INTO `warehouse_pincodes` (`id`, `warehouse_id`, `pincode`, `priority`, `created_at`) VALUES
('41e2afe1-c8cc-40b2-8ad0-44a854adec9d', '062f16ad-3644-48b2-a65c-857b1146ed7d', '560087', 0, '2026-06-11 15:34:31'),
('bcf0bd41-0707-442d-b9e0-3cdca2f884af', '062f16ad-3644-48b2-a65c-857b1146ed7d', '560013', 0, '2026-06-11 15:34:31'),
('bd85dcec-61d6-4c91-bbec-1645cafd99e5', 'b676de76-aafa-40a6-abe1-ca1fdb30e4f9', '560091', 0, '2026-06-02 13:31:46');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `app_settings`
--
ALTER TABLE `app_settings`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `coupon_redemptions`
--
ALTER TABLE `coupon_redemptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_coupon` (`coupon_id`);

--
-- Indexes for table `device_tokens`
--
ALTER TABLE `device_tokens`
  ADD PRIMARY KEY (`token`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `dishes`
--
ALTER TABLE `dishes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Indexes for table `furniture_items`
--
ALTER TABLE `furniture_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `furniture_promos`
--
ALTER TABLE `furniture_promos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `furniture_quotes`
--
ALTER TABLE `furniture_quotes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `hero_slides`
--
ALTER TABLE `hero_slides`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_read` (`user_id`,`is_read`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `offer_tiles`
--
ALTER TABLE `offer_tiles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `status` (`status`),
  ADD KEY `idx_orders_restaurant` (`restaurant_id`),
  ADD KEY `idx_orders_warehouse` (`warehouse_id`),
  ADD KEY `idx_orders_outlet` (`outlet_id`);

--
-- Indexes for table `order_assignments`
--
ALTER TABLE `order_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_order` (`order_id`),
  ADD KEY `idx_rider` (`rider_id`);

--
-- Indexes for table `outlets`
--
ALTER TABLE `outlets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pincode` (`pincode`);

--
-- Indexes for table `partner_dishes`
--
ALTER TABLE `partner_dishes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_restaurant` (`restaurant_id`),
  ADD KEY `idx_outlet` (`outlet_id`);

--
-- Indexes for table `partner_dish_addons`
--
ALTER TABLE `partner_dish_addons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_dish` (`dish_id`);

--
-- Indexes for table `partner_dish_variants`
--
ALTER TABLE `partner_dish_variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_dish` (`dish_id`);

--
-- Indexes for table `partner_outlets`
--
ALTER TABLE `partner_outlets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_restaurant` (`restaurant_id`);

--
-- Indexes for table `partner_outlet_managers`
--
ALTER TABLE `partner_outlet_managers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_outlet_user` (`outlet_id`,`user_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_restaurant` (`restaurant_id`);

--
-- Indexes for table `partner_restaurants`
--
ALTER TABLE `partner_restaurants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_owner` (`owner_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `category_slug` (`category_slug`);

--
-- Indexes for table `product_stock`
--
ALTER TABLE `product_stock`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_wh_product` (`warehouse_id`,`product_id`),
  ADD KEY `idx_product` (`product_id`);

--
-- Indexes for table `promo_notification_log`
--
ALTER TABLE `promo_notification_log`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_kind_ref` (`user_id`,`kind`,`ref_key`),
  ADD KEY `idx_sent` (`sent_at`);

--
-- Indexes for table `refund_requests`
--
ALTER TABLE `refund_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_refund_verification` (`verification_status`);

--
-- Indexes for table `restaurants`
--
ALTER TABLE `restaurants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_target` (`target_type`,`target_id`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `riders`
--
ALTER TABLE `riders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_rider_user` (`user_id`);

--
-- Indexes for table `rider_earnings`
--
ALTER TABLE `rider_earnings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_order` (`order_id`),
  ADD KEY `idx_rider_status` (`rider_id`,`status`),
  ADD KEY `payout_id` (`payout_id`);

--
-- Indexes for table `rider_outlets`
--
ALTER TABLE `rider_outlets`
  ADD PRIMARY KEY (`rider_id`,`outlet_id`),
  ADD KEY `idx_outlet` (`outlet_id`);

--
-- Indexes for table `rider_payouts`
--
ALTER TABLE `rider_payouts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rider` (`rider_id`);

--
-- Indexes for table `rider_pincodes`
--
ALTER TABLE `rider_pincodes`
  ADD PRIMARY KEY (`rider_id`,`pincode`),
  ADD KEY `idx_pin` (`pincode`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_role` (`user_id`,`role`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `warehouse_managers`
--
ALTER TABLE `warehouse_managers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_wh_user` (`warehouse_id`,`user_id`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `warehouse_pincodes`
--
ALTER TABLE `warehouse_pincodes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pincode` (`pincode`),
  ADD KEY `idx_warehouse` (`warehouse_id`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_product` (`user_id`,`product_id`),
  ADD KEY `idx_user` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `promo_notification_log`
--
ALTER TABLE `promo_notification_log`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `dishes`
--
ALTER TABLE `dishes`
  ADD CONSTRAINT `dishes_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_assignments`
--
ALTER TABLE `order_assignments`
  ADD CONSTRAINT `order_assignments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_assignments_ibfk_2` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `partner_dishes`
--
ALTER TABLE `partner_dishes`
  ADD CONSTRAINT `partner_dishes_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `partner_restaurants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `partner_dish_addons`
--
ALTER TABLE `partner_dish_addons`
  ADD CONSTRAINT `partner_dish_addons_ibfk_1` FOREIGN KEY (`dish_id`) REFERENCES `partner_dishes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `partner_dish_variants`
--
ALTER TABLE `partner_dish_variants`
  ADD CONSTRAINT `partner_dish_variants_ibfk_1` FOREIGN KEY (`dish_id`) REFERENCES `partner_dishes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `partner_outlets`
--
ALTER TABLE `partner_outlets`
  ADD CONSTRAINT `partner_outlets_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `partner_restaurants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `partner_outlet_managers`
--
ALTER TABLE `partner_outlet_managers`
  ADD CONSTRAINT `partner_outlet_managers_ibfk_1` FOREIGN KEY (`outlet_id`) REFERENCES `partner_outlets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `partner_outlet_managers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `partner_restaurants`
--
ALTER TABLE `partner_restaurants`
  ADD CONSTRAINT `partner_restaurants_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_stock`
--
ALTER TABLE `product_stock`
  ADD CONSTRAINT `product_stock_ibfk_1` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `refund_requests`
--
ALTER TABLE `refund_requests`
  ADD CONSTRAINT `refund_requests_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `refund_requests_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `restaurants`
--
ALTER TABLE `restaurants`
  ADD CONSTRAINT `restaurants_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `rider_earnings`
--
ALTER TABLE `rider_earnings`
  ADD CONSTRAINT `rider_earnings_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rider_earnings_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rider_earnings_ibfk_3` FOREIGN KEY (`payout_id`) REFERENCES `rider_payouts` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `rider_outlets`
--
ALTER TABLE `rider_outlets`
  ADD CONSTRAINT `rider_outlets_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rider_outlets_ibfk_2` FOREIGN KEY (`outlet_id`) REFERENCES `partner_outlets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rider_payouts`
--
ALTER TABLE `rider_payouts`
  ADD CONSTRAINT `rider_payouts_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rider_pincodes`
--
ALTER TABLE `rider_pincodes`
  ADD CONSTRAINT `rider_pincodes_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `warehouse_managers`
--
ALTER TABLE `warehouse_managers`
  ADD CONSTRAINT `warehouse_managers_ibfk_1` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `warehouse_managers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `warehouse_pincodes`
--
ALTER TABLE `warehouse_pincodes`
  ADD CONSTRAINT `warehouse_pincodes_ibfk_1` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
