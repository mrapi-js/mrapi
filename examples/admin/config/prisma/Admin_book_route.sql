/*
 Navicat Premium Data Transfer

 Source Server         : 21
 Source Server Type    : MySQL
 Source Server Version : 50728
 Source Host           : localhost:3306
 Source Schema         : public_booking_admin

 Target Server Type    : MySQL
 Target Server Version : 50728
 File Encoding         : 65001

 Date: 20/06/2020 15:35:47
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for Admin_book_route
-- ----------------------------
DROP TABLE IF EXISTS `Admin_book_route`;
CREATE TABLE `Admin_book_route` (
  `authorized_apis` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `component` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `path` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `redirect` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sequence` int(11) NOT NULL DEFAULT '0',
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_path` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of Admin_book_route
-- ----------------------------
BEGIN;
INSERT INTO `Admin_book_route` VALUES ('[\"/book/group/update\",\"/book/group/namelist\",\"/manage/upload/key\",\"/book/group/getinfo\"]', 'views/infor-mgmt/ads-svc/index', '', '5cf13c2ba26d2058ff8d4be0', 'ads-svc', '5cf13c2ba26d2058ff8d4be7', 'infor-mgmt', NULL, 0, '商户信息', '/');
INSERT INTO `Admin_book_route` VALUES ('[\"/book/listGroupUser\",\"/book/newGroupUser\",\"/book/deleteGroupUser\",\"/book/group/namelist\"]', 'views/guide-mgmt/works-svc/index', '', '5cf13c2ba26d2058ff8d4be2', 'works-svc', '5cf48751a26d203a212e1d9a', 'scanCode', NULL, 0, '检票员管理', '/');
INSERT INTO `Admin_book_route` VALUES (NULL, NULL, 'info', '5cf13c2ba26d2058ff8d4be7', 'infor-mgmt', '0', '/', '/infor-mgmt/exhibit-svc', 0, '信息管理', '/');
INSERT INTO `Admin_book_route` VALUES ('[\"/book/list/manage\",\"/book/refund\",\"/book/group/namelist\"]', 'views/order-mgmt/t-order-svc/index', '', '5cf485c8a26d203a212e1d93', 't-order-svc', '5cf485c8a26d203a212e1d96', 't-order-svc', NULL, 0, '预约信息管理', '/');
INSERT INTO `Admin_book_route` VALUES ('[\"/book/venue/managelist\",\"/book/venue/new\",\"/book/venue/update\",\"/book/venue/del\",\"/book/group/namelist\"]', 'views/order-mgmt/g-order-svc/index', '', '5cf485c8a26d203a212e1d95', 'g-order-svc', '5cf485c8a26d203a212e1d96', 'g-order-svc', NULL, 0, '预约项目管理', '/');
INSERT INTO `Admin_book_route` VALUES (NULL, NULL, 'info', '5cf485c8a26d203a212e1d96', 'order-mgmt', '0', '/order-mgmt', '/order-mgmt/t-order-svc', 0, '预约管理', '/');
INSERT INTO `Admin_book_route` VALUES (NULL, NULL, '', '5cf48751a26d203a212e1d9a', 'sale', '0', '/setting', NULL, 0, '管理员设置', '/');
INSERT INTO `Admin_book_route` VALUES ('[\"/book/statbook\",\"/book/statbookrec\",\"/book/group/namelist\",\"/book/venue/managelist\"]', 'views/statistics/ticket', '', '5cf48751a26d203a212e1d9b', 'ticket', '5cf48751a26d203a212e1d9d', 'ticket', NULL, 0, '数据统计', '/');
INSERT INTO `Admin_book_route` VALUES ('[\"/book/statvisitor\",\"/book/group/namelist\"]', 'views/statistics/user', '', '5cf48751a26d203a212e1d9c', 'user', '5cf48751a26d203a212e1d9d', 'user', NULL, 0, '用户画像', '/');
INSERT INTO `Admin_book_route` VALUES (NULL, NULL, 'statistics', '5cf48751a26d203a212e1d9d', 'statistics', '0', '/statistics', '/statistics/sale', 0, '数据统计', '/');
INSERT INTO `Admin_book_route` VALUES ('[\"/route/all\",\"/role/list\",\"/role/create\",\"/role/update\",\"/role/delete\",\"/book/group/namelist\"]', 'views/permission/role', '', '5cf487e2a26d203a212e1d9e', 'role', '5cf48751a26d203a212e1d9a', 'role', NULL, 0, '角色管理', '/');
INSERT INTO `Admin_book_route` VALUES ('[\"/account/list\",\"/account/register\",\"/account/update\",\"/account/delete\",\"/book/group/namelist\"]', 'views/permission/account', '', '5cf487e2a26d203a212e1d9f', 'account', '5cf48751a26d203a212e1d9a', 'account', NULL, 0, '账号管理', '/');
INSERT INTO `Admin_book_route` VALUES (NULL, NULL, 'permission', '5cf487e2a26d203a212e1da0', 'permission', '0', '/permission', '/permission/index', 0, '平台管理', '/');
INSERT INTO `Admin_book_route` VALUES ('[\"/book/group/managelist\",\"/book/group/new\",\"/book/group/update/qrcodeimg\",\"/book/group/del\",\"/book/group/namelist\"]', 'views/infor-mgmt/info-svc/index', '', '5d7efffca26d207952539ae7', 'info-svc', '5cf487e2a26d203a212e1da0', 'business', NULL, 0, '商户管理', '/');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
