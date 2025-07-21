
'use client'

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorProps {
    content: string;
    onChange: (richText: string) => void;
}

export function Editor({ content, onChange }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                bulletList: {
                    itemTypeName: 'listItem',
                    HTMLAttributes: {
                        class: 'list-disc pl-4',
                    },
                },
                orderedList: {
                    itemTypeName: 'listItem',
                    HTMLAttributes: {
                        class: 'list-decimal pl-4',
                    },
                },
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class:
                    'prose prose-sm prose-invert max-w-none min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            },
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML())
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <>
            <BubbleMenu
                editor={editor}
                tippyOptions={{ duration: 100 }}
                className="flex items-center gap-1 rounded-md border bg-card p-1 text-card-foreground shadow-lg"
            >
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn('p-2 rounded hover:bg-muted', { 'is-active bg-muted': editor.isActive('bold') })}
                    aria-label="Bold"
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn('p-2 rounded hover:bg-muted', { 'is-active bg-muted': editor.isActive('italic') })}
                    aria-label="Italic"
                >
                    <Italic className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={cn('p-2 rounded hover:bg-muted', { 'is-active bg-muted': editor.isActive('strike') })}
                    aria-label="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </button>
                <div className="mx-1 h-6 w-px bg-border" />
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn('p-2 rounded hover:bg-muted', { 'is-active bg-muted': editor.isActive('heading', { level: 1 }) })}
                    aria-label="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn('p-2 rounded hover:bg-muted', { 'is-active bg-muted': editor.isActive('heading', { level: 2 }) })}
                    aria-label="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn('p-2 rounded hover:bg-muted', { 'is-active bg-muted': editor.isActive('bulletList') })}
                    aria-label="Bullet List"
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn('p-2 rounded hover:bg-muted', { 'is-active bg-muted': editor.isActive('orderedList') })}
                    aria-label="Ordered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </button>
            </BubbleMenu>

            <EditorContent editor={editor} />
        </>
    )
}
