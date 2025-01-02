import { Container } from "./container";

export class ImportContainerResult {
    validRows: number = 0
    invalidControlDigitRows: number = 0
    invalidFormatRows: number = 0;
    errorRows: number = 0;
    alreadyExistRows: number = 0;
    markedForDeletionRows: number = 0;
    unknownTypeContainerRows: number = 0;
    linkDownloadLog: string;
    validContaners: Container[];
    invalidControlDigitContaners: Container[];
    existsAsMarkedForDeletion: Container[];
}