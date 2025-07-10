export interface Scope {
    "scope": "institution_students" | "global" | "department_specific" | "specialty_specific";
    "department"? : [number]; // optional, only if scope is "department_specific"
    "specialty"? : [number]; // optional, only if scope is "specialty_specific"
}

export interface Event {
    id: number; 
    institution_id: string; // UUID of the institution, this is a reference to the institution that created the event
    create_by: string; // UUID of the user who created the event
    created_at: string; // ISO timestamp string
    updated_at: string; // ISO timestamp string
    status: 'waiting' | 'approve' | 'cancel' | 'ongoing' | 'finish'; // can be 'waiting', 'approve', 'cancel', 'ongoing', 'finish'
    check_by?: string; // UUID of the user who checked the event, optional
    start_on: string; // ISO date string, e.g., "2023-10-01"
    end_on: string; // ISO date string, e.g., "2023-10-01"
    vote_cost?: number; // optional, the cost of voting for this event
    maximum_vote?: number; // optional, the maximum number of votes allowed for this event
    who_can_participate?: Scope; // optional, JSON object defining who can participate in the event
    name: string;
}

