export type PieceStatus = 'pending' | 'approved' | 'revision_requested'
export type CommentType = 'general' | 'pin'
export type ApprovalDecision = 'approved' | 'revision_requested'

export interface Project {
  id: string
  name: string
  client_name: string
  created_at: string
}

export interface ProjectWithCounts extends Project {
  pieces: { status: PieceStatus }[]
}

export interface Piece {
  id: string
  project_id: string
  title: string
  description: string | null
  status: PieceStatus
  public_token: string
  notified_at: string | null
  created_at: string
  updated_at: string
}

export interface PieceWithVersions extends Piece {
  piece_versions: PieceVersion[]
  approvals: Approval[]
}

export interface PieceVersion {
  id: string
  piece_id: string
  version_number: number
  file_url: string
  file_type: string
  uploaded_at: string
}

export interface Comment {
  id: string
  piece_id: string
  version_id: string
  author_name: string
  content: string
  comment_type: CommentType
  pin_x: number | null
  pin_y: number | null
  created_at: string
}

export interface Approval {
  id: string
  piece_id: string
  version_id: string
  decision: ApprovalDecision
  feedback: string | null
  decided_by: string
  decided_at: string
}

export interface NotifyDecisionPayload {
  pieceName: string
  projectName: string
  clientName: string
  decision: ApprovalDecision
  feedback?: string
  decidedBy: string
  pieceToken: string
}
