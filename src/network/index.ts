/**
 * --------------------------------------------------------
 * File: index.ts
 * Module: Network
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Barrel (re-export) module for the network package so callers use a single,
 * stable import path.
 *
 * Responsibilities:
 * - Re-export the NetworkManager and the network types.
 *
 * Used By:
 * net.fixtures.ts and any code consuming the network layer directly.
 *
 * Dependencies:
 * The sibling network-* modules it re-exports.
 *
 * Last Updated: 2026-06-28
 * --------------------------------------------------------
 */
export { NetworkManager } from '@network/network-manager';
export type { MockResponse, NetworkRecord, UrlPattern } from '@network/network.types';
