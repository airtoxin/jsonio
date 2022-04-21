import { NextApiHandler } from "next";
import { z } from "zod";
import {
  CreateBucketResponse,
  CreateRowResponse,
  ListRowsResponse,
} from "./responseTypes";
import { stringToInt } from "../../../server/utils";
import { bucketService } from "../../../server/services/BucketService";
import { rowService } from "../../../server/services/RowService";
import { prisma } from "../../../server/dataSources/prisma";

export const handler: NextApiHandler = async (req, res) => {
  const parsed = z.object({ bucketName: z.string() }).safeParse(req.query);
  if (!parsed.success) return res.status(400).end() as unknown as void;
  const { bucketName } = parsed.data;
  const tokenId = req.headers.authorization?.startsWith("Bearer: ")
    ? req.headers.authorization.slice("Bearer: ".length)
    : null;
  if (tokenId == null) return res.status(401).end() as unknown as void;
  const token = await prisma.token.findUnique({ where: { id: tokenId } });
  if (token == null) return res.status(401).end() as unknown as void;

  // create bucket
  if (req.method === "PUT") {
    const createBucketResult = await bucketService.createBucket(
      bucketName,
      token.createdBy
    );
    const body: CreateBucketResponse = {
      name: createBucketResult.name,
      createdAt: createBucketResult.createdAt,
    };

    res.status(200).json(body);
    return;
  }

  // create row
  if (req.method === "POST") {
    const json = z.object({}).passthrough().parse(req.body);
    const createRowResult = await rowService.createRow(
      bucketName,
      json,
      token.createdBy
    );
    const body: CreateRowResponse = {
      id: createRowResult.id,
      json: createRowResult.json,
      createdAt: createRowResult.createdAt,
      updatedAt: createRowResult.updatedAt,
      bucket: {
        name: createRowResult.bucket.name,
        createdAt: createRowResult.bucket.createdAt,
        totalRows: createRowResult.bucket.totalRows,
      },
    };

    res.status(200).json(body);
    return;
  }

  // list rows
  if (req.method === "GET") {
    const { size = 100, page = 1 } = z
      .object({
        size: stringToInt((int) => 1 <= int && int <= 100).optional(),
        page: stringToInt((int) => 1 <= int).optional(),
      })
      .parse(req.query);
    const listRowsResult = await rowService.listRows(
      bucketName,
      token.createdBy,
      {
        size,
        page,
      }
    );

    const body: ListRowsResponse = {
      rows: listRowsResult.rows,
      bucket: {
        name: listRowsResult.bucket.name,
        createdAt: listRowsResult.bucket.createdAt,
        totalRows: listRowsResult.bucket.totalRows,
      },
    };
    res.status(200).json(body);
    return;
  }

  res.status(405).end();
};

export default handler;
