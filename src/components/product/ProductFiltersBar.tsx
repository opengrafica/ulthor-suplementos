import { Input, Select } from '@/components/ui/Input'
import { CATEGORIES } from '@/lib/constants'
import type { ProductFilters } from '@/types'

interface ProductFiltersBarProps {
  filters: ProductFilters
  onChange: (filters: ProductFilters) => void
}

export function ProductFiltersBar({ filters, onChange }: ProductFiltersBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Input
        label="Buscar"
        placeholder="Nome do produto..."
        value={filters.search || ''}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />
      <Select
        label="Categoria"
        value={filters.categoria || ''}
        onChange={(e) => onChange({ ...filters, categoria: e.target.value || undefined })}
        options={[
          { value: '', label: 'Todas as categorias' },
          ...CATEGORIES.map((c) => ({ value: c.nome, label: c.nome })),
        ]}
      />
      <Input
        label="Preço mínimo"
        type="number"
        placeholder="R$ 0,00"
        value={filters.precoMin ?? ''}
        onChange={(e) => onChange({ ...filters, precoMin: e.target.value ? Number(e.target.value) : undefined })}
      />
      <Input
        label="Preço máximo"
        type="number"
        placeholder="R$ 999,99"
        value={filters.precoMax ?? ''}
        onChange={(e) => onChange({ ...filters, precoMax: e.target.value ? Number(e.target.value) : undefined })}
      />
    </div>
  )
}
