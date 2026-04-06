'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import { stepPhotosSchema, type StepPhotosData } from '@/lib/validations'

interface StepPhotosProps {
  initialPhotos: File[]
  onComplete: (data: StepPhotosData) => void
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export function StepPhotos({ initialPhotos, onComplete }: StepPhotosProps) {
  const [photos, setPhotos] = useState<File[]>(initialPhotos)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StepPhotosData>({
    resolver: zodResolver(stepPhotosSchema),
    defaultValues: { photos: initialPhotos },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploadError(null)
    const files = Array.from(e.target.files ?? [])

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setUploadError('Only JPEG, PNG, and HEIC photos are accepted.')
        return
      }
      if (file.size > MAX_SIZE_BYTES) {
        setUploadError('Each photo must be under 10MB.')
        return
      }
    }

    const updated = [...photos, ...files].slice(0, 3)
    setPhotos(updated)
    setValue('photos', updated, { shouldValidate: true })
    // Reset input so the same file can be re-selected after removal
    e.target.value = ''
  }

  function removePhoto(index: number) {
    const updated = photos.filter((_, i) => i !== index)
    setPhotos(updated)
    setValue('photos', updated, { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(onComplete)} className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Add photos</h1>
        <p className="text-sm text-gray-500">
          Start with the back cover — that's where the barcode is. Up to 3 photos.
        </p>
      </div>

      {/* Upload zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
      >
        <p className="text-4xl mb-2">📷</p>
        <p className="text-sm font-medium text-gray-700">Tap to take or choose a photo</p>
        <p className="text-xs text-gray-400 mt-1">JPEG, PNG, or HEIC · Max 10MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
          multiple
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}

      {/* Thumbnails */}
      {photos.length > 0 && (
        <div className="flex gap-3">
          {photos.map((photo, i) => (
            <div key={i} className="relative w-24 h-24">
              <img
                src={URL.createObjectURL(photo)}
                alt={`Photo ${i + 1}`}
                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-white rounded-full text-xs flex items-center justify-center"
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ))}
          {photos.length < 3 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg text-2xl text-gray-400 flex items-center justify-center"
              aria-label="Add another photo"
            >
              +
            </button>
          )}
        </div>
      )}

      {errors.photos && (
        <p className="text-sm text-red-600">{errors.photos.message}</p>
      )}

      <button
        type="submit"
        className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl text-base mt-auto disabled:opacity-50"
        disabled={photos.length === 0}
      >
        Continue
      </button>
    </form>
  )
}
