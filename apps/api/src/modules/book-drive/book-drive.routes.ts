import { Router } from 'express';
import { getPublicBookDrive } from './book-drive.controller';

export const bookDriveRouter = Router();

// Public landing endpoint for semester book drive
bookDriveRouter.get('/:campusSlug', getPublicBookDrive);
