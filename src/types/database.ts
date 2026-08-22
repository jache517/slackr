export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SourceType = "github" | "google_docs" | "google_meet";
export type DocsActivityType = "edit" | "comment" | "suggestion";
export type ContextSubmissionType =
  | "member_self_reported"
  | "project_owner_recorded";

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          title: string;
          deadline: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          deadline: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          deadline?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      members: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          email: string | null;
          github_username: string | null;
          google_email: string | null;
          auth_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          email?: string | null;
          github_username?: string | null;
          google_email?: string | null;
          auth_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          email?: string | null;
          github_username?: string | null;
          google_email?: string | null;
          auth_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      source_connections: {
        Row: {
          id: string;
          project_id: string;
          source_type: SourceType;
          external_id: string;
          display_name: string;
          connected_at: string;
          last_synced_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          source_type: SourceType;
          external_id: string;
          display_name: string;
          connected_at?: string;
          last_synced_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          source_type?: SourceType;
          external_id?: string;
          display_name?: string;
          connected_at?: string;
          last_synced_at?: string | null;
        };
        Relationships: [];
      };
      github_activity: {
        Row: {
          id: string;
          project_id: string;
          source_connection_id: string;
          member_id: string | null;
          commit_sha: string;
          commit_message: string;
          author_name: string | null;
          author_email: string | null;
          author_username: string | null;
          authored_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          source_connection_id: string;
          member_id?: string | null;
          commit_sha: string;
          commit_message: string;
          author_name?: string | null;
          author_email?: string | null;
          author_username?: string | null;
          authored_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          source_connection_id?: string;
          member_id?: string | null;
          commit_sha?: string;
          commit_message?: string;
          author_name?: string | null;
          author_email?: string | null;
          author_username?: string | null;
          authored_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      docs_activity: {
        Row: {
          id: string;
          project_id: string;
          source_connection_id: string;
          member_id: string | null;
          activity_type: DocsActivityType;
          actor_email: string | null;
          provider_activity_id: string | null;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          source_connection_id: string;
          member_id?: string | null;
          activity_type: DocsActivityType;
          actor_email?: string | null;
          provider_activity_id?: string | null;
          occurred_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          source_connection_id?: string;
          member_id?: string | null;
          activity_type?: DocsActivityType;
          actor_email?: string | null;
          provider_activity_id?: string | null;
          occurred_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      member_context: {
        Row: {
          id: string;
          project_id: string;
          member_id: string;
          context_text: string;
          submitted_by_user_id: string;
          submission_type: ContextSubmissionType;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          member_id: string;
          context_text: string;
          submitted_by_user_id?: string;
          submission_type?: ContextSubmissionType;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          member_id?: string;
          context_text?: string;
          submitted_by_user_id?: string;
          submission_type?: ContextSubmissionType;
          created_at?: string;
        };
        Relationships: [];
      };
      member_role_context: {
        Row: {
          id: string;
          project_id: string;
          member_id: string;
          primary_role: string;
          additional_roles: string[];
          responsibilities: string[];
          additional_context: string | null;
          submission_type: ContextSubmissionType;
          submitted_by_user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          member_id: string;
          primary_role: string;
          additional_roles?: string[];
          responsibilities?: string[];
          additional_context?: string | null;
          submission_type?: ContextSubmissionType;
          submitted_by_user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          member_id?: string;
          primary_role?: string;
          additional_roles?: string[];
          responsibilities?: string[];
          additional_context?: string | null;
          submission_type?: ContextSubmissionType;
          submitted_by_user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      meetings: {
        Row: {
          id: string;
          project_id: string;
          source_connection_id: string;
          title: string;
          provider_meeting_id: string | null;
          held_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          source_connection_id: string;
          title: string;
          provider_meeting_id?: string | null;
          held_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          source_connection_id?: string;
          title?: string;
          provider_meeting_id?: string | null;
          held_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      meeting_attendance: {
        Row: {
          id: string;
          project_id: string;
          meeting_id: string;
          member_id: string | null;
          attendee_name: string | null;
          attendee_email: string | null;
          joined_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          meeting_id: string;
          member_id?: string | null;
          attendee_name?: string | null;
          attendee_email?: string | null;
          joined_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          meeting_id?: string;
          member_id?: string | null;
          attendee_name?: string | null;
          attendee_email?: string | null;
          joined_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      google_oauth_intents: {
        Row: {
          id: string;
          project_id: string;
          requested_by_user_id: string;
          source_type: "google_docs";
          external_id: string;
          state_hash: string;
          expires_at: string;
          consumed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          requested_by_user_id: string;
          source_type?: "google_docs";
          external_id: string;
          state_hash: string;
          expires_at: string;
          consumed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          requested_by_user_id?: string;
          source_type?: "google_docs";
          external_id?: string;
          state_hash?: string;
          expires_at?: string;
          consumed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      create_google_oauth_intent: {
        Args: {
          p_project_id: string;
          p_external_id: string;
          p_state_hash: string;
          p_expires_at: string;
        };
        Returns: string;
      };
      consume_google_oauth_intent: {
        Args: {
          p_state_hash: string;
        };
        Returns: Array<{
          project_id: string;
          requested_by_user_id: string;
          external_id: string;
          expires_at: string;
        }>;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
