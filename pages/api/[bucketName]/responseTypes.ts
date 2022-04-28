export type CreateBucketResponse = {
  name: string;
  createdAt: Date;
};

export type DeleteBucketResponse = {
  success: boolean;
  rows: number;
};

export type CreateRowResponse = {
  id: number;
  json: any;
  createdAt: Date;
  updatedAt: Date;
  bucket: {
    name: string;
    createdAt: Date;
    totalRows: number;
  };
};

export type ListRowsResponse = {
  rows: Array<{
    id: number;
    json: any;
    createdAt: Date;
    updatedAt: Date;
  }>;
  bucket: {
    name: string;
    createdAt: Date;
    totalRows: number;
  };
};

export type GetRowResponse = {
  id: number;
  json: any;
  createdAt: Date;
  updatedAt: Date;
  bucket: {
    name: string;
    createdAt: Date;
    totalRows: number;
  };
};

export type UpdateRowResponse = GetRowResponse;

export type DeleteRowResponse = {
  success: boolean;
};
