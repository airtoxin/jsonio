import { NextApiHandler } from "next";
import { z } from "zod";
import { prisma } from "../../../server/prisma";
import { GetRowResponse } from "./responseTypes";
import { stringToInt } from "../../../server/utils";

export const handler: NextApiHandler = async (req, res) => {
  const { bucketName, rowId } = z
    .object({
      bucketName: z.string(),
      rowId: stringToInt,
    })
    .parse(req.query);

  // get row
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

    const body: GetRowResponse = row;
    return res.status(200).json(body);
  }

  res.status(405).end();
};

export default handler;
