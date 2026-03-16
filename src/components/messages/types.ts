export type MessageFilter = "all" | "unread" | "archived";

export interface MessageRecord {
  id: string;
  student_id: string;
  tutor_name: string;
  content: string;
  created_at: string;
  sender_type: string;
  sender_display_name: string | null;
  read_at: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  attachment_size: number | null;
}

export interface ConversationRecord {
  student_id: string;
  tutor_name: string;
  archived_by_student?: boolean;
  archived_by_tutor?: boolean;
  deleted_by_student?: boolean;
  deleted_by_tutor?: boolean;
  updated_at: string;
}

export interface BookingContactRecord {
  student_id?: string;
  student_name?: string | null;
  tutor_name?: string;
  tutor_avatar_url?: string | null;
  subject: string;
  created_at: string;
}

export interface ConversationListItem {
  id: string;
  name: string;
  avatar_url: string | null;
  subject: string;
  lastMessage: string;
  unread: number;
  archived: boolean;
  updatedAt: string;
}