import { NextApiHandler } from "next";
import { z } from "zod";
import { GetRowResponse } from "./responseTypes";
import { stringToInt } from "../../../server/utils";
import { rowService } from "../../../server/services/RowService";
import { prisma } from "../../../server/dataSources/prisma";

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

  res.status(405).end();
};

export default handler;
