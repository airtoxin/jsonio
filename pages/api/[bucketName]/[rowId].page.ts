import { NextApiHandler } from "next";
import { z } from "zod";
import { GetRowResponse } from "./responseTypes";
import { stringToInt } from "../../../server/utils";
import { rowService } from "../../../server/RowService";

export const handler: NextApiHandler = async (req, res) => {
  const { bucketName, rowId } = z
    .object({
      bucketName: z.string(),
      rowId: stringToInt(),
    })
    .parse(req.query);

  // get row
  if (req.method === "GET") {
    const getRowResult = await rowService.getRow(bucketName, rowId);
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
