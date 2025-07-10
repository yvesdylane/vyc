export interface participant {
    id : number; // Unique identifier for the participant
    event_id : number; // ID of the event the participant is associated with
    user_id? : string; // UUID of the user participating in the event, optional cause i don't want to return it in the response
    name?: string; // Name of the participant
    images? : string; // Optional field for participant's images
    bio? : string; // Optional biography of the participant
    vote_power? : number; // Optional field for the participant's voting power
    ranking_position? : number; // Optional field for the participant's ranking position
    created_at? : string; // Timestamp of when the participant was created, defaults to current timestamp
    updated_at? : string; // Timestamp of when the participant was last updated, defaults to current timestamp
}