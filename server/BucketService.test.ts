import { prisma } from "./prisma";
import { BucketService } from "./BucketService";

describe("createBucket", () => {
  const createDefaultContext = () => {
    const service = new BucketService(prisma);
    return { service };
  };

  beforeEach(async () => {
    await prisma.bucket.deleteMany();
    await prisma.row.deleteMany();
  });
  afterEach(async () => {
    await prisma.bucket.deleteMany();
    await prisma.row.deleteMany();
  });

  it("should create bucket", async () => {
    const { service } = createDefaultContext();
    await service.createBucket("test_bucket");
    await expect(prisma.bucket.findMany()).resolves.toEqual([
      {
        id: expect.any(Number),
        name: "test_bucket",
        createdAt: expect.any(Date),
      },
    ]);
  });

  it("should return created bucket result", async () => {
    const { service } = createDefaultContext();
    await expect(service.createBucket("test_bucket")).resolves.toEqual({
      id: expect.any(Number),
      name: "test_bucket",
      createdAt: expect.any(Date),
    });
  });

  it("should not create row", async () => {
    const { service } = createDefaultContext();
    await service.createBucket("test_bucket");
    await expect(prisma.row.findMany()).resolves.toEqual([]);
  });
});

describe("deleteBucket", () => {
  const createDefaultContext = async () => {
    const service = new BucketService(prisma);
    const bucket1 = await prisma.bucket.create({
      data: {
        name: "test_bucket1",
      },
    });
    const row1 = await prisma.row.create({
      data: {
        json: { row: 1 },
        bucket: {
          connect: {
            id: bucket1.id,
          },
        },
      },
    });
    const row2 = await prisma.row.create({
      data: {
        json: { row: 2 },
        bucket: {
          connect: {
            id: bucket1.id,
          },
        },
      },
    });
    const bucket2 = await prisma.bucket.create({
      data: {
        name: "test_bucket2",
      },
    });
    const row3 = await prisma.row.create({
      data: {
        json: { row: 3 },
        bucket: {
          connect: {
            id: bucket2.id,
          },
        },
      },
    });
    const row4 = await prisma.row.create({
      data: {
        json: { row: 4 },
        bucket: {
          connect: {
            id: bucket2.id,
          },
        },
      },
    });
    return {
      service,
      buckets: [bucket1, bucket2],
      bucket1Rows: [row1, row2],
      bucket2Rows: [row3, row4],
    };
  };

  beforeEach(async () => {
    await prisma.bucket.deleteMany();
    await prisma.row.deleteMany();
  });

  it("should delete bucket", async () => {
    const { service, buckets } = await createDefaultContext();
    await service.deleteBucket(buckets[0]!.name);
    await expect(prisma.bucket.findMany()).resolves.toEqual(buckets.slice(1));
  });

  it("should delete related rows", async () => {
    const { service, buckets, bucket2Rows } = await createDefaultContext();
    await service.deleteBucket(buckets[0]!.name);
    await expect(prisma.row.findMany()).resolves.toEqual(bucket2Rows);
  });

  it("should return deleted counts", async () => {
    const { service, buckets } = await createDefaultContext();
    await expect(service.deleteBucket(buckets[0]!.name)).resolves.toEqual({
      bucket: 1,
      rows: 2,
    });
  });
});
