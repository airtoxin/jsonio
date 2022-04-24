import { prisma } from "../dataSources/prisma";
import { RowService } from "./RowService";

describe("createRow", () => {
  const createDefaultContext = async () => {
    const service = new RowService(prisma);
    const bucket = await prisma.bucket.create({
      data: {
        name: "test_bucket_createRow",
        createdBy: "test_user",
      },
    });
    return { service, bucket };
  };

  beforeEach(async () => {
    await prisma.bucket.deleteMany();
    await prisma.row.deleteMany();
  });
  afterEach(async () => {
    await prisma.bucket.deleteMany();
    await prisma.row.deleteMany();
  });

  it("should create row to existing bucket", async () => {
    const { service, bucket } = await createDefaultContext();
    const data = { testData: true };
    await service.createRow(bucket.name, data, "test_user");
    await expect(prisma.row.findMany()).resolves.toEqual([
      {
        id: expect.any(Number),
        json: data,
        bucketId: bucket.id,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    ]);
  });

  it("should create row and related bucket", async () => {
    const { service } = await createDefaultContext();
    const data = { testData: true };
    const bucketName = `test_bucket_name_${Math.random()}`;
    await service.createRow(bucketName, data, "test_user");
    await expect(prisma.row.findMany()).resolves.toEqual([
      {
        id: expect.any(Number),
        json: data,
        bucketId: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    ]);
    await expect(
      prisma.bucket.findUnique({
        where: { name_createdBy: { name: bucketName, createdBy: "test_user" } },
      })
    ).resolves.not.toBeNull();
  });

  it("should return created row and bucket data", async () => {
    const { service, bucket } = await createDefaultContext();
    const data = { testData: true };
    await expect(
      service.createRow(bucket.name, data, "test_user")
    ).resolves.toEqual({
      id: expect.any(Number),
      json: data,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      bucket: {
        id: bucket.id,
        name: bucket.name,
        createdAt: expect.any(Date),
        totalRows: 1,
      },
    });
  });
});

describe("getRow", () => {
  const createDefaultContext = async () => {
    const service = new RowService(prisma);
    const bucket = await prisma.bucket.create({
      include: {
        row: true,
      },
      data: {
        name: "test_bucket_getRow",
        createdBy: "test_user",
        row: {
          create: {
            json: { getRowTest: "data" },
          },
        },
      },
    });
    return { service, bucket };
  };

  beforeEach(async () => {
    await prisma.bucket.deleteMany();
    await prisma.row.deleteMany();
  });
  afterEach(async () => {
    await prisma.bucket.deleteMany();
    await prisma.row.deleteMany();
  });

  it("should return existing row", async () => {
    const { service, bucket } = await createDefaultContext();
    const row = bucket.row[0]!;
    await expect(
      service.getRow(bucket.name, "test_user", row.id)
    ).resolves.toEqual({
      id: row.id,
      json: row.json,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      bucket: {
        id: bucket.id,
        name: bucket.name,
        createdAt: bucket.createdAt,
        totalRows: 1,
      },
    });
  });

  it("should throw error when bucket doesn't exist", async () => {
    const { service, bucket } = await createDefaultContext();
    const row = bucket.row[0]!;
    await expect(
      service.getRow(`random_bucket_name_${Math.random()}`, "test_user", row.id)
    ).rejects.toThrowError();
  });

  it("should throw error when row doesn't exist", async () => {
    const { service, bucket } = await createDefaultContext();
    await expect(
      service.getRow(bucket.name, "test_user", -100)
    ).rejects.toThrowError();
  });
});

describe("listRows", () => {
  const createDefaultContext = async () => {
    const service = new RowService(prisma);
    const bucket = await prisma.bucket.create({
      include: {
        row: true,
      },
      data: {
        name: "test_bucket_listRows",
        createdBy: "test_user",
        row: {
          createMany: {
            data: [
              { json: { getRowTest: "data1" } },
              { json: { getRowTest: "data2" } },
              { json: { getRowTest: "data3" } },
              { json: { getRowTest: "data4" } },
              { json: { getRowTest: "data5" } },
            ],
          },
        },
      },
    });
    return { service, bucket };
  };

  beforeEach(async () => {
    await prisma.bucket.deleteMany();
    await prisma.row.deleteMany();
  });
  afterEach(async () => {
    await prisma.bucket.deleteMany();
    await prisma.row.deleteMany();
  });

  it("should return rows", async () => {
    const { service, bucket } = await createDefaultContext();
    await expect(
      service.listRows(bucket.name, "test_user", { size: 100, page: 1 })
    ).resolves.toEqual({
      bucket: {
        id: bucket.id,
        name: bucket.name,
        createdAt: expect.any(Date),
        totalRows: 5,
      },
      rows: bucket.row.map((row) => ({
        id: row.id,
        json: row.json,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })),
    });
  });

  it("should throw error when bucket doesn't exist", async () => {
    const { service } = await createDefaultContext();
    await expect(
      service.listRows(`test_bucket_listRows_${Math.random}`, "test_user", {
        size: 100,
        page: 1,
      })
    ).rejects.toThrowError();
  });

  it("should paginate", async () => {
    const { service, bucket } = await createDefaultContext();
    await expect(
      service.listRows(bucket.name, "test_user", {
        size: 2,
        page: 2,
      })
    ).resolves.toEqual({
      bucket: {
        id: bucket.id,
        name: bucket.name,
        createdAt: expect.any(Date),
        totalRows: 5,
      },
      rows: bucket.row.slice(2, 4).map((row) => ({
        id: row.id,
        json: row.json,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })),
    });
  });
});
