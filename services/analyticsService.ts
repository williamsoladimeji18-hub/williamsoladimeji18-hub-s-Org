
/**
 * Maison Teola Analytics Engine
 * Provides structured telemetry for user behavior and A/B test tracking.
 */

export type MaisonEvent = 
  | 'session_start'
  | 'stylist_query_sent'
  | 'chip_interaction'
  | 'outfit_curated'
  | 'outfit_feedback'
  | 'archive_action'
  | 'planner_deployment'
  | 'a11y_mode_toggled'
  | 'profile_view'
  | 'refine_style_started'
  | 'refine_style_completed'
  | 'cloud_sync_triggered'
  | 'setting_toggled'
  | 'delete_account_requested'
  | 'integration_connected';

class AnalyticsService {
  private userId: string | null = null;
  private isElite: boolean = false;

  setUser(userId: string, isElite: boolean) {
    this.userId = userId;
    this.isElite = isElite;
  }

  /**
   * Dispatches a structured event to the Maison analytics gate.
   * Telemetry logs are disabled in the console to maintain a clean UI/Preview environment.
   */
  track(event: MaisonEvent, properties: Record<string, any> = {}) {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      user_id: this.userId || properties.user_id,
      context: {
        is_elite: this.isElite,
        viewport_width: window.innerWidth,
        platform: navigator.platform,
        ...properties
      }
    };

    // Logging disabled to fix the issue where logs appear under the preview pane
    /*
    console.group(`[Maison Telemetry] ${event}`);
    console.log('Payload:', payload);
    console.groupEnd();
    */
    
    // Future implementation: Send to a hypothetical endpoint
    // fetch('https://api.maison-teola.ai/v1/track', { method: 'POST', body: JSON.stringify(payload) }).catch(() => {});
  }

  /**
   * Multi-variant A/B Variant Assignment
   * Uses deterministic hashing of user ID for consistent cross-session experience.
   * @param experimentId The unique ID for the experiment
   * @param variantCount Number of variants to distribute (default 2)
   * @returns index of the assigned variant (0 to variantCount - 1)
   */
  getVariant(experimentId: string, variantCount: number = 2): number {
    const id = this.userId || 'anonymous';
    const combinedKey = `${experimentId}:${id}`;
    let hash = 0;
    for (let i = 0; i < combinedKey.length; i++) {
      const char = combinedKey.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % variantCount;
  }
}

export const analytics = new AnalyticsService();
