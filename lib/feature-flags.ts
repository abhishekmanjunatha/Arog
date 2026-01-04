/**
 * Feature Flags Utility
 * Controls which features are enabled in the application
 */

// Builder Engine V2 Feature Flag
// When enabled, uses the new form builder system
// When disabled, falls back to legacy variable-based templates
export const ENABLE_BUILDER_V2 = process.env.NEXT_PUBLIC_ENABLE_BUILDER_V2 === 'true';

/**
 * Check if Builder V2 is enabled
 * Use this function in components to conditionally render builder UI
 */
export function isBuilderV2Enabled(): boolean {
  return ENABLE_BUILDER_V2;
}

/**
 * Get the default builder version for new templates
 * Returns 2 if Builder V2 is enabled, 1 otherwise
 */
export function getDefaultBuilderVersion(): 1 | 2 {
  return ENABLE_BUILDER_V2 ? 2 : 1;
}

/**
 * Check if a template uses the builder engine
 * @param builderVersion - The builder version from the template
 */
export function isBuilderTemplate(builderVersion: number | null | undefined): boolean {
  return builderVersion === 2;
}

/**
 * Feature flag configuration for future expansion
 */
export const FeatureFlags = {
  // Builder Engine
  BUILDER_V2: ENABLE_BUILDER_V2,
  
  // Future features can be added here
  // ENABLE_AI_SUGGESTIONS: process.env.NEXT_PUBLIC_ENABLE_AI_SUGGESTIONS === 'true',
  // ENABLE_PDF_EXPORT: process.env.NEXT_PUBLIC_ENABLE_PDF_EXPORT !== 'false',
} as const;

export type FeatureFlagKey = keyof typeof FeatureFlags;

/**
 * Check if a specific feature is enabled
 * @param feature - The feature flag key
 */
export function isFeatureEnabled(feature: FeatureFlagKey): boolean {
  return FeatureFlags[feature];
}
