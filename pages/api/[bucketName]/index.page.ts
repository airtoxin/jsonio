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
import { authService } from "../../../server/services/AuthService";
import { ApplicationError } from "../../../server/errors";

export const handler: NextApiHandler = async (req, res) => {
  const { bucketName } = z.object({ bucketName: z.string() }).parse(req.query);
  const idToken = req.headers.authorization?.startsWith("Bearer: ")
    ? req.headers.authorization.slice("Bearer: ".length)
    : null;
  const account =
    idToken != null ? await authService.getAccount(idToken) : null;
  if (account instanceof ApplicationError)
    return res.status(401).end() as unknown as void;

  // create bucket
  if (req.method === "PUT") {
    const createBucketResult = await bucketService.createBucket(bucketName);
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
    const createRowResult = await rowService.createRow(bucketName, json);
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
    const listRowsResult = await rowService.listRows(bucketName, {
      size,
      page,
    });

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
