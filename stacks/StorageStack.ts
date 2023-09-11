import { Bucket, StackContext } from "sst/constructs";

export function StorageStack({ stack, app }: StackContext) {
  const bucket = new Bucket(stack, `${app.name}-bucket`);

  stack.addOutputs({
    BucketName: bucket.bucketName,
    BucketRegion: app.region,
  });

  return {
    bucket,
  };
}
