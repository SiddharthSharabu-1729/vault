
'use client'

import { useEditor, EditorContent, EditorProvider, FloatingMenu, BubbleMenu } from '@tiptap/react'
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
    Code,
    Quote,
    Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

interface EditorProps {
    content: string;
    onChange: (richText: string) => void;
}


const EditorToolbar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-t-md border border-input bg-transparent p-2">
            <Button
                onClick={() => editor.chain().focus().toggleBold().run()}
                variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Bold"
                title="Bold"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Italic"
                title="Italic"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Strikethrough"
                title="Strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <div className="mx-1 h-6 w-px bg-border" />
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Heading 1"
                title="Heading 1"
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Heading 2"
                title="Heading 2"
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Heading 3"
                title="Heading 3"
            >
                <Heading3 className="h-4 w-4" />
            </Button>
            <div className="mx-1 h-6 w-px bg-border" />
            <Button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Bullet List"
                title="Bullet List"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
                size="icon"
                aria-label="Ordered List"
                title="Ordered List"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
        </div>
    )
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
                horizontalRule: false,
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class:
                    'prose prose-sm dark:prose-invert max-w-none min-h-[150px] rounded-b-md border-x border-b border-input bg-transparent px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            },
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML())
        },
    });

    return (
        <div className="flex flex-col">
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}
