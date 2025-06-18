import { ContainerCreate } from "./container-create"

export class SessionContainerCreate {
    container: ContainerCreate = new ContainerCreate();
    sessionDate: string = new Date().toISOString().slice(0, 10);
}