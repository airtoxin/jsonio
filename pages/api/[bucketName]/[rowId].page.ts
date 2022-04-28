import { NextApiHandler } from "next";
import { z } from "zod";
import {
  DeleteRowResponse,
  GetRowResponse,
  UpdateRowResponse,
} from "./responseTypes";
import { stringToInt } from "@/server/utils";
import { rowService } from "@/server/services/RowService";
import { prisma } from "@/server/dataSources/prisma";

export const handler: NextApiHandler = async (req, res) => {
  const parsed = z
    .object({
      bucketName: z.string(),
      rowId: stringToInt(),
    })
    .safeParse(req.query);
  if (!parsed.success) return res.status(400).end() as unknown as void;
  const { bucketName, rowId } = parsed.data;
  const tokenId = req.headers.authorization?.startsWith("Bearer: ")
    ? req.headers.authorization.slice("Bearer: ".length)
    : null;
  if (tokenId == null) return res.status(401).end() as unknown as void;
  const token = await prisma.token.findUnique({ where: { id: tokenId } });
  if (token == null) return res.status(401).end() as unknown as void;

  // get row
  if (req.method === "GET") {
    const getRowResult = await rowService.getRow(
      bucketName,
      token.createdBy,
      rowId
    );
    const body: GetRowResponse = {
      id: getRowResult.id,
      json: getRowResult.json,
      createdAt: getRowResult.createdAt,
      updatedAt: getRowResult.updatedAt,
      bucket: {
        name: getRowResult.bucket.name,
        createdAt: getRowResult.bucket.createdAt,
        totalRows: getRowResult.bucket.totalRows,
      },
    };
    return res.status(200).json(body);
  }

  // update row
  if (req.method === "POST") {
    const json = z.object({}).passthrough().parse(req.body);
    const updateRowResult = await rowService.updateRow(
      bucketName,
      token.createdBy,
      rowId,
      json
    );
    const body: UpdateRowResponse = {
      id: updateRowResult.id,
      json: updateRowResult.json,
      createdAt: updateRowResult.createdAt,
      updatedAt: updateRowResult.updatedAt,
      bucket: {
        name: updateRowResult.bucket.name,
        createdAt: updateRowResult.bucket.createdAt,
        totalRows: updateRowResult.bucket.totalRows,
      },
    };
    return res.status(200).json(body);
  }

  // delete row
  if (req.method === "DELETE") {
    const deleteRowResult = await rowService.deleteRow(
      bucketName,
      token.createdBy,
      rowId
    );
    const body: DeleteRowResponse = {
      success: deleteRowResult.success,
    };
    return res.status(200).json(body);
  }

  res.status(405).end();
};

export default handler;
