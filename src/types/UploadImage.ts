export type UploadedImage = {
  id: string;
  name: string;
  url: string;
  tags?: string[]; // new optional tags field
  annotations?: any[]; // new optional annotations field, adjust type as needed
};
