/** 找出 next 中相对 prev 新增的 id（保持 next 中的相对顺序） */
export function diffUnlocked(prev: Set<string>, next: Set<string>): string[] {
  const added: string[] = []
  next.forEach((id) => {
    if (!prev.has(id))
      added.push(id)
  })
  return added
}
