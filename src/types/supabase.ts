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
    };
  };
}

