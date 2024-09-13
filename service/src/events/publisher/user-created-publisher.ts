import { Publisher } from "@ebazdev/core";
import { UserCreatedEvent } from "../../shared/events/user-create-event";
import { AuthEventSubjects } from "../../shared/events/auth-event-subjects";

export class UserCreatedCreatedPublisher extends Publisher<UserCreatedEvent> {
  subject: AuthEventSubjects = AuthEventSubjects.UserCreated;
}
