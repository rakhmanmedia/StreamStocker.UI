import { Guid } from "guid-typescript";
import { Container } from "./container";
import { Stock } from "./stock";
import { SessionContainerCreate } from "./session-container-create";
import { SessionContainer } from "./session-container";

export class RedirectedContainer {
    // id: Guid;
    // containerId: Guid;
    // container: Container;
    // comments: string;
    // stockId: Guid;
    // stock: Stock;
    // redirectionDate: string = new Date().toISOString().slice(0, 10);
    // fileCount: string = '0 файлов';
    id: Guid;
    stockId: Guid;
    sessionContainerId: Guid;
    sessionContainer: SessionContainer = new SessionContainer();
    comments: string;
    redirectionDate: string = new Date().toISOString().slice(0, 10);
}


