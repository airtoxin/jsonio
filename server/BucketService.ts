import { prisma as p, Prisma } from "./prisma";

export class BucketService {
  constructor(private prisma: Prisma = p) {}

  public async createBucket(bucketName: string): Promise<CreateBucketResult> {
    return this.prisma.bucket.create({
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      data: {
        name: bucketName,
      },
    });
  }

  public async deleteBucket(bucketName: string): Promise<DeleteBucketResult> {
    const bucket = await this.prisma.bucket.deleteMany({
      where: {
        name: bucketName,
      },
    });
    const rows = await this.prisma.row.deleteMany({
      where: {
        bucket: {
          name: bucketName,
        },
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
