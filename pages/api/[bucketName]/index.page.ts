import { NextApiHandler } from "next";
import { prisma } from "../../../server/prisma";
import { z } from "zod";
import {
  CreateBucketResponse,
  CreateRowResponse,
  ListRowsResponse,
} from "./responseTypes";

export const handler: NextApiHandler = async (req, res) => {
  const { bucketName } = z.object({ bucketName: z.string() }).parse(req.query);

  // create bucket
  if (req.method === "PUT") {
    const body: CreateBucketResponse = await prisma.bucket.create({
      select: {
        name: true,
        createdAt: true,
      },
      data: {
        name: bucketName,
      },
    });

    res.status(200).json(body);
    return;
  }

  // create row
  if (req.method === "POST") {
    const json = z.object({}).passthrough().parse(req.body);
    const body: CreateRowResponse = await prisma.row.create({
      select: {
        id: true,
        json: true,
        createdAt: true,
        updatedAt: true,
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

    res.status(200).json(body);
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

    const body: ListRowsResponse = {
      rows,
    };
    res.status(200).json(body);
    return;
  }

  res.status(405).end();
};

export default handler;
