export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          google_sub_id: string | null;
          photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          google_sub_id?: string | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          google_sub_id?: string | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          campaign_name: string;
          start_date: string;
          end_date: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_name: string;
          start_date: string;
          end_date: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campaign_name?: string;
          start_date?: string;
          end_date?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaign_channels: {
        Row: {
          id: string;
          campaign_id: string;
          channel_type: string;
          landing_url: string;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_content: string | null;
          utm_term: string | null;
          final_url: string;
          meta_campaign_name: string | null;
          meta_adset_name: string | null;
          meta_ad_name: string | null;
          google_campaign_name: string | null;
          google_adgroup_name: string | null;
          google_ad_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          channel_type: string;
          landing_url: string;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_term?: string | null;
          final_url: string;
          meta_campaign_name?: string | null;
          meta_adset_name?: string | null;
          meta_ad_name?: string | null;
          google_campaign_name?: string | null;
          google_adgroup_name?: string | null;
          google_ad_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          channel_type?: string;
          landing_url?: string;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_term?: string | null;
          final_url?: string;
          meta_campaign_name?: string | null;
          meta_adset_name?: string | null;
          meta_ad_name?: string | null;
          google_campaign_name?: string | null;
          google_adgroup_name?: string | null;
          google_ad_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      utm_templates: {
        Row: {
          id: string;
          channel_type: string;
          utm_source_pattern: string | null;
          utm_medium_pattern: string | null;
          utm_campaign_pattern: string | null;
          utm_content_pattern: string | null;
          utm_term_pattern: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          channel_type: string;
          utm_source_pattern?: string | null;
          utm_medium_pattern?: string | null;
          utm_campaign_pattern?: string | null;
          utm_content_pattern?: string | null;
          utm_term_pattern?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          channel_type?: string;
          utm_source_pattern?: string | null;
          utm_medium_pattern?: string | null;
          utm_campaign_pattern?: string | null;
          utm_content_pattern?: string | null;
          utm_term_pattern?: string | null;
          updated_at?: string;
        };
      };
      utm_checker_logs: {
        Row: {
          id: string;
          user_id: string | null;
          input_url: string;
          domain_name: string | null;
          parsed_params: Json;
          diagnosis: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          input_url: string;
          domain_name?: string | null;
          parsed_params?: Json;
          diagnosis?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          input_url?: string;
          domain_name?: string | null;
          parsed_params?: Json;
          diagnosis?: Json;
          created_at?: string;
        };
      };
    };
  };
}

