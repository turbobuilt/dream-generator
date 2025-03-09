import { Request, Response } from 'express';
import { AuthenticatedUser } from '../models/AuthenticatedUser';

export async function updateCloudSync(req: Request, res: Response) {
  const { cloudSync } = req.body;

  await db.query(`UPDATE AuthenticatedUser SET cloudSync=? WHERE id=?`, [cloudSync == true ? 1 : 0, req.authenticatedUser.id])

  res.json({ success: true });
};

export const route = {
    url: "/api/update-cloud-sync",
    method: 'PUT',
    authenticated: true
}
