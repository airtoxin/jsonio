export type CreateBucketResponse = {
  name: string;
  createdAt: Date;
};

export type CreateRowResponse = {
  id: number;
  json: any;
  createdAt: Date;
  updatedAt: Date;
};

export type ListRowsResponse = {
  total: number;
  rows: Array<{
    id: number;
    json: any;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

export type GetRowResponse = {
  id: number;
  json: any;
  createdAt: Date;
  updatedAt: Date;
};
