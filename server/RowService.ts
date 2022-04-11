import { prisma as p, Prisma } from "./prisma";
import { Prisma as P } from "@prisma/client";
import assert from "assert";

export class RowService {
  constructor(private prisma: Prisma = p) {}

  public async createRow(
    bucketName: string,
    rowData: P.InputJsonValue
  ): Promise<CreateRowResult> {
    const result = await this.prisma.row.create({
      select: {
        id: true,
        json: true,
        createdAt: true,
        updatedAt: true,
        bucket: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            _count: {
              select: {
                row: true,
              },
            },
          },
        },
      },
      data: {
        json: rowData,
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

    assert(result.bucket, "bucket of row result should be non-empty");
    return {
      id: result.id,
      json: result.json,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      bucket: {
        id: result.bucket.id,
        name: result.bucket.name,
        createdAt: result.bucket.createdAt,
        totalRows: result.bucket._count.row,
      },
    };
  }

  public async getRow(
    bucketName: string,
    rowId: number
  ): Promise<GetRowResult> {
    const row = await this.prisma.row.findFirst({
      select: {
        id: true,
        json: true,
        createdAt: true,
        updatedAt: true,
        bucket: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            _count: {
              select: {
                row: true,
              },
            },
          },
        },
      },
      where: {
        id: rowId,
        bucket: {
          name: bucketName,
        },
      },
    });
    assert(row, "row not found");
    assert(row.bucket, "bucket of row result should be non-empty");
    return {
      id: row.id,
      json: row.json,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      bucket: {
        id: row.bucket.id,
        name: row.bucket.name,
        createdAt: row.bucket.createdAt,
        totalRows: row.bucket._count.row,
      },
    };
  }

  public async listRows(
    bucketName: string,
    { size, page }: { size: number; page: number }
  ): Promise<ListRowsResult> {
    const bucket = await this.prisma.bucket.findUnique({
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            row: true,
          },
        },
      },
      where: {
        name: bucketName,
      },
    });
    assert(bucket, "Bucket not found");
    const rows = await this.prisma.row.findMany({
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
      take: size,
      skip: (page - 1) * size,
    });

    return {
      rows,
      bucket: {
        id: bucket.id,
        name: bucket.name,
        createdAt: bucket.createdAt,
        totalRows: bucket._count.row,
      },
    };
  }
}

export type CreateRowResult = {
  id: number;
  json: unknown;
  createdAt: Date;
  updatedAt: Date;
  bucket: {
    id: number;
    name: string;
    createdAt: Date;
    totalRows: number;
  };
};

export type GetRowResult = {
  id: number;
  json: unknown;
  createdAt: Date;
  updatedAt: Date;
  bucket: {
    id: number;
    name: string;
    createdAt: Date;
    totalRows: number;
  };
};

export type ListRowsResult = {
  rows: Array<{
    id: number;
    json: unknown;
    createdAt: Date;
    updatedAt: Date;
  }>;
  bucket: {
    id: number;
    name: string;
    createdAt: Date;
    totalRows: number;
  };
};

export const rowService = new RowService();
