/**
 * Configuration Parameters for AI Pattern & Root Cause Analysis System
 */
export const RECURRING_COMPLAINT_THRESHOLD = parseInt(process.env.RECURRING_COMPLAINT_THRESHOLD || "3", 10);
export const PATTERN_ANALYSIS_WINDOW_DAYS = parseInt(process.env.PATTERN_ANALYSIS_WINDOW_DAYS || "30", 10);
export const SPATIAL_RADIUS_KM = parseFloat(process.env.SPATIAL_RADIUS_KM || "10.0");
