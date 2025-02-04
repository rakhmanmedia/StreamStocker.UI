import { Binary } from "@angular/compiler";
import { ContainerDocument } from "./container-document";

export class Docs {
    fileHash: Binary;
    fileName: string
    fileSize: number;
    filePath: string;
    uniqueFileName: string;
    uploadDate: string = new Date().toISOString().slice(0, 10);
    containerDocuments: ContainerDocument[];
}