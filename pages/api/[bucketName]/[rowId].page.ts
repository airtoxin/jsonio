import { NextApiHandler } from "next";
import { z } from "zod";
import { prisma } from "../../../server/prisma";

export const handler: NextApiHandler = async (req, res) => {
  const { bucketName, rowId } = z
    .object({ bucketName: z.string(), rowId: z.number() })
    .parse(req.query);

  if (req.method === "GET") {
    const [row] = await prisma.row.findMany({
      select: {
        id: true,
        json: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        id: rowId,
        bucket: {
          name: bucketName,
        },
      },
    });
    if (row == null) {
      res.status(404).end();
      return;
    }

    return res.status(200).json(row);
  }

  res.status(405).end();
};

export default handler;
