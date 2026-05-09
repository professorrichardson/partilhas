import { Bold, Heading2, Italic, List, ListOrdered, Pilcrow } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { normalizeRichText } from '../../lib/richText'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

type EditorAction = {
  label: string
  icon: typeof Bold
  command: string
  value?: string
}

const actions: EditorAction[] = [
  { label: 'Parágrafo', icon: Pilcrow, command: 'formatBlock', value: 'p' },
  { label: 'Título', icon: Heading2, command: 'formatBlock', value: 'h2' },
  { label: 'Negrito', icon: Bold, command: 'bold' },
  { label: 'Itálico', icon: Italic, command: 'italic' },
  { label: 'Lista', icon: List, command: 'insertUnorderedList' },
  { label: 'Lista numerada', icon: ListOrdered, command: 'insertOrderedList' },
]

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escreva aqui...',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!editorRef.current) {
      return
    }

    const normalizedValue = normalizeRichText(value)

    if (editorRef.current.innerHTML !== normalizedValue) {
      editorRef.current.innerHTML = normalizedValue
    }
  }, [value])

  function runCommand(command: string, commandValue?: string) {
    const editor = editorRef.current

    if (!editor) {
      return
    }

    editor.focus()

    // O execCommand é antigo, mas aqui resolve bem um editor leve com toolbar simples.
    document.execCommand(command, false, commandValue)
    onChange(editor.innerHTML)
  }

  return (
    <div className="rich-editor">
      <div className="rich-toolbar">
        {actions.map(({ label, icon: Icon, command, value: actionValue }) => (
          <button
            key={label}
            type="button"
            className="toolbar-button"
            title={label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(command, actionValue)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div
        ref={editorRef}
        className="rich-editor-surface"
        contentEditable
        data-placeholder={placeholder}
        onInput={(event) => onChange((event.currentTarget as HTMLDivElement).innerHTML)}
        suppressContentEditableWarning
      />
    </div>
  )
}
