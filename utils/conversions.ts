// Conversion Constants
export const CM_TO_INCH = 0.393701;
export const INCH_TO_CM = 2.54;

/**
 * Converts a value from internal storage (CM/EU) to display format based on user preference.
 */
export const convertToDisplay = (
  value: number | string | undefined, 
  system: 'Metric' | 'Imperial', 
  isShoeSize = false, 
  standard: 'US' | 'UK' | 'EU' = 'EU'
): string => {
  if (value === undefined || value === null || value === '') return '';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return value.toString();

  if (isShoeSize) {
    // Basic shoe size conversion logic (simplified)
    // Internal is EU
    if (standard === 'US') {
      // EU to US (approx: US = EU - 33)
      return (numValue - 33).toFixed(1);
    } else if (standard === 'UK') {
      // EU to UK (approx: UK = EU - 32.5)
      return (numValue - 32.5).toFixed(1);
    }
    return numValue.toString();
  }

  if (system === 'Imperial') {
    return (numValue * CM_TO_INCH).toFixed(1);
  }
  return numValue.toString();
};

/**
 * Converts a display value back to internal storage format (CM/EU).
 */
export const convertToInternal = (
  value: string, 
  system: 'Metric' | 'Imperial', 
  isShoeSize = false, 
  standard: 'US' | 'UK' | 'EU' = 'EU'
): number => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 0;

  if (isShoeSize) {
    if (standard === 'US') return numValue + 33;
    if (standard === 'UK') return numValue + 32.5;
    return numValue;
  }

  if (system === 'Imperial') {
    return numValue * INCH_TO_CM;
  }
  return numValue;
};

/**
 * Maps a measurement (in cm) to a regional size (S, M, L, etc.) based on standard.
 */
export const getRegionalSize = (
  cmValue: number | string | undefined,
  part: 'chest' | 'waist' | 'hips',
  standard: 'US' | 'UK' | 'EU' = 'EU'
): string => {
  if (cmValue === undefined || cmValue === null || cmValue === '') return 'N/A';
  const val = typeof cmValue === 'string' ? parseFloat(cmValue.replace(/[^0-9.]/g, '')) : cmValue;
  if (isNaN(val)) return 'N/A';

  // Basic mapping logic (Simplified for demonstration, can be expanded)
  if (part === 'chest') {
    if (standard === 'US') {
      if (val < 92) return 'S';
      if (val < 102) return 'M';
      if (val < 112) return 'L';
      return 'XL';
    } else if (standard === 'UK') {
      if (val < 94) return 'S';
      if (val < 104) return 'M';
      if (val < 114) return 'L';
      return 'XL';
    } else { // EU
      if (val < 96) return 'S';
      if (val < 100) return 'M';
      if (val < 106) return 'M/L';
      if (val < 116) return 'L';
      return 'XL';
    }
  }

  if (part === 'waist') {
    if (standard === 'US') {
      if (val < 76) return 'S';
      if (val < 86) return 'M';
      if (val < 96) return 'L';
      return 'XL';
    } else if (standard === 'UK') {
      if (val < 78) return 'S';
      if (val < 88) return 'M';
      if (val < 98) return 'L';
      return 'XL';
    } else { // EU
      if (val < 80) return 'S';
      if (val < 90) return 'M';
      if (val < 100) return 'L';
      return 'XL';
    }
  }

  if (part === 'hips') {
    if (val < 95) return 'S';
    if (val < 105) return 'M';
    if (val < 115) return 'L';
    return 'XL';
  }

  return 'N/A';
};

/**
 * Returns the unit label based on the measurement system.
 */
export const getUnitLabel = (system: 'Metric' | 'Imperial', isShoeSize = false, standard: 'US' | 'UK' | 'EU' = 'EU'): string => {
  if (isShoeSize) return standard;
  return system === 'Imperial' ? 'in' : 'cm';
};
