function formatAmount(value: unknown): string {
  return Number((value as any) ?? 0).toFixed(2)
}

export { formatAmount }
