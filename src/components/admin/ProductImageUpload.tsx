import { useRef, useState } from 'react'
import { Upload, ImageIcon, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { adminService } from '@/services/admin.service'

interface ProductImageUploadProps {
  value: string
  onChange: (url: string) => void
  error?: string
}

const MAX_SIZE_MB = 5
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function ProductImageUpload({ value, onChange, error }: ProductImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleFile = async (file: File) => {
    setUploadError('')

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Use JPG, PNG, WebP ou GIF.')
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`A imagem deve ter no máximo ${MAX_SIZE_MB}MB.`)
      return
    }

    setUploading(true)
    try {
      const url = await adminService.uploadProductImage(file)
      onChange(url)
    } catch {
      setUploadError('Erro ao enviar a imagem. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-ulthor-gray-300">Imagem do Produto</label>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ulthor-gray-600 bg-ulthor-gray-800">
          {value ? (
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-10 w-10 text-ulthor-gray-600" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            capture="environment"
            className="hidden"
            onChange={onInputChange}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-ulthor-gold/50 bg-ulthor-gold/5 px-4 py-6 text-sm text-ulthor-gold transition-colors hover:bg-ulthor-gold/10 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Enviando imagem...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Importar do celular ou PC
              </>
            )}
          </button>
          <p className="text-xs text-ulthor-gray-500">JPG, PNG, WebP ou GIF — máx. {MAX_SIZE_MB}MB</p>
        </div>
      </div>

      {(uploadError || error) && (
        <p className="text-sm text-red-400">{uploadError || error}</p>
      )}

      <Input
        label="Ou cole a URL da imagem"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
      />
    </div>
  )
}
