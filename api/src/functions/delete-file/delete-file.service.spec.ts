// import { IDeleteFileService, deleteFileServiceFactory } from '@household/api/functions/delete-file/delete-file.service';
// import { createFileId } from '@household/shared/common/test-data-factory';
// import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
// import { IFileService } from '@household/shared/services/file-service';

// describe('Delete file service', () => {
//   let service: IDeleteFileService;
//   let mockFileService: Mock<IFileService>;

//   beforeEach(() => {
//     mockFileService = createMockService('deleteFile');

//     service = deleteFileServiceFactory(mockFileService.service);
//   });

//   const fileId = createFileId();

//   it('should return if document is deleted', async () => {
//     mockFileService.functions.deleteFile.mockResolvedValue(undefined);

//     await service({
//       fileId,
//     });
//     validateFunctionCall(mockFileService.functions.deleteFile, fileId);
//     expect.assertions(1);
//   });

//   describe('should throw error', () => {
//     it('if unable to delete document', async () => {
//       mockFileService.functions.deleteFile.mockRejectedValue('this is a mongo error');

//       await service({
//         fileId,
//       }).catch(validateError('Error while deleting file', 500));
//       validateFunctionCall(mockFileService.functions.deleteFile, fileId);
//       expect.assertions(3);
//     });
//   });
// });
