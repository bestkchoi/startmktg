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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_company_emails: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string;
          company_email: string;
          verified: boolean;
          verification_token: string | null;
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id: string;
          company_email: string;
          verified?: boolean;
          verification_token?: string | null;
          verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string;
          company_email?: string;
          verified?: boolean;
          verification_token?: string | null;
          verified_at?: string | null;
          created_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          plan: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          plan?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          plan?: string;
          created_at?: string;
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
    };
  };
}

