import { NextApiHandler } from "next";
import { prisma } from "../../../server/prisma";
import { z } from "zod";

export const handler: NextApiHandler = async (req, res) => {
  const { bucketName } = z.object({ bucketName: z.string() }).parse(req.query);

  // create bucket
  if (req.method === "PUT") {
    await prisma.bucket.create({
      data: {
        name: bucketName,
      },
    });

    res.status(200).json({
      bucketName,
    });
    return;
  }

  // create row
  if (req.method === "POST") {
    const json = z.object({}).passthrough().parse(req.body);
    const data = await prisma.row.create({
      select: {
        id: true,
        json: true,
      },
      data: {
        json,
        bucket: {
          connectOrCreate: {
            where: {
              name: bucketName,
            },
            create: {
              name: bucketName,
            },
          },
        },
      },
    });

    res.status(200).json(data);
    return;
  }

  // list rows
  if (req.method === "GET") {
    const rows = await prisma.row.findMany({
      select: {
        id: true,
        json: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        bucket: {
          name: bucketName,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.status(200).json(rows);
    return;
  }

  res.status(405).end();
};

export default handler;
