import { prisma as p, Prisma } from "../dataSources/prisma";

export class BucketService {
  constructor(private prisma: Prisma = p) {}

  public async createBucket(
    bucketName: string,
    createdBy: string
  ): Promise<CreateBucketResult> {
    return this.prisma.bucket.upsert({
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      where: {
        name_createdBy: {
          name: bucketName,
          createdBy,
        },
      },
      create: {
        name: bucketName,
        createdBy,
      },
      update: {
        name: bucketName,
        createdBy,
      },
    });
  }

  public async deleteBucket(
    bucketName: string,
    createdBy: string
  ): Promise<DeleteBucketResult> {
    const rows = await this.prisma.row.deleteMany({
      where: {
        bucket: {
          name: bucketName,
          createdBy,
        },
      },
    });
    const bucket = await this.prisma.bucket.deleteMany({
      where: {
        name: bucketName,
        createdBy,
      },
    });
    return {
      bucket: bucket.count,
      rows: rows.count,
    };
  }
}

export type CreateBucketResult = {
  id: number;
  name: string;
  createdAt: Date;
};

export type DeleteBucketResult = {
  bucket: number;
  rows: number;
};

export const bucketService = new BucketService();
