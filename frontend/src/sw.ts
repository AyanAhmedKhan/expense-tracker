/**
 * Custom service worker extension (Workbox will also generate precaching).
 * This file demonstrates runtime caching with Authorization header passthrough.
 */

// Listen for messages (e.g., token updates) if needed in future.
self.addEventListener('message', (event: any) => {
  // Placeholder for receiving auth token if we decide to cache authenticated responses differently.
});

// No manual fetch override now; Workbox runtimeCaching in vite.config.ts handles API NetworkFirst.
// If you need fine-grained control (e.g., ignore caching for auth/login), you can implement here.

export {}; // TypeScript module marker