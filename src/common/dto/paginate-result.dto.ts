export class PaginateResultDto {
  data: Record<string, any>[];
  count: number;
  hasMore: boolean;
}
