import { useRef, useState } from 'react'
import './FileDropZone.css'

interface Props {
  label: string
  accept: string
  file: File | null
  onFile: (file: File | null) => void
}

export function FileDropZone({ label, accept, file, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  return (
    <div
      className={`dropzone ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        onFile(e.dataTransfer.files[0] ?? null)
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      <span className="dropzone__label">{label}</span>
      <span className="dropzone__file">
        {file ? file.name : 'Drop a file or click to choose'}
      </span>
      {file && (
        <button
          type="button"
          className="dropzone__clear"
          onClick={(e) => {
            e.stopPropagation()
            onFile(null)
            if (inputRef.current) inputRef.current.value = ''
          }}
        >
          Clear
        </button>
      )}
    </div>
  )
}
