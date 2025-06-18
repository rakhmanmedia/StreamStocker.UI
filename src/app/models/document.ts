import { Binary } from "@angular/compiler";
import { ContainerDocument } from "./container-document";
import { Guid } from "guid-typescript";
import { AttachmentType } from "./attachment-type.enum";
import { GuideStatusDocument } from "./guide-status-document";
import { SessionContainerDocument } from "./session-container-document";
import { TypeDocument } from "./type-document";

export class Docs {
    id: Guid;
    fileHash: Binary;
    fileName: string
    fileSize: number;
    filePath: string;
    specialFileName: string;
    uniqueFileName: string;
    uploadDate: string = new Date().toISOString().slice(0, 10);
    containerDocuments: ContainerDocument[];
    sessionContainerDocuments: SessionContainerDocument[];
    downloadLink: string;
    typeAttachment: AttachmentType;
    typeDocumentId: Guid;
    typeDocument: TypeDocument;
    guideStatusDocumentId: Guid;
    guideStatusDocument: GuideStatusDocument;
}