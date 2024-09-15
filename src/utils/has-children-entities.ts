import { FindOptionsWhere, Repository } from 'typeorm';

export async function hasChildEntities<T>(
  parentRepository: Repository<T>,
  parentId: number,
  relation: string,
): Promise<boolean> {
  const parentEntity = await parentRepository.findOne({
    where: { id: parentId } as unknown as FindOptionsWhere<T>,
    relations: [relation],
  });

  if (parentEntity && Array.isArray(parentEntity[relation])) {
    return parentEntity[relation].length > 0;
  }

  return false;
}
