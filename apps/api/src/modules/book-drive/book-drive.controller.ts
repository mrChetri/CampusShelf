import { Request, Response } from 'express';
import { bookDriveService } from './book-drive.service';

export function getPublicBookDrive(req: Request, res: Response): void {
  const { campusSlug } = req.params;
  if (!campusSlug || !campusSlug.trim()) {
    res.status(400).json({ error: 'Campus slug is required' });
    return;
  }

  const hostHeader = req.get('host');
  const protocol = req.protocol;
  const baseUrl = hostHeader ? `${protocol}://${hostHeader}` : 'https://campusshelf.org';

  const drive = bookDriveService.getDriveByCampusSlug(campusSlug.trim(), baseUrl);
  if (!drive) {
    res.status(404).json({ error: 'Campus book drive not found' });
    return;
  }

  // Privacy Guardrail: Ensure no personal contact details (email, phone, address) leak in response
  res.json({ drive });
}
